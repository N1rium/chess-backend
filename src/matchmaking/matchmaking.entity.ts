export class MatchmakingParticipant {
  id?: string;
  elo?: number;
  constructor(id) {
    this.id = id;
  }
}

export enum MatchmakingSearchMode {
  ANY = 'any',
}
