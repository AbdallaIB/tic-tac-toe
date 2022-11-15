import { Message } from '@models/message';
import { Socket } from 'socket.io-client';

class ChatService {
  public async sendMessage(socket: Socket, message: string, roomId: string, userId: string): Promise<Message> {
    return new Promise((rs, rj) => {
      socket.emit('send_message', message, roomId, userId);
      socket.on('message_received', (data: Message) => rs(data));
      socket.on('message_received_error', (error) => rj(error));
    });
  }
  public async onMessageReceived(socket: Socket, listener: (message: Message) => void) {
    socket.on('message_received', (message) => listener(message));
  }
}

export default new ChatService();
