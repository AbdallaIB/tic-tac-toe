import { IBoard, IStartGame } from '@components/game/Online';
import { Room } from '@models/room';
import { Socket } from 'socket.io-client';

class GameService {
  public async createGameRoom(socket: Socket): Promise<Room> {
    return new Promise((rs, rj) => {
      socket.emit('create_game');
      socket.on('room_created', (data: Room) => rs(data));
      socket.on('room_created_error', (error) => rj(error));
    });
  }
  public async joinGameRoom(socket: Socket, roomId: string): Promise<Room> {
    return new Promise((rs, rj) => {
      socket.emit('join_game', { roomId });
      socket.on('room_joined', (data: Room) => rs(data));
      socket.on('room_join_error', (error) => rj(error));
    });
  }

  public async onUserJoined(socket: Socket, listener: (room: Room) => void) {
    socket.on('on_user_joined', (room) => listener(room));
  }

  public async updateGame(socket: Socket, gameMatrix: IBoard) {
    socket.emit('update_game', { matrix: gameMatrix });
  }

  public async onGameUpdate(socket: Socket, listener: (matrix: IBoard) => void) {
    socket.on('on_game_update', ({ matrix }) => listener(matrix));
  }

  public async onStartGame(socket: Socket, listener: (options: IStartGame) => void) {
    socket.on('start_game', listener);
  }

  public async gameWin(socket: Socket, { message, indexes }: { message: string; indexes: number[] }) {
    socket.emit('game_win', { message, indexes });
  }

  public async onGameWin(socket: Socket, listener: (message: string, indexes: number[]) => void) {
    socket.on('on_game_win', ({ message, indexes }) => listener(message, indexes));
  }
}

export default new GameService();
