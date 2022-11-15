import { getHashMap, setHashMap } from '@thirdParty/redis-client';
import loggerHandler from '@utils/logger';
const moduleName = '[socket] ';
const logger = loggerHandler(moduleName);
import { ConnectedSocket, OnConnect, SocketController, SocketIO } from 'socket-controllers';
import { Socket, Server } from 'socket.io';
import { generateUsername } from '@utils/username';
import { generateColor } from '@utils/color';
import { Message } from '@models/message';
import { Room } from '@models/room';
import { removeObscenities } from '@utils/obscenities';
import { timestamp } from '@utils/date-time';

@SocketController()
export class MainController {
  private generateRandomId(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getSocketRoomId(socket: Socket): string {
    const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);
    const gameRoom = socketRooms && socketRooms[0];
    return gameRoom;
  }

  @OnConnect()
  public onConnection(@ConnectedSocket() socket: Socket, @SocketIO() io: Server) {
    const id = socket.id;

    logger.info('New Socket connected:', id);

    socket.on('create_game', async () => {
      logger.info('[create_game]');
      const roomId = this.generateRandomId();
      const room: Room = {
        id: roomId,
        messages: [],
        players: [
          {
            uId: socket.id,
            username: generateUsername(),
            symbol: 'x',
            color: generateColor(['']),
          },
        ],
        gameEndsAt: new Date(Date.now() + 2 * 60 * 1000),
      };
      const { success } = await setHashMap('rooms', roomId, JSON.stringify(room));
      if (success) {
        socket.join(roomId);
        socket.emit('room_created', { ...room });
      } else {
        socket.emit('room_created_error', { message: 'Room creation failed' });
      }
    });

    socket.on('send_message', async (msg: string, roomId: string, username: string) => {
      logger.info('[send_message]', { msg, roomId, username });
      if (!roomId) return socket.emit('message_received_error', { message: 'Room not found.' });
      const { success, data } = await getHashMap('rooms', roomId);
      if (!success)
        return socket.emit('message_received_error', {
          message: 'Room not found',
        });
      const room: Room = JSON.parse(data);
      const index = findWithAttr(room.players, 'username', username);
      if (index < 0) {
        // user not found
        socket.emit('message_received_error', { message: 'User not found.' });
        return;
      }
      const userObj = room.players[index];

      const msgObj: Message = {
        id: this.generateRandomId(),
        userId: userObj.uId,
        username: userObj.username,
        content: removeObscenities(msg),
        color: userObj.color,
        createdAt: timestamp(),
      };

      room.messages.push(msgObj);
      const result = await setHashMap('rooms', roomId, JSON.stringify(room));
      if (result.success) {
        io.to(roomId).emit('message_received', msgObj);
      } else {
        socket.emit('message_received_error', { message: 'Message sending failed' });
      }
    });

    socket.on('join_game', async (message: { roomId: string }) => {
      const { roomId } = message;
      logger.info('[join_game]', 'New User joining room: ' + roomId);
      const { success, data } = await getHashMap('rooms', roomId);
      if (!success)
        return socket.emit('room_join_error', {
          message: 'Room is full please choose another room to play!',
        });
      const room: Room = JSON.parse(data);
      if (!room || (room && room.players && room.players.length === 2)) {
        socket.emit('room_join_error', {
          message: 'Room not found or is full!',
        });
        return;
      }
      const username = generateUsername();
      const newPlayer = {
        uId: id,
        username,
        symbol: 'o',
        color: generateColor(['']),
      };
      const newRoom = {
        ...room,
        players: [...room.players, newPlayer],
      };
      const result = await setHashMap('rooms', roomId, JSON.stringify(newRoom));
      if (result.success) {
        socket.join(roomId);
        socket.emit('room_joined', { ...newRoom });
        socket.to(roomId).emit('on_user_joined', { ...newRoom });
        if (newRoom.players.length === 2) {
          io.to(roomId).emit('start_game', { start: true, symbol: 'x', room: newRoom });
        }
      } else {
        socket.emit('room_join_error', { message: 'Joining room failed' });
      }
    });

    socket.on('update_game', (data: any) => {
      logger.info('[update_game]', data);
      const gameRoomId = this.getSocketRoomId(socket);
      console.log('gameRoom', gameRoomId);
      io.to(gameRoomId).emit('on_game_update', data);
    });

    socket.on('game_win', async (message: any) => {
      logger.info('[game_win]', message);
      const gameRoomId = this.getSocketRoomId(socket);
      const { success, data } = await getHashMap('rooms', gameRoomId);
      if (!success)
        return socket.emit('room_join_error', {
          message: 'Room is full please choose another room to play!',
        });
      const room: Room = JSON.parse(data);
      if (!room) {
        socket.emit('room_join_error', {
          message: 'Room not found or is full!',
        });
        return;
      }
      const currentDate = new Date();
      const gameEndsAt = new Date(room.gameEndsAt);
      if (currentDate > gameEndsAt) {
        socket.emit('on_game_win', {
          message: 'Game has ended!',
        });
        return;
      }
      const { winner } = message;
      io.to(gameRoomId).emit('on_game_win', { ...message, newPlayerTurn: winner === 'x' ? 'o' : 'x' });
    });
  }
}

const findWithAttr = (array: Array<Object>, attr: string, value: string) => {
  if (!array || !array.length) {
    return -1;
  }
  for (let i = 0; i < array.length; i += 1) {
    if (array[i][attr] === value) {
      return i;
    }
  }
  return -1;
};
