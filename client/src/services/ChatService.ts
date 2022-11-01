import { Message } from '@models/message';
import { Socket } from 'socket.io-client';

class ChatService {
  public async sendMessage(socket: Socket, message: string): Promise<Message> {
    return new Promise((rs, rj) => {
      socket.emit('send_message', message);
      socket.on('message_received', (data: Message) => rs(data));
      socket.on('message_received_error', (error) => rj(error));
    });
  }
}

export default new ChatService();
