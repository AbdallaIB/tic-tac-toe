import { useEffect, useState } from 'react';
import styled from 'styled-components';
import gameService from '@services/GameService';
import socketService from '@services/SocketService';
import { O, PlayerCard, X } from '@components/player';
import { useRouter } from '@lib/hooks/useRouter';
import Chat from '@components/chat';
import './game.css';
import _ from 'lodash';
import { winLines, winningCombinationClasses } from '@components/game';
import useGameStore, { GameConfig, GameEvents } from '@lib/store/game';
import { Room } from '@models/room';

const GameContainer = styled.div`
  justify-content: space-evenly;
  display: flex;
  gap: 1rem;
  flex-direction: column;
  position: relative;
  height: 100%;
  margin-top: 5rem;
`;

const Cell = styled.div<ICellProps>`
  width: 8em;
  height: 8em;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 270ms ease-in-out;
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
  room: Room;
}

type Result = 'Lost' | 'Won' | 'Draw';

const Online = () => {
  const router = useRouter();
  const [result, setResult] = useState('');
  const [winner, setWinner] = useState<Symbol>(null);
  const [winnerIndex, setWinnerIndex] = useState<number[] | null>(null);
  const [winnerClass, setWinnerClass] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const {
    gameEvents: { isPlayerTurn },
    myPlayer: { color, username, symbol, isComputer },
    otherPlayer,
    setGameEvents,
    gameConfig,
    gameEvents,
    clearStore,
  } = useGameStore();
  const [matrix, setMatrix] = useState<IBoard>(Array(9).fill(null));

  useEffect(() => {
    const state = router.location.state as GameConfig;
    console.log('state', otherPlayer, username);
    if (!gameConfig || !state || !gameConfig.gameType || gameConfig.gameType !== state.gameType) {
      clearStore();
      router.navigate('/');
    }
    setGameEvents({ ...gameEvents, isGameStarted: true });
    handleGameUpdate();
    handleGameStart();
    handleGameWin();
  }, []);

  const checkWinner = () => {
    for (const element of winLines) {
      const [a, b, c] = element;
      const socket = socketService.socket;

      if (!socket) return;

      if (matrix[a] === symbol && matrix[b] === symbol && matrix[c] === symbol) {
        console.log('winner: ', symbol, [a, b, c]);
        gameService.gameWin(socket, { message: 'Lost', indexes: [a, b, c], winner: symbol });
        handleResult('Won');
        setWinner(symbol);
        setWinnerIndex([a, b, c]);
        setWinnerClass(winningCombinationClasses([a, b, c]));
      } else if (
        matrix[a] === otherPlayer.symbol &&
        matrix[b] === otherPlayer.symbol &&
        matrix[c] === otherPlayer.symbol
      ) {
        gameService.gameWin(socket, { message: 'Won', indexes: [a, b, c], winner: symbol });
        handleResult('Lost');
        console.log('winner: ', otherPlayer.symbol, [a, b, c]);
        setWinnerIndex([a, b, c]);
        setWinner(otherPlayer.symbol);
        setWinnerClass(winningCombinationClasses([a, b, c]));
      } else if (winner === null && _.isEmpty(emptyIndexes())) {
        gameService.gameWin(socket, { message: 'Draw', indexes: [a, b, c], winner: symbol });
        handleResult('Draw');
      }
    }
  };

  const handleGameUpdate = () => {
    const socket = socketService.socket;
    if (socket)
      gameService.onGameUpdate(socket, (newMatrix, socketId) => {
        console.log('onGameUpdate', newMatrix, socketId, socketId !== socket.id);
        setGameEvents({ ...gameEvents, isPlayerTurn: socketId !== socket.id });
        console.log('isPlayerTurn', isPlayerTurn);
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
        setGameEvents({
          ...gameEvents,
          isGameStarted: true,
          isPlayerTurn: options.symbol === symbol && options.start,
        });
      });
  };

  const handleGameWin = () => {
    if (socketService.socket)
      gameService.onGameWin(socketService.socket, (message, indexes, winner, newPlayerTurn) => {
        console.log('Here', message, matrix);
        if (message !== 'Draw') {
          setWinnerIndex(indexes);
          setWinnerClass(winningCombinationClasses(indexes));
        }
        setGameEvents({ ...gameEvents, isPlayerTurn: false });
        handleResult(message as Result);
        checkWinner();
        setIsResetting(true);
        setTimeout(() => {
          reset();
          setGameEvents({ ...gameEvents, isPlayerTurn: newPlayerTurn === symbol });
        }, 2000);
      });
  };

  const getSymbolColor = (Symbol: 'x' | 'o') => {
    return symbol === Symbol ? color : otherPlayer.color;
  };

  const handleResult = (result: Result) => {
    setIsResetting(true);
    if (result === 'Draw') {
      setResult('Draw!');
    } else if (result === 'Lost') {
      setResult(otherPlayer.username + ' Won!');
    } else if (result === 'Won') {
      setResult('You Won!');
    }
    setTimeout(() => {
      reset();
    }, 3000);
  };

  const handleClick = (index: number) => {
    if (winner !== null || !isPlayerTurn || winnerIndex || isResetting) {
      return;
    }

    let newBoard = matrix;

    if (newBoard[index] !== null) {
      return;
    }

    newBoard[index] = isPlayerTurn ? symbol : otherPlayer.symbol;
    setMatrix(newBoard);
    console.log('handleClick', newBoard);
    if (socketService.socket) {
      gameService.updateGame(socketService.socket, newBoard);
    }
    setGameEvents({ ...gameEvents, isPlayerTurn: false });
    checkWinner();
  };

  const reset = () => {
    setMatrix(Array(9).fill(null));
    setWinner(null);
    setWinnerIndex(null);
    setWinnerClass('');
    setResult('');
    setIsResetting(false);
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
      {box ? (box === 'x' ? X(getSymbolColor(box)) : O(getSymbolColor(box))) : null}
    </Cell>
  ));

  return (
    <GameContainer>
      {result && (
        <div className="mb-4 text-white font-medium">
          <h1 className="text-3xl text-center">{result}</h1>
        </div>
      )}
      <div className="flex flex-row justify-center gap-14 w-full">
        <div className="flex justify-center items-center flex-col gap-4">
          <div className="h-1/2 text-center">
            <PlayerCard
              color={color}
              symbol={symbol}
              username={username || 'Player 1'}
              isComputer={isComputer}
              isPlayer1={true}
            ></PlayerCard>
            <span className="blink mt-2 text-white text-md">{isPlayerTurn && !winner ? 'My Turn' : ''}</span>
          </div>
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
          <div className="h-1/2 text-center">
            <PlayerCard
              color={otherPlayer.color}
              symbol={otherPlayer.symbol}
              username={otherPlayer.username || 'Player 2'}
              isComputer={otherPlayer.isComputer}
              isPlayer1={false}
            ></PlayerCard>
            <span className="blink mt-2 text-white text-md">{!isPlayerTurn && !winner ? 'Your Turn' : ''}</span>
          </div>
        </div>
      </div>
      <Chat />
    </GameContainer>
  );
};

export default Online;
