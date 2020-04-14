/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

export enum color {
  w = 'w',
  b = 'b',
}

export interface ChatMessageInput {
  message: string;
  room: string;
}

export interface CreateMatchInput {
  name?: string;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  passwordRepeat: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface MatchMoveInput {
  id: string;
  from: string;
  to: string;
  promotion?: string;
}

export interface ChatMessage {
  sender: string;
  content: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Match {
  id: string;
  participants: MatchParticipant[];
  fen: string;
  moves: MatchMove[];
  turn: string;
  draw: boolean;
  gameOver: boolean;
  pgn: string;
  captured?: string[];
}

export interface MatchMove {
  from: string;
  to: string;
  color: string;
  piece: string;
  captured: string;
  date: string;
  fen: string;
  san: string;
}

export interface MatchParticipant {
  user: User;
  side: color;
}

export interface IMutation {
  sendChatMessage(input: ChatMessageInput): ChatMessage | Promise<ChatMessage>;
  createMatch(input: CreateMatchInput): Match | Promise<Match>;
  joinMatch(id: string): Match | Promise<Match>;
  matchMove(input: MatchMoveInput): Match | Promise<Match>;
  createUser(input: CreateUserInput): LoginResponse | Promise<LoginResponse>;
}

export interface IQuery {
  matchById(id: string): Match | Promise<Match>;
  matchesFromUser(id: string): Match[] | Promise<Match[]>;
  myMatches(): Match[] | Promise<Match[]>;
  userById(id: string): User | Promise<User>;
  userByEmail(email: string): User | Promise<User>;
  me(): User | Promise<User>;
  login(input: LoginInput): LoginResponse | Promise<LoginResponse>;
}

export interface ISubscription {
  chatMessage(room: string): ChatMessage | Promise<ChatMessage>;
  matchMoveMade(id: string): Match | Promise<Match>;
}

export interface User {
  id: string;
  username: string;
}

export type JSON = any;
