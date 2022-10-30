import { Message } from '@models/message';

export interface Room {
  id: string;
  players: Array<Player>;
  messages: Array<Message>;
}

export interface Player {
  uId: string;
  username: string;
  symbol: 'x' | 'o';
  color: string;
}
