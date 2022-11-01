import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import gameService from '@services/GameService';
import socketService from '@services/SocketService';
import { O, PlayerCard, X } from '@components/player';
import gameContext, { GameConfig } from '@context/gameContext';
import { useRouter } from '@lib/hooks/useRouter';
import Chat from '@components/chat';
import './game.css';
import _ from 'lodash';
import Button from '@components/shared/button';
import useModal from '@lib/hooks/useModal';
import { winLines, winningCombinationClasses } from '@components/game';

const GameContainer = styled.div`
  justify-content: space-evenly;
  display: flex;
  gap: 1rem;
  flex-direction: column;
  font-family: 'Zen Tokyo Zoo', cursive;
  position: relative;
  height: 100%;
`;

const Cell = styled.div<ICellProps>`
  width: 8em;
  height: 8em;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-top: ${({ borderTop }) => borderTop && '3px solid #a42ef2'};
  border-left: ${({ borderLeft }) => borderLeft && '3px solid #a42ef2'};
  border-bottom: ${({ borderBottom }) => borderBottom && '3px solid #a42ef2'};
  border-right: ${({ borderRight }) => borderRight && '3px solid #a42ef2'};
  transition: all 270ms ease-in-out;
  background: #a42ef2;
`;

interface ICellProps {
  borderTop?: boolean;
  borderRight?: boolean;
  borderLeft?: boolean;
  borderBottom?: boolean;
}

export type Symbol = 'x' | 'o' | null;

export type IBoard = Array<Symbol>;
export interface IStartGame {
  start: boolean;
  symbol: 'x' | 'o';
}

type Result = 'Lost' | 'Won' | 'Draw';

