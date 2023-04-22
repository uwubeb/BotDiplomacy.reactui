import { PlayerMove } from './PlayerMove';
import { Hexagon } from './Hexagon';
import { Player } from './Player';

export interface GameSession {
  id: string;
  currentRound: number;
  gameLength: number;
  radius: number;
  timePerRoundSeconds: number;
  hexagons: Hexagon[];
  playerMoves: PlayerMove[];
  players: Player[];
}
