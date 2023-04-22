import { PlayerCommandEnum } from './PlayerCommandEnum';

export interface PlayerMove {
  action: PlayerCommandEnum;
  actingHexagonId: string;
  targetQCoord: number;
  targetRCoord: number;
  playerId: string;
  gameSessionId: string;
  round: number;
}
