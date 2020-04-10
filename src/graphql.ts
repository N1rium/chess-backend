
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum color {
    w = "w",
    b = "b"
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

export interface Match {
    id: string;
    name: string;
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
    createUser(input: CreateUserInput): User | Promise<User>;
}

export interface IQuery {
    matchById(id: string): Match | Promise<Match>;
    matchesFromUser(id: string): Match[] | Promise<Match[]>;
    myMatches(): Match[] | Promise<Match[]>;
    userById(id: string): User | Promise<User>;
    me(): User | Promise<User>;
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
