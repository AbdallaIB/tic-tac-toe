import { createContext } from 'react';

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

export interface IGameContextProps {
  scores: Scores;
  setScores: (scores: Scores) => void;
  gameConfig: GameConfig;
  setGameConfig: (prev: any) => any;
  myPlayer: Player;
  setMyPlayer: (prev: any) => any;
  otherPlayer: Player;
  setOtherPlayer: (prev: any) => any;
  gameEvents: GameEvents;
  setGameEvents: (prev: any) => any;
}

const defaultState: IGameContextProps = {
  scores: {
    p1: 0,
    p2: 0,
  },
  setScores: () => {},
  gameConfig: {
    roomId: '',
    gameType: 'offline',
    playerMode: 'single',
  },
  setGameConfig: () => {},
  myPlayer: {
    uId: '',
    color: '',
    username: '',
    symbol: 'x',
    isComputer: false,
  },
  setMyPlayer: () => 0,
  otherPlayer: {
    uId: '',
    color: '',
    username: '',
    symbol: 'o',
    isComputer: true,
  },
  setOtherPlayer: () => 0,
  gameEvents: {
    isInRoom: false,
    isPlayerTurn: false,
    isGameStarted: false,
    isGameOver: false,
  },
  setGameEvents: () => 0,
};

export default createContext(defaultState);
