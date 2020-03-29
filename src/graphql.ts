
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum color {
    WHITE = "WHITE",
    BLACK = "BLACK"
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
}

export interface Match {
    id: string;
    name: string;
    participants: MatchParticipant[];
    data: JSON;
    fen: string;
    moves: MatchMove[];
    turn: string;
}

export interface MatchMove {
    from: string;
    to: string;
    color: string;
    piece: string;
    captured: string;
    date: string;
}

export interface MatchParticipant {
    user: User;
    side: color;
}

export interface IMutation {
    createMatch(input: CreateMatchInput): Match | Promise<Match>;
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

export interface User {
    id: string;
    username: string;
}

export type JSON = any;