const Online = () => {
  const router = useRouter();
  const [result, setResult] = useState('');
  const [winner, setWinner] = useState<Symbol>(null);
  const [winnerIndex, setWinnerIndex] = useState<number[] | null>(null);
  const [winnerClass, setWinnerClass] = useState('');

  const {
    gameEvents: { isPlayerTurn },
    myPlayer: { color, username, symbol, isComputer },
    otherPlayer,
    setGameEvents,
    gameConfig,
    gameEvents,
  } = useContext(gameContext);
  const [matrix, setMatrix] = useState<IBoard>(Array(9).fill(null));

  const handleGameEvents = (prop: string, value: boolean) => {
    setGameEvents((prev: any) => ({ ...prev, [prop]: value }));
    console.log('handleGameEvents', prop, value, gameEvents);
  };

  const checkWinner = () => {
    for (const element of winLines) {
      const [a, b, c] = element;
      const socket = socketService.socket;

      if (!socket) return;

      if (matrix[a] === symbol && matrix[b] === symbol && matrix[c] === symbol) {
        console.log('winner: ', symbol, [a, b, c]);
        gameService.gameWin(socket, { message: 'Lost', indexes: [a, b, c] });
        handleResult('Won');
        setWinner(symbol);
        setWinnerIndex([a, b, c]);
        setWinnerClass(winningCombinationClasses([a, b, c]));
      } else if (
        matrix[a] === otherPlayer.symbol &&
        matrix[b] === otherPlayer.symbol &&
        matrix[c] === otherPlayer.symbol
      ) {
        gameService.gameWin(socket, { message: 'Won', indexes: [a, b, c] });
        handleResult('Lost');
        console.log('winner: ', otherPlayer.symbol, [a, b, c]);
        setWinnerIndex([a, b, c]);
        setWinner(otherPlayer.symbol);
        setWinnerClass(winningCombinationClasses([a, b, c]));
      } else if (winner === null && _.isEmpty(emptyIndexes())) {
        gameService.gameWin(socket, { message: 'Draw', indexes: [a, b, c] });
        handleResult('Draw');
      }
    }
  };

  const handleGameUpdate = () => {
    if (socketService.socket)
      gameService.onGameUpdate(socketService.socket, (newMatrix) => {
        console.log('onGameUpdate', newMatrix);
        handleGameEvents('isPlayerTurn', true);
        checkWinner();
        setMatrix(newMatrix);
        setTimeout(() => {
          checkWinner();
        }, 1000);
      });
  };

  const handleGameStart = () => {
    if (socketService.socket)
      gameService.onStartGame(socketService.socket, (options) => {
        console.log('handleGameStart', options, symbol);
        handleGameEvents('isGameStarted', true);
        handleGameEvents('isPlayerTurn', options.symbol === symbol && options.start);
      });
  };

  const handleGameWin = () => {
    if (socketService.socket)
      gameService.onGameWin(socketService.socket, (message, indexes) => {
        console.log('Here', message, matrix);
        if (message !== 'Draw') {
          setWinnerIndex(indexes);
          setWinnerClass(winningCombinationClasses(indexes));
        }
        handleGameEvents('isPlayerTurn', false);
        handleResult(message as Result);
        checkWinner();
      });
  };

  const getSymbolColor = (Symbol: 'x' | 'o') => {
    return symbol === Symbol ? color : otherPlayer.color;
  };

  const handleResult = (result: Result) => {
    if (result === 'Draw') {
      setResult('Draw!');
    } else if (result === 'Lost') {
      setResult(otherPlayer.username + ' Won!');
    } else if (result === 'Won') {
      setResult('You Won!');
    }
  };

  useEffect(() => {
    const state = router.location.state as GameConfig;
    if (!gameConfig || gameConfig.gameType !== state.gameType) {
      router.navigate('/');
    }
    handleGameEvents('isGameStarted', true);
    handleGameUpdate();
    handleGameStart();
    handleGameWin();
  }, []);

  const handleClick = (index: number) => {
    if (winner !== null || !isPlayerTurn || winnerIndex) {
      return;
    }

    let newboard = matrix;

    if (newboard[index] !== null) {
      return;
    }

    newboard[index] = isPlayerTurn ? symbol : otherPlayer.symbol;
    setMatrix(newboard);
    console.log('handleClick', newboard);
    if (socketService.socket) {
      gameService.updateGame(socketService.socket, newboard);
    }
    handleGameEvents('isPlayerTurn', false);
    checkWinner();
  };

  const reset = () => {
    setMatrix(Array(9).fill(null));
  };

  const emptyIndexes = () => {
    let fills: number[] = [];
    _.filter(matrix, function (value, key) {
      if (value === null) {
        fills.push(key);
      }
    });

    return fills;
  };

  const getRadius = (index: number) => {
    if (index === 0) {
      return '15px 0 0 0';
    } else if (index === 2) {
      return '0 15px 0 0px';
    } else if (index === 6) {
      return '0 0 0 15px';
    } else if (index === 8) {
      return '0 0 15px 0';
    }
  };

  const Box = matrix.map((box, index) => (
    <Cell
      key={index}
      onClick={() => handleClick(index)}
      className="flex justify-center items-center col box"
      style={{ borderRadius: getRadius(index) }}
      borderRight={index < 7}
      borderLeft={index > 2}
      borderBottom={index < 7}
      borderTop={index > 2}
    >
      <div className="rounded-2xl bg-main hover:bg-main_side_hover" style={{ height: '90%', width: '90%' }}>
        {box ? (box === 'x' ? X(getSymbolColor(box)) : O(getSymbolColor(box))) : null}
      </div>
    </Cell>
  ));

  return (
    <GameContainer>
      {result && (
        <div className="flex justify-center">
          <span className="blink text-white text-md">{result}</span>
        </div>
      )}
      <div className="flex flex-row justify-center gap-14 w-full">
        <div className="flex justify-center items-center flex-col gap-4">
          <PlayerCard
            color={color}
            symbol={symbol}
            username={username || 'Player 1'}
            isComputer={isComputer}
            isPlayer1={true}
          ></PlayerCard>
          <span className="blink text-white text-md">{isPlayerTurn && !result ? 'My Turn' : ''}</span>
        </div>

        <div
          className={`flex w-full board`}
          style={{
            width: '400px',
          }}
        >
          {winnerIndex && <div className={`${winnerClass}`}></div>}
          <div className="w-full">{Box}</div>
        </div>

        <div className="flex justify-center items-center flex-col gap-4">
          <PlayerCard
            color={otherPlayer.color}
            symbol={otherPlayer.symbol}
            username={otherPlayer.username || 'Player 2'}
            isComputer={otherPlayer.isComputer}
            isPlayer1={false}
          ></PlayerCard>
          <span className="blink text-white text-md">{!isPlayerTurn && !result ? 'Your Turn' : ''}</span>
        </div>
      </div>
      <div className="grid justify-start items-center w-full fluid-grid px-4">
        <div>
          <Chat></Chat>
        </div>
        <div>
          {winnerIndex && (
            <Button className="btn" type="button">
              {winner || _.isEmpty(emptyIndexes()) ? 'New Game' : 'Reset'}
            </Button>
          )}
        </div>
      </div>
    </GameContainer>
  );
};

export default Online;
