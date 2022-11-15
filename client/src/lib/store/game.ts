import create from 'zustand';

export type Player = {
  uId: string;
  color: string;
  username: string;
  symbol: 'x' | 'o';
  isComputer: boolean;
};

export type GameConfig = {
  roomId: string;
  gameType: 'offline' | 'online';
  playerMode: 'single' | 'multi';
};

export type GameEvents = {
  isInRoom: boolean;
  isPlayerTurn: boolean;
  isGameStarted: boolean;
  isGameOver: boolean;
};

export type Scores = {
  p1: number;
  p2: number;
};

type GameStore = {
  scores: Scores;
  setScores: (scores: Scores) => void;
  gameConfig: GameConfig;
  setGameConfig: (gameConfig: GameConfig) => any;
  myPlayer: Player;
  setMyPlayer: (myPlayer: Player) => any;
  otherPlayer: Player;
  setOtherPlayer: (otherPlayer: Player) => any;
  gameEvents: GameEvents;
  setGameEvents: (gameEvents: GameEvents) => any;
  clearStore: () => void;
};

const useGameStore = create<GameStore>((set, get) => ({
  scores: {
    p1: 0,
    p2: 0,
  },
  setScores: (scores: Scores) => {
    set({ scores });
  },
  gameConfig: {
    roomId: '',
    gameType: 'offline',
    playerMode: 'single',
  },
  setGameConfig: (gameConfig: GameConfig) => {
    set((state) => ({
      ...state,
      gameConfig,
    }));
  },
  myPlayer: {
    uId: '',
    color: '',
    username: '',
    symbol: 'x',
    isComputer: false,
  },
  setMyPlayer: (myPlayer: Player) => {
    set((state) => ({
      ...state,
      myPlayer,
    }));
  },
  otherPlayer: {
    uId: '',
    color: '',
    username: '',
    symbol: 'o',
    isComputer: true,
  },
  setOtherPlayer: (otherPlayer: Player) => {
    set((state) => ({
      ...state,
      otherPlayer,
    }));
  },
  gameEvents: {
    isInRoom: false,
    isPlayerTurn: false,
    isGameStarted: false,
    isGameOver: false,
  },
  setGameEvents: (gameEvents: GameEvents) => {
    set((state) => ({
      ...state,
      gameEvents,
    }));
  },
  clearStore: () => {
    set((state) => ({
      ...state,
      scores: {
        p1: 0,
        p2: 0,
      },
      gameConfig: {
        roomId: '',
        gameType: 'offline',
        playerMode: 'single',
      },
      myPlayer: {
        uId: '',
        color: '',
        username: '',
        symbol: 'x',
        isComputer: false,
      },
      otherPlayer: {
        uId: '',
        color: '',
        username: '',
        symbol: 'o',
        isComputer: true,
      },
      gameEvents: {
        isInRoom: false,
        isPlayerTurn: false,
        isGameStarted: false,
        isGameOver: false,
      },
    }));
  },
}));

export default useGameStore;
