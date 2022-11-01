import 'emoji-mart/css/emoji-mart.css';
import { BaseEmoji, Picker } from 'emoji-mart';
import { ChangeEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { showMenu } from '@components/settings';
import socketService from '@services/SocketService';
import chatService from '@services/ChatService';
import { Message } from '@models/message';
import IconButton from '@components/shared/icon-button';
import { useRouter } from '@lib/hooks/useRouter';
import './index.css';
import useToast from '@lib/hooks/useToast';

const messageInput = {
  height: '30px',
  fontSize: '15px',
  outline: 'none',
  border: '1px solid #a42ef2',
  borderRadius: '3px',
  padding: '0 10px',
};

const Chat = () => {
  const toast = useToast();
  const router = useRouter();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showChat, setShowChat] = useState(false);

  const handleMessageChange = (e: ChangeEvent<any>) => {
    const value = e.target.value;
    setMessage(value);
  };

  const addEmoji = (emojiData: BaseEmoji) => {
    if (emojiData.native && emojiData.native !== 'undefined') {
      setMessage(message + emojiData.native);
    }
    console.log(emojiData);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (message && message.match(/\S/)) {
      const socket = socketService.socket;

      if (!socket) return;

      const msg = await chatService.sendMessage(socket, message).catch((err) => {
        const message = err ? err.message : 'Something went wrong';
        console.log(err);
        if (message === 'Room not found.' || message === 'User not found.' || message === 'Message sending failed') {
          router.navigate('/');
        }
        toast.error(message);
      });
      if (!msg) return;

      const createdAt = getTimestamp(msg.createdAt);
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.createdAt && lastMsg.userId === msg.userId) {
        (lastMsg.content as string[]).push(msg.content as string);
        lastMsg.createdAt = createdAt.toString();
        lastMsg.formattedDate = formatAMPM(createdAt);
      } else {
        setMessages([
          ...messages,
          {
            id: msg.id,
            color: msg.color,
            userId: msg.userId,
            username: msg.username,
            content: [msg.content as string],
            firstCharacter: msg.username.charAt(0).toUpperCase(),
            createdAt: createdAt.toString(),
            formattedDate: formatAMPM(createdAt),
          },
        ]);
      }
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const getTimestamp = (date: string | number | Date) => {
    // convert date to local time before getting timestamp
    return new Date(new Date(date).toString());
  };

  const formatAMPM = (date: Date) => {
    date = getTimestamp(date);
    let hours = date.getHours();
    let minutes: number | string = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours %= 12;
    hours = hours || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    const strTime = `${hours}:${minutes} ${ampm}`;
    return strTime;
  };

  return (
    <>
      <motion.div className="relative">
        <motion.ul
          variants={showMenu}
          initial="exit"
          animate={showChat ? 'enter' : 'exit'}
          className="rounded-sm absolute bottom-14"
          style={{ height: '60vh', width: '30vw', zIndex: 999 }}
        >
          <div className="chat_panel bg-main_dark w-full h-full rounded-2xl">
            <div id="chat-panel" className="h-full">
              <div id="Chat" className="w-full h-full flex">
                <div className="chat_box flex flex-col py-4 px-2 w-full h-full">
                  <div className="w-full p-0 h-auto">
                    <div className="flex justify-start text-center relative items-center h-full py-2 w-full">
                      <h1 className="font-semibold side-color w-full">Chat</h1>
                    </div>
                  </div>
                  <div className="h-full flex flex-col justify-between">
                    {messages.length === 0 && (
                      <div className="empty_chat_body flex-col flex items-center justify-start">
                        <div className="mt-6 flex">
                          <span className="text-sm font-light text-center text-main_white dark:text-white">
                            No messages has been sent yet
                          </span>
                        </div>
                      </div>
                    )}

                    {messages.length > 0 && (
                      <div
                        className="h-full grid grid-flow-row content-start gap-2 items-center chat_body overflow-auto p-2"
                        style={{ height: '45vh' }}
                      >
                        {messages.map((msg, index) => (
                          <div key={index} className={'messageDiv w-full flex flex-row pb-4'}>
                            <div className="flex w-full message">
                              <div className="iconWrapper flex items-start justify-center mt-4">
                                <div className="prof" style={{ backgroundColor: msg.color }}>
                                  {msg.firstCharacter || msg.username.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="GDhqjd">
                                <span className="text-main_white dark:text-white" style={{ fontSize: '14px' }}>
                                  {msg.username}
                                </span>
                                <div className="Zmm6We">
                                  <div className="flex flex-col gap-1.5 text-main_white dark:text-white">
                                    {(msg.content as string[]).map((item, index) => (
                                      <span key={index} className="oIy2qc">
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                  <span
                                    className="MuzmKe opacity-70 whitespace-nowrap flex items-end text-main_whitedark:text-white"
                                    style={{ marginLeft: '10px' }}
                                  >
                                    {msg.formattedDate}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <div className="chat_footer">
                        <Picker
                          theme="dark"
                          showPreview={false}
                          showSkinTones={false}
                          onSelect={addEmoji}
                          style={{
                            position: 'absolute',
                            bottom: '80%',
                            zIndex: 999,
                            display: showEmojiPicker ? 'block' : 'none',
                          }}
                        />
                        <div className="w-full flex-row flex justify-center gap-1 items-center relative">
                          <div className="input-append flex h-full">
                            <button
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              className="flex items-center justify-center rounded-lg h-auto p-2 text-3xl w-auto"
                              style={{ padding: '0.35rem' }}
                              type="button"
                            >
                              <i className="bx bx-smile"></i>
                            </button>
                          </div>
                          <div className="flex items-center justify-center relative">
                            <input
                              className="h-full px-3 py-2 rounded-sm text-base w-full text-main_dark"
                              style={messageInput}
                              placeholder="Type a message"
                              value={message}
                              onChange={handleMessageChange}
                              onKeyDown={handleKeyDown}
                            ></input>
                          </div>
                          <div className="input-append flex h-full cursor-pointer">
                            <button
                              onClick={sendMessage}
                              className="flex items-center justify-center rounded-lg h-auto p-2 text-3xl w-auto"
                              type="button"
                              title="Send"
                            >
                              <i className="bx bxs-send"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
        <IconButton onClick={() => setShowChat(!showChat)}>
          <i className="bx bx-conversation" style={{ fontSize: '1.75rem' }}></i>
        </IconButton>
      </motion.div>
    </>
  );
};

export default Chat;
