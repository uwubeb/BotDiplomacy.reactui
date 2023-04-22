import { Player } from './Player';
import { PlayerMove } from './PlayerMove';

export interface Hexagon {
  id: string;
  qCoord: number;
  rCoord: number;
  actionDone: boolean;
  playerId?: string;
  lastAction?: PlayerMove;
}
