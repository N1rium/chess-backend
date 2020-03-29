import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Match, CreateMatchInput, MatchMoveInput } from 'src/graphql';
import { Chess } from 'chess.js/chess';

const matches = {};

@Injectable()
export class MatchService {
  async matchById(id: string): Promise<Match> {
    const result = matches[id];
    if (!result) throw new NotFoundException();
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
    };
    matches[newMatch.id] = newMatch;
    return newMatch;
  }

  async matchMove(input: MatchMoveInput): Promise<Match> {
    const { id, from, to } = input;
    const storedMatch = await this.matchById(id);

    const { fen } = storedMatch;
    const chess = new Chess(fen);
    const move = chess.move({ from, to, verbose: true });
    if (!move) throw new BadRequestException({ message: 'Illegal move' });

    const result = {
      ...storedMatch,
      moves: [
        ...storedMatch.moves,
        { ...move, date: Date.now(), fen: chess.fen() },
      ],
      fen: chess.fen(),
      turn: chess.turn(),
    };
    matches[result.id] = result;
    return result;
  }
}
