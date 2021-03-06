import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { MatchMoveInput, CreateMatchInput } from './match.entity';
import { Chess } from 'chess.js/chess';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { PubSubEngine } from 'graphql-subscriptions';
import { eloChange, getRatingFromTimeControl } from '../util/chess-helper';
import { User } from 'src/user/user.entity';
import { Match, MatchType } from './entity/match.entity';
import { MatchParticipant } from './entity/match-participant';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/notification.entity';

@Injectable()
export class MatchService {
  constructor(
    private notificationService: NotificationService,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchParticipant)
    private participantRepository: Repository<MatchParticipant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
  ) {}

  async matchById(id: string): Promise<Match> {
    return this.matchRepository.findOne(id);
  }

  addSelfToMatches(id: string, matches: Match[]): Match[] {
    return matches.map(m => this.addSelfToMatch(id, m));
  }

  addSelfToMatch(id: string, match: Match): Match {
    const result = { ...match };
    const { participants = [] } = result;
    result.self = participants.find(p => p.user.id == id) || null;
    result.opponent = participants.find(p => p.user.id != id) || null;
    return result;
  }

  async myMatches(id: string): Promise<Match[]> {
    let matches = await this.matchRepository
      .createQueryBuilder('match')
      .innerJoin(
        query => {
          return query
            .from(MatchParticipant, 'p')
            .select('p."matchId"')
            .where('p."userId" = :id');
        },
        'selfMatch',
        '"selfMatch"."matchId" = match.id',
      )
      .leftJoinAndSelect('match.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .setParameter('id', id)
      .getMany();

    matches = this.addSelfToMatches(id, matches);
    return matches;
  }

  async userOngoingMatches(id: string, self?: boolean): Promise<Match[]> {
    let matches = await this.matchRepository
      .createQueryBuilder('match')
      .innerJoin(
        query => {
          return query
            .from(MatchParticipant, 'p')
            .select('p."matchId"')
            .where('p."userId" = :id');
        },
        'selfMatch',
        '"selfMatch"."matchId" = match.id',
      )
      .leftJoinAndSelect('match.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .setParameter('id', id)
      .where('match.gameOver = false')
      .orderBy('match.updatedDate', 'DESC')
      .getMany();
    if (self === true) {
      matches = this.addSelfToMatches(id, matches);
    }
    return matches;
  }

  async userFinishedMatches(id: string, self?: boolean): Promise<Match[]> {
    let matches = await this.matchRepository
      .createQueryBuilder('match')
      .innerJoin(
        query => {
          return query
            .from(MatchParticipant, 'p')
            .select('p."matchId"')
            .where('p."userId" = :id');
        },
        'selfMatch',
        '"selfMatch"."matchId" = match.id',
      )
      .leftJoinAndSelect('match.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .setParameter('id', id)
      .where('match.gameOver = true')
      .orderBy('match.updatedDate', 'DESC')
      .getMany();

    if (self === true) {
      matches = this.addSelfToMatches(id, matches);
    }
    return matches;
  }

  async createMatch(creator: string, input: CreateMatchInput): Promise<Match> {
    const chess = new Chess();
    chess.header('Annotator', 'Chessports');

    const { side = 'w', opponent, timeControl, increment, rated } = input;
    const hasCreator = creator != undefined && creator != null;
    const hasOpponent = opponent != undefined && opponent != null;

    if (rated == true && (!hasCreator || !hasOpponent))
      throw new BadRequestException({
        message: 'Cant create a rated match with insufficient participants',
      });

    const type = MatchType[getRatingFromTimeControl(timeControl, increment)];

    if (creator == opponent)
      throw new BadRequestException({
        message: 'The same user cant take both sides',
      });

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
      rated,
      type,
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

    if (opponent != undefined && opponent != null) {
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

    const { pgn, participants, rated, type } = storedMatch;
    const chess = new Chess();
    pgn && chess.load_pgn(pgn);

    const self = participants.find(p => p.user.id === userId);
    const opponent = participants.find(p => p.user.id !== userId);

    const { pendingTimeoutDate } = self;
    let pendingGameOver = false;
    if (pendingTimeoutDate < Date.now()) {
      storedMatch.timedout = true;
      pendingGameOver = true;
      if (self.side === chess.turn()) {
        opponent.time = 0;
        opponent.winner = true;
      } else {
        self.time = 0;
        self.winner = true;
      }
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

    this.pubSub.publish('matchMoveMade', { matchMoveMade: storedMatch });

    const newMatch = await this.matchRepository.save(storedMatch);
    if (newMatch.gameOver && rated) {
      const whitePlayer = self.side === 'w' ? self : opponent;
      const blackPlayer = self.side === 'b' ? self : opponent;

      /* Create notifications */
      this.notificationService.createMany(
        [whitePlayer.user.id, blackPlayer.user.id],
        false,
        newMatch,
        NotificationType.MATCH_ENDED,
      );
      await this.distributeElo(whitePlayer, blackPlayer, type);
    }

    await this.participantRepository.save([self, opponent]);
    return newMatch;
  }

  async distributeElo(
    white: MatchParticipant,
    black: MatchParticipant,
    type: MatchType,
  ): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id=:id', { id: white.user.id })
      .orWhere('user.id=:otherId', { otherId: black.user.id })
      .getMany();

    const types = {
      BLITZ: 'blitzElo',
      RAPID: 'rapidElo',
      BULLET: 'bulletElo',
      CLASSICAL: 'classicalElo',
    };

    const eloType = types[type];

    const whiteUser = users.find(u => u.id === white.user.id);
    const blackUser = users.find(u => u.id === black.user.id);

    const whiteResult = white.winner ? 1 : black.winner ? 0 : 0.5;
    const blackResult = black.winner ? 1 : white.winner ? 0 : 0.5;

    const whiteEloChange = eloChange(
      whiteUser[eloType],
      blackUser[eloType],
      whiteResult,
    );
    const blackEloChange = eloChange(
      blackUser[eloType],
      whiteUser[eloType],
      blackResult,
    );

    white.eloChange = whiteEloChange - whiteUser[eloType];
    whiteUser[eloType] = whiteEloChange;
    black.eloChange = blackEloChange - blackUser[eloType];
    blackUser[eloType] = blackEloChange;

    await this.participantRepository.save([white, black]);
    return await this.userRepository.save([whiteUser, blackUser]);
  }

  async playerTimedoutMatches(): Promise<Match[]> {
    return this.matchRepository
      .createQueryBuilder('match')
      .innerJoin(
        query => {
          return query
            .from(MatchParticipant, 'p')
            .select('p."matchId"')
            .where('p."pendingTimeoutDate" < :now');
        },
        'selfMatch',
        '"selfMatch"."matchId" = match.id',
      )
      .leftJoinAndSelect('match.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .setParameter('now', Date.now())
      .where('match.gameOver = false')
      .getMany();
  }

  async forfeit(matchId: string, userId: string): Promise<Match> {
    const match = await this.matchById(matchId);
    const { participants = [], type, rated } = match;

    const self = participants.find(p => p.user.id === userId);
    const opponent = participants.find(p => p.user.id !== userId);

    match.forfeit = true;
    match.gameOver = true;
    opponent.winner = true;

    self.pendingTimeoutDate = self.pendingTimeoutDate - Date.now();
    opponent.pendingTimeoutDate = opponent.pendingTimeoutDate - Date.now();

    await this.participantRepository.save([self, opponent]);
    this.pubSub.publish('matchMoveMade', { matchMoveMade: match });

    if (rated) {
      const whitePlayer = self.side === 'w' ? self : opponent;
      const blackPlayer = self.side === 'b' ? self : opponent;
      /* Create notifications */
      this.notificationService.createMany(
        [whitePlayer.user.id, blackPlayer.user.id],
        false,
        match,
        NotificationType.MATCH_ENDED,
      );
      await this.distributeElo(whitePlayer, blackPlayer, type);
    }

    await this.matchRepository.save(match);
    return match;
  }

  @Cron('45 * * * * *')
  async cleanup(): Promise<boolean> {
    const matches = await this.playerTimedoutMatches();
    matches.forEach(async match => {
      match.gameOver = true;
      match.timedout = true;
      const { participants, turn } = match;
      const opponent = participants.find(p => p.side !== turn);
      opponent.winner = true;
      this.pubSub.publish('matchMoveMade', { matchMoveMade: match });

      if (match.rated) {
        const whitePlayer = participants.find(p => p.side === 'w');
        const blackPlayer = participants.find(p => p.side === 'b');
        /* Create notifications */
        this.notificationService.createMany(
          [whitePlayer.user.id, blackPlayer.user.id],
          false,
          match,
          NotificationType.MATCH_ENDED,
        );
        await this.distributeElo(whitePlayer, blackPlayer, match.type);
      }

      await this.participantRepository.save(opponent);
    });

    console.log(`${matches.length} matches cleaned`);

    await this.matchRepository.save(matches);
    return true;
  }
}
