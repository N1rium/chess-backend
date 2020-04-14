import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Match, MatchMove, MatchMoveInput } from './match.entity';
import { Chess } from 'chess.js/chess';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchMove)
    private matchMoveRepository: Repository<MatchMove>,
  ) {}

  async matchById(id: string): Promise<Match> {
    return this.matchRepository.findOne(id);
  }

  async createMatch(): Promise<Match> {
    const chess = new Chess();
    const match = this.matchRepository.save({
      fen: chess.fen(),
      turn: chess.turn(),
      draw: chess.in_draw(),
      gameOver: chess.game_over(),
      pgn: chess.pgn(),
      checkmate: chess.in_checkmate(),
      stalemate: chess.in_stalemate(),
      threefold: chess.in_threefold_repetition(),
      participants: [],
      captured: [],
    });
    return match;
  }

  async joinMatch(id: string): Promise<Match> {
    const match = await this.matchById(id);
    //TODO - Join
    return match;
  }

  async matchMove(token: string, input: MatchMoveInput): Promise<Match> {
    const { id, from, to, promotion = 'q' } = input;
    const storedMatch = await this.matchById(id);

    // const { participants } = storedMatch;
    // const self = participants.find(p => p.user.id === token);
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

    let newMove = new MatchMove();
    newMove = {
      ...move,
      date: Date.now(),
      fen: chess.fen(),
      match: storedMatch,
    };

    const result = {
      ...storedMatch,
      fen: chess.fen(),
      turn: chess.turn(),
      pgn: chess.pgn(),
      draw: chess.in_draw(),
      gameOver: chess.game_over(),
    };

    const newMatch = await this.matchRepository.save(result);
    await this.matchMoveRepository.save(newMove);
    return newMatch;
  }
}
