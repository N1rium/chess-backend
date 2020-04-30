import { Injectable, BadRequestException } from '@nestjs/common';
import {
  Match,
  MatchMoveInput,
  MatchParticipant,
  CreateMatchInput,
} from './match.entity';
import { Chess } from 'chess.js/chess';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchParticipant)
    private participantRepository: Repository<MatchParticipant>,
  ) {}

  async matchById(id: string): Promise<Match> {
    return this.matchRepository.findOne(id);
  }

  async availableMatches(): Promise<Match[]> {
    return this.matchRepository.find({
      order: {
        createdDate: 'DESC',
      },
      take: 50,
    });
  }

  async myMatches(id: string): Promise<Match[]> {
    return this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('user.id=:id')
      .setParameter('id', id)
      .getMany();
  }

  async userOngoingMatches(id: string): Promise<Match[]> {
    return this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('user.id=:id')
      .andWhere('match.gameOver=false')
      .setParameter('id', id)
      .getMany();
  }

  async userFinishedMatches(id: string): Promise<Match[]> {
    return this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('user.id=:id')
      .andWhere('match.gameOver=true')
      .setParameter('id', id)
      .getMany();
  }

  async createMatch(creator: string, input: CreateMatchInput): Promise<Match> {
    const chess = new Chess();

    // Date format according to: https://sv.wikipedia.org/wiki/Portable_Game_Notation
    const date = new Date().toISOString().split('T');
    chess.header(
      'Date',
      date[0].replace(/-/g, '.'),
      'Time',
      date[1].split('.')[0],
      'Mode',
      'ICS',
      'Site',
      'https://chessports.com',
      'Round',
      '-',
      'Annotator',
      'Chessports',
    );

    const { side = 'w', opponent, timeControl, increment } = input;

    if (creator == opponent)
      throw new BadRequestException({
        message: 'The same user cant take both sides',
      });

    const transaction = await getManager().transaction(async manager => {
      const match = await this.matchRepository.save({
        fen: chess.fen(),
        turn: chess.turn(),
        draw: chess.in_draw(),
        gameOver: chess.game_over(),
        pgn: chess.pgn(),
        checkmate: chess.in_checkmate(),
        stalemate: chess.in_stalemate(),
        threefold: chess.in_threefold_repetition(),
        captured: [],
        timeControl,
        increment,
      });

      const participants = [
        {
          match,
          side,
          user: { id: creator },
          pendingTimeoutDate: Date.now() + timeControl * 1000 * 60,
          time: timeControl * 1000 * 60,
        },
      ];

      if (opponent) {
        participants.push({
          match,
          side: side === 'w' ? 'b' : 'w',
          user: { id: opponent },
          pendingTimeoutDate: Date.now() + timeControl * 1000 * 60,
          time: timeControl * 1000 * 60,
        });
      }

      await this.participantRepository.save(participants);

      return match;
    });

    return transaction;
  }

  async joinMatch(id: string, userId: string): Promise<Match> {
    const match = await this.matchById(id);
    const { participants = [] } = match;
    if (participants.length >= 2)
      throw new BadRequestException({ message: 'Match is full' });
    if (participants.map(p => p.user.id).includes(userId))
      throw new BadRequestException({ message: 'Already part of match' });

    const side = participants.length == 0 ? 'w' : 'b';

    await this.participantRepository.save({
      match,
      side,
      user: { id: userId },
    });
    return match;
  }

  async matchMove(userId: string, input: MatchMoveInput): Promise<Match> {
    const { id, from, to, promotion = 'q' } = input;
    const storedMatch = await this.matchById(id);

    if (storedMatch.gameOver)
      throw new BadRequestException({ message: 'Match has already ended' });

    // const { participants } = storedMatch;
    // const self = participants.find(p => p.user.id == token);
    // if (!self)
    //   throw new BadRequestException({ message: 'You are not a participant' });

    // if (self.side !== storedMatch.turn)
    //   throw new BadRequestException({ message: 'Not your turn' });

    const { pgn, participants } = storedMatch;
    const chess = new Chess();
    pgn && chess.load_pgn(pgn);

    const self = participants.find(p => p.user.id === userId);
    const opponent = participants.find(p => p.user.id !== userId);

    const { pendingTimeoutDate } = self;
    let pendingGameOver = false;
    if (pendingTimeoutDate < Date.now()) {
      pendingGameOver = true;
      if (self.side === chess.turn()) self.winner = true;
      else opponent.winner = true;
    }

    if (!pendingGameOver) {
      const move = chess.move({ from, to, promotion, verbose: true });
      if (!move) throw new BadRequestException({ message: 'Illegal move' });
      self.time = pendingTimeoutDate - Date.now();

      const { time } = opponent;
      opponent.pendingTimeoutDate = +Date.now() + +time;

      if (chess.game_over()) {
        if (chess.in_draw()) {
        } else {
          if (self.side === chess.turn()) opponent.winner = true;
          else self.winner = true;
        }
      }
    }

    storedMatch.gameOver = pendingGameOver || chess.game_over();
    storedMatch.fen = chess.fen();
    storedMatch.turn = chess.turn();
    storedMatch.pgn = chess.pgn();
    storedMatch.draw = chess.in_draw();
    storedMatch.checkmate = chess.in_checkmate();
    storedMatch.stalemate = chess.in_stalemate();
    storedMatch.threefold = chess.in_threefold_repetition();

    await this.participantRepository.save([self, opponent]);

    const newMatch = await this.matchRepository.save(storedMatch);
    return newMatch;
  }
}
