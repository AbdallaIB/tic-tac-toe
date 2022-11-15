import { useEffect, useState } from 'react';
import _ from 'lodash';
import './game.css';
import { O, PlayerCard, X } from '@components/player';
import { useRouter } from '@lib/hooks/useRouter';
import { winLines } from '@components/game';
import useGameStore, { GameConfig, Player } from '@lib/store/game';

export type Symbol = 'x' | 'o' | null;

interface State {
  type: 'single' | 'multi';
  currentTurn: Symbol;
  winner: Symbol;
  player: Symbol;
  winnerIndex: number[] | null;
  p2: Player;
  p1: Player;
  board: Array<Symbol>;
  winLines: number[][];
}

const Offline = () => {
  const router = useRouter();
  const {
    myPlayer: { color, username, symbol, isComputer },
    otherPlayer,
    gameEvents,
    setGameEvents,
    setMyPlayer,
    setOtherPlayer,
    scores,
    setScores,
  } = useGameStore();
  const [state, setState] = useState<State>({
    type: 'single',
    currentTurn: 'x',
    winner: null,
    player: null,
    winnerIndex: null,
    p2: {
      uId: '',
      username: '',
      color: '',
      symbol: 'x',
      isComputer: true,
    },
    p1: {
      uId: '',
      username: '',
      color: '',
      symbol: 'o',
      isComputer: false,
    },
    board: Array(9).fill(null),
    winLines,
  });
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    setGameEvents({ ...gameEvents, isInRoom: true });
    const state = router.location.state as { gameConfig: GameConfig; myPlayer: Player; otherPlayer: Player };
    setState((prev: State) => {
      return {
        ...prev,
        p1: {
          ...prev.p1,
          color: state.myPlayer.color,
          symbol: state.myPlayer.symbol,
          isComputer: state.myPlayer.isComputer || false,
        },
        p2: {
          ...prev.p2,
          color: state.otherPlayer.color,
          symbol: state.otherPlayer.symbol,
          isComputer: state.otherPlayer.isComputer,
        },
        type: state.gameConfig.playerMode,
      };
    });

    setOtherPlayer(state.otherPlayer);
    setMyPlayer(state.myPlayer);
    console.log('state', state);
  }, []);

  useEffect(() => {
    setResult(getResultMessage() || '');
  }, [state]);

  const checkWinner = () => {
    let hasWinner = false;
    for (const element of state.winLines) {
      const [a, b, c] = element;

      if (
        state.board[a] === state.p1.symbol &&
        state.board[b] === state.p1.symbol &&
        state.board[c] === state.p1.symbol
      ) {
        setState((prev: State) => {
          return {
            ...prev,
            winner: state.p1.symbol,
            winnerIndex: [a, b, c],
          };
        });
        const newScores = {
          ...scores,
          p1: scores.p1 + 1,
        };
        setScores(newScores);
        hasWinner = true;
      } else if (
        state.board[a] === state.p2.symbol &&
        state.board[b] === state.p2.symbol &&
        state.board[c] === state.p2.symbol
      ) {
        setState((prev: State) => {
          return {
            ...prev,
            winner: state.p2.symbol,
            winnerIndex: [a, b, c],
          };
        });
        const newScores = {
          ...scores,
          p2: scores.p2 + 1,
        };
        setScores(newScores);
        hasWinner = true;
      }
    }
    return hasWinner;
  };

  const aiAction = () => {
    const availSpot = emptyIndexes();
    const checkWinLines = state.winLines;
    const opponentIndexes = p1Indexes();
    let res: Array<number[]> = [];
    let coverIndex = null;
    checkWinLines.forEach((value) => {
      let intersept = _.intersection(value, opponentIndexes);
      console.log(intersept);
      if (intersept.length === 2) {
        let j = _.difference(value, intersept);

        if (state.board[j[0]] === null) {
          coverIndex = j[0];
        }
      }
    });

    if (coverIndex) {
      return coverIndex;
    }

    checkWinLines.forEach((value) => {
      let d = _.intersection(value, availSpot);

      if (d && !_.isEmpty(_.difference(value, d))) {
        res.push(d);
      }
    });

    let mostSpot = _.flattenDeep(res);
    let uniq = _.uniq(mostSpot);
    let availtoSpot = uniq;

    let rand = availtoSpot[Math.floor(Math.random() * availtoSpot.length)];

    return rand;
  };

  const handleClick = (index: number) => {
    if (state.winner !== null || resetting || (state.currentTurn !== state.p1.symbol && state.type === 'single')) {
      return;
    }

    let newBoard = state.board;
    checkWinner();

    if (newBoard[index] !== null) {
      return;
    }

    const symbol = state.currentTurn;

    newBoard[index] = symbol;
    setState({
      ...state,
      board: newBoard,
      player: symbol,
      currentTurn: state.currentTurn === 'x' ? 'o' : 'x',
    });
    checkWinner();

    setTimeout(() => {
      checkWinner();

      // delay Ai action
      setTimeout(() => {
        if (state.winner === null && state.type === 'single' && !checkWinner()) {
          let freshBoard = state.board;
          // Get turn from other player
          let aiIndex = aiAction();

          const aiSymbol = symbol === 'x' ? 'o' : 'x';

          freshBoard[aiIndex] = aiSymbol;
          setState({
            ...state,
            board: freshBoard,
            player: aiSymbol,
            currentTurn: aiSymbol === 'x' ? 'o' : 'x',
          });

          setTimeout(() => {
            checkWinner();
          }, 300);
        }
      }, 1500);
    }, 300);
  };

  const emptyIndexes = () => {
    let fills: number[] = [];
    _.filter(state.board, function (value, key) {
      if (value === null) {
        fills.push(key);
      }
    });

    return fills;
  };

  const p1Indexes = () => {
    let fills: number[] = [];
    _.filter(state.board, function (value, key) {
      if (value === 'o') {
        fills.push(key);
      }
    });

    return fills;
  };

  const reset = () => {
    setState({
      ...state,
      winner: null,
      player: null,
      board: Array(9).fill(null),
      winnerIndex: null,
    });
    setResult('');
    setResetting(false);
  };

  const getResultMessage = () => {
    const handleReset = () => {
      console.log('resetting');
      setResetting(true);
      setTimeout(() => {
        reset();
      }, 3000);
    };
    if (state.winner === null && emptyIndexes().length === 0) {
      console.log('draw');
      handleReset();
      return 'Draw!';
    }
    if (state.type === 'single') {
      if (state.winner === 'x') {
        handleReset();
        return 'You win!';
      } else if (state.winner === 'o') {
        handleReset();
        return 'Computer wins!';
      }
    } else {
      if (state.winner === state.p1.symbol) {
        handleReset();
        return 'Player 1 wins!';
      } else if (state.winner === state.p2.symbol) {
        handleReset();
        return 'Player 2 wins!';
      }
    }
    return '';
  };

  const getSymbolColor = (symbol: Symbol) => {
    const p1 = state.p1;
    const p2 = state.p2;
    if (symbol === p1.symbol) {
      return p1.color;
    } else if (symbol === p2.symbol) {
      return p2.color;
    } else {
      return 'white';
    }
  };

  const Box = state.board.map((box, index) => (
    <div
      key={index}
      onClick={() => handleClick(index)}
      style={state.winnerIndex && _.indexOf(state.winnerIndex, index) > -1 ? { color: '#badc58' } : {}}
      className="col box"
    >
      {box ? (box === 'x' ? X(getSymbolColor(box)) : O(getSymbolColor(box))) : null}
    </div>
  ));

  return (
    <div className="mt-20">
      {(state.winnerIndex || (state.winner === null && emptyIndexes().length === 0)) && (
        <div className="mb-4 text-white font-medium">
          <h1 className="text-3xl text-center">{result}</h1>
        </div>
      )}
      <div className="flex flex-row justify-center gap-14 w-full">
        <div className="flex justify-center items-center flex-col gap-4">
          <div className="h-1/2  text-center">
            <PlayerCard
              color={color}
              symbol={symbol}
              username={username || 'Player 1'}
              isComputer={isComputer}
              isPlayer1={true}
            ></PlayerCard>
            <p className="blink mt-2 text-white text-lg">{state.currentTurn === 'x' && !result ? 'My Turn' : ''}</p>
          </div>
        </div>

        <div
          className={`flex w-full board`}
          style={{
            width: '400px',
          }}
        >
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
            <p className="blink mt-2 text-white text-lg">
              {!(state.currentTurn === 'x') && !result ? (!otherPlayer.isComputer ? 'Your Turn' : 'Thinking...') : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offline;
