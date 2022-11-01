import { getHashMap, setHashMap } from '@thirdParty/redis-client';
import loggerHandler from '@utils/logger';
const moduleName = '[socket] ';
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

    console.log('New Socket connected:', socket.id);

    socket.on('create_game', async () => {
      const roomId = this.generateRandomId();
      const room: Room = {
        id: roomId,
        messages: [],
        players: [
          {
            uId: id,
            username: generateUsername(),
            symbol: 'x',
            color: generateColor(['']),
          },
        ],
      };
      setHashMap('rooms', roomId, JSON.stringify(room), (success) => {
        if (success) {
          socket.join(roomId);
          socket.emit('room_created', { ...room });
        } else {
          socket.emit('room_created_error', { message: 'Room creation failed' });
        }
        console.log('done');
      });
    });

    socket.on('send_message', async (msg: string) => {
      const roomId = this.getSocketRoomId(socket);
      if (!roomId) return socket.emit('message_received_error', { message: 'Room not found.' });
      console.log('roomId', roomId);
      getHashMap('rooms', roomId, (success, data) => {
        if (success) {
          const room: Room = JSON.parse(data[0]);
          console.log('room', room, id);
          const index = findWithAttr(room.players, 'uId', id);
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
          setHashMap('rooms', roomId, JSON.stringify(room), (success) => {
            if (success) {
              io.to(roomId).emit('message_received', msgObj);
            } else {
              socket.emit('message_received_error', { message: 'Message sending failed' });
            }
          });
        } else {
          socket.emit('message_received_error', {
            message: 'Room not found',
          });
        }
      });
    });

    socket.on('join_game', async (message: { roomId: string }) => {
      const { roomId } = message;
      console.log('New User joining room: ' + roomId);

      getHashMap('rooms', roomId, (success, data) => {
        if (success) {
          const room: Room = JSON.parse(data[0]);
          if (!room || (room && room.players.length === 2)) {
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
          setHashMap('rooms', roomId, JSON.stringify(newRoom), (success) => {
            if (success) {
              socket.join(roomId);
              socket.emit('room_joined', { ...newRoom });
              socket.to(roomId).emit('on_user_joined', { ...newRoom });

              if (newRoom.players.length === 2) {
                io.to(roomId).emit('start_game', { start: true, symbol: 'x' });
              }
            } else {
              socket.emit('room_join_error', { message: 'Joining room failed' });
            }
            console.log('done');
          });
          console.log('roomData: ', room);
        } else {
          socket.emit('room_join_error', {
            message: 'Room is full please choose another room to play!',
          });
          console.log('No roomData');
        }
      });
    });

    socket.on('update_game', (message: any) => {
      const gameRoom = this.getSocketRoomId(socket);
      console.log('update_game', message);
      socket.to(gameRoom).emit('on_game_update', message);
    });

    socket.on('game_win', (message: any) => {
      const gameRoom = this.getSocketRoomId(socket);
      console.log('game_win', message, gameRoom);
      socket.to(gameRoom).emit('on_game_win', message);
    });
  }
}

const findWithAttr = (array, attr, value) => {
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
