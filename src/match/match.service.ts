import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  Match,
  MatchMove,
  MatchMoveInput,
  MatchParticipant,
} from './match.entity';
import { Chess } from 'chess.js/chess';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchMove)
    private matchMoveRepository: Repository<MatchMove>,
    @InjectRepository(MatchParticipant)
    private participantRepository: Repository<MatchParticipant>,
  ) {}

  async matchById(id: string): Promise<Match> {
    return this.matchRepository.findOne(id);
  }

  async availableMatches(): Promise<Match[]> {
    const matches = await this.matchRepository.find({ take: 50 });
    return matches.filter(m => m.participants.length <= 1);
  }

  async createMatch(creator: string): Promise<Match> {
    const chess = new Chess();

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
      });

      await this.participantRepository.save({
        match,
        side: 'w',
        user: { id: creator },
      });
      return match;
    });

    return transaction;
  }

  async joinMatch(id: string): Promise<Match> {
    const match = await this.matchById(id);
    //TODO - Join
    return match;
  }

  async matchMove(token: string, input: MatchMoveInput): Promise<Match> {
    const { id, from, to, promotion = 'q' } = input;
    const storedMatch = await this.matchById(id);

    const { gameOver } = storedMatch;
    if (gameOver) {
      throw new BadRequestException({ message: 'Match has already ended' });
    }

    // const { participants } = storedMatch;
    // const self = participants.find(p => p.user.id == token);
    // if (!self)
    //   throw new BadRequestException({ message: 'You are not a participant' });

    // if (self.side !== storedMatch.turn)
    //   throw new BadRequestException({ message: 'Not your turn' });

    const { pgn } = storedMatch;
    const chess = new Chess();
    pgn && chess.load_pgn(pgn);
    const move = chess.move({ from, to, promotion, verbose: true });
    if (!move) throw new BadRequestException({ message: 'Illegal move' });

    const { captured: moveCapture = null, color } = move;
    if (moveCapture)
      storedMatch.captured.push(`${color === 'w' ? 'b' : 'w'}${moveCapture}`);

    storedMatch.fen = chess.fen();
    storedMatch.turn = chess.turn();
    storedMatch.pgn = chess.pgn();
    storedMatch.draw = chess.in_draw();
    storedMatch.gameOver = chess.game_over();
    storedMatch.checkmate = chess.in_checkmate();
    storedMatch.stalemate = chess.in_stalemate();
    storedMatch.threefold = chess.in_threefold_repetition();

    const newMatch = await this.matchRepository.save({
      ...storedMatch,
      moves: [
        ...storedMatch.moves,
        {
          ...move,
          user: { id: token },
          fen: chess.fen(),
          match: storedMatch.id,
        },
      ],
    });
    await this.matchMoveRepository.save({
      ...move,
      user: { id: token },
      fen: chess.fen(),
      match: storedMatch.id,
    });
    return newMatch;
  }
}
