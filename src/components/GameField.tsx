import React from 'react';
import {
  HexGrid,
  Layout,
  Hexagon as LibHexagon,
  Text,
  GridGenerator,
} from 'react-hexgrid';
import configs from './configurations.json';
import { GameSession } from '../models/GameSession';
import { Hexagon } from '../models/Hexagon';
import { PlayerCommandEnum } from '../models/PlayerCommandEnum';
import { HexDisplaySize } from '../models/HexagonDisplaySize';
import { HexagonSideEnum } from '../models/HexagonSideEnum';

interface Props {
  session: GameSession;
}
const GameField: React.FC<Props> = (props) => {
  const config = configs['hexagon'];
  const session = props.session;
  console.log(session);
  if (session == null) return null;

  let hexSize: HexDisplaySize;
  if (session.radius === undefined) {
    hexSize = { width: 1, height: 1 };
  } else {
    // calculated a solution for:
    // (900 / (x * 13.5) ) / 2 - 1 = r
    // where 900 is hexGrid height, 13.5 is the adjusted height of a pointy-top hexagon, and r is the radius
    hexSize = {
      width: 32 / (session.radius + 1),
      height: 32 / (session.radius + 1),
    };
  }

  const fontSize = hexSize.width * 15 * 0.01;
  const adjusterHorizontalTextPos = hexSize.width / 3;
  const adjustedVerticalTextPos = hexSize.height / 3;

  function getFormattedAction(action: PlayerCommandEnum) {
    switch (action) {
      case PlayerCommandEnum.Attack:
        return 'Att';
      case PlayerCommandEnum.SkipMove:
        return 'Skip';
      case PlayerCommandEnum.SupportDefense:
        return 'S. Def.';
      case PlayerCommandEnum.SupportAttack:
        return 'S. Att.';
      default:
        return action;
    }
  }
  function argbToRGB(color: number) {
    return '#' + ('000000' + (color & 0xffffff).toString(16)).slice(-6);
  }

  function assignLastActions(session: GameSession) {
    if (session.playerMoves == null) {
      return;
    }
    // for each action in the session, as sign the last action to the according hexagon
    session.playerMoves.forEach((action) => {
      const hexagon = session.hexagons.find(
        (hex) => hex.id === action.actingHexagonId
      );
      if (hexagon == null) return;
      hexagon.lastAction = action;
    });
  }

  function displayHexAction(hex: Hexagon) {
    if (hex.lastAction === undefined) {
      return null;
    }

    let targetQCoord = hex.lastAction.targetQCoord;
    let targetRCoord = hex.lastAction.targetRCoord;

    let formattedAction = getFormattedAction(hex.lastAction.action);

    if (
      targetQCoord === undefined ||
      targetRCoord === undefined ||
      hex.lastAction.action === PlayerCommandEnum.SkipMove
    ) {
      return <Text fontSize={fontSize}>{formattedAction}</Text>;
    }
    let direction = whichNeighbor(hex, targetQCoord, targetRCoord);
    switch (direction) {
      case HexagonSideEnum.BottomRight:
        return (
          <Text
            fontSize={fontSize}
            transform={`translate(${adjusterHorizontalTextPos}, ${adjustedVerticalTextPos})`}
          >
            {formattedAction}
          </Text>
        );
      case HexagonSideEnum.BottomLeft:
        return (
          <Text
            fontSize={fontSize}
            transform={`translate(${-adjusterHorizontalTextPos}, ${adjustedVerticalTextPos})`}
          >
            {formattedAction}
          </Text>
        );
      case HexagonSideEnum.Left:
        return (
          <Text
            fontSize={fontSize}
            transform={`translate(${-adjusterHorizontalTextPos}, ${0})`}
          >
            {formattedAction}
          </Text>
        );
      case HexagonSideEnum.Right:
        return (
          <Text
            fontSize={fontSize}
            transform={`translate(${adjusterHorizontalTextPos}, ${0})`}
          >
            {formattedAction}
          </Text>
        );
      case HexagonSideEnum.TopLeft:
        return (
          <Text
            fontSize={fontSize}
            transform={`translate(${-adjusterHorizontalTextPos}, ${-adjustedVerticalTextPos})`}
          >
            {formattedAction}
          </Text>
        );
      case HexagonSideEnum.TopRight:
        return (
          <Text
            fontSize={fontSize}
            transform={`translate(${adjusterHorizontalTextPos}, ${-adjustedVerticalTextPos})`}
          >
            {formattedAction}
          </Text>
        );
      default:
        return <Text fontSize={fontSize}>{formattedAction}</Text>;
    }
  }

  function whichNeighbor(
    hex: Hexagon,
    neighborQCoord: number,
    neighborRCoord: number
  ) {
    let qDelta = neighborQCoord - hex.qCoord;
    let rDelta = neighborRCoord - hex.rCoord;
    switch (true) {
      case qDelta === 0 && rDelta === 1:
        return HexagonSideEnum.BottomRight;
      case qDelta === 0 && rDelta === -1:
        return HexagonSideEnum.TopLeft;
      case qDelta === 1 && rDelta === 0:
        return HexagonSideEnum.Right;
      case qDelta === 1 && rDelta === -1:
        return HexagonSideEnum.TopRight;
      case qDelta === -1 && rDelta === 1:
        return HexagonSideEnum.BottomLeft;
      case qDelta === -1 && rDelta === 0:
        return HexagonSideEnum.Left;
      default:
        return HexagonSideEnum.Unknown;
    }
  }

  function getWinners(session: GameSession) {
    let winners = session.players.filter((x) => x.isWinner);
    return winners;
  }

  function getGameOverMessage(session: GameSession) {
    let winners = getWinners(session);
    if (winners === undefined || winners.length === 0) return null;

    return (
      <div>
        <h1>Game Over</h1>
        <h2>Winners:</h2>
        <ul>
          {winners.map((winner) => (
            <li key={winner.id} style={{ color: argbToRGB(winner.argb) }}>
              {winner.id}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  assignLastActions(session);
  const hexagons = session.hexagons;
  const layout = config.layout;

  const size = { x: hexSize.width, y: hexSize.height };
  if (session.hexagons == null) {
    return null;
  }

  const generatedMap = GridGenerator.hexagon(session.radius);
  for (var i = 0; i < generatedMap.length; i++) {
    const hex = generatedMap[i];
    let hexagon = hexagons.find(
      (x) => x.qCoord === hex.q && x.rCoord === hex.r
    );
    if (hexagon === undefined) {
      hexagon = {
        id: String(i),
        qCoord: hex.q,
        rCoord: hex.r,
        actionDone: false,
      };
      hexagons.push(hexagon);
    }
  }

  return (
    <div>
      <div>Current round: {session.currentRound}</div>
      <div>{getGameOverMessage(session)}</div>
      <HexGrid width={config.width} height={config.height}>
        <Layout
          size={size}
          flat={layout.flat}
          spacing={layout.spacing}
          origin={config.origin}
        >
          {hexagons.map((hex) => {
            var color;
            if (hex.playerId != null) {
              color = {
                fill: argbToRGB(
                  session.players.find((x) => x.id === hex.playerId)!.argb
                ),
              };
            }

            return (
              <LibHexagon
                key={hex.id}
                q={hex.qCoord}
                r={hex.rCoord}
                s={-hex.qCoord - hex.rCoord}
                cellStyle={color}
              >
                {displayHexAction(hex)}
              </LibHexagon>
            );
          })}
        </Layout>
      </HexGrid>
    </div>
  );
};

export default GameField;
