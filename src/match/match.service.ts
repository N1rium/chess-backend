import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Match, CreateMatchInput, MatchMoveInput } from 'src/graphql';
import { Chess } from 'chess.js/chess';

const matches = {
  '0': {
    id: '0',
    name: 'kuk',
    participants: [
      {
        user: {
          id: '0',
          username: 'N1rium',
        },
        side: 'w',
      },
      {
        user: {
          id: '1',
          username: 'Bavern',
        },
        side: 'b',
      },
    ],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn: 'w',
    moves: [],
    draw: false,
    gameOver: false,
    pgn: '',
    captured: [],
  },
};

@Injectable()
export class MatchService {
  async matchById(id: string): Promise<Match> {
    const result = matches[id];
    if (!result) throw new NotFoundException({ message: 'No such match id' });
    return result;
  }

  async createMatch(input: CreateMatchInput): Promise<Match> {
    const chess = new Chess();
    const { name } = input;
    const newMatch = {
      id: Date.now().toString(),
      name,
      participants: [],
      fen: chess.fen(),
      turn: chess.turn(),
      data: {},
      moves: [],
      draw: chess.in_draw(),
      gameOver: chess.game_over(),
      pgn: chess.pgn(),
      captured: [],
    } as Match;
    matches[newMatch.id] = newMatch;
    return newMatch;
  }

  async joinMatch(id: string): Promise<Match> {
    const match = await this.matchById(id);
    return match;
  }

  async matchMove(token: string, input: MatchMoveInput): Promise<Match> {
    const { id, from, to, promotion = 'q' } = input;
    const storedMatch = await this.matchById(id);
    const { participants } = storedMatch;
    const self = participants.find(p => p.user.id === token);
    if (!self)
      throw new BadRequestException({ message: 'You are not a participant' });

    // if (self.side !== storedMatch.turn)
    //   throw new BadRequestException({ message: 'Not your turn' });

    const { pgn, captured = [] } = storedMatch;
    const chess = new Chess();
    pgn && chess.load_pgn(pgn);
    const move = chess.move({ from, to, promotion, verbose: true });
    if (!move) throw new BadRequestException({ message: 'Illegal move' });

    let _captured = [...captured];
    const { captured: moveCapture = null, color } = move;
    if (moveCapture)
      _captured = [..._captured, `${color === 'w' ? 'b' : 'w'}${moveCapture}`];

    const result = {
      ...storedMatch,
      moves: [
        ...storedMatch.moves,
        { ...move, date: Date.now(), fen: chess.fen() },
      ],
      fen: chess.fen(),
      turn: chess.turn(),
      pgn: chess.pgn(),
      draw: chess.in_draw(),
      gameOver: chess.game_over(),
      captured: _captured,
    };
    matches[result.id] = result;
    return result;
  }
}
