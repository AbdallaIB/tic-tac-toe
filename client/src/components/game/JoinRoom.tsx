import { ChangeEvent, FormEvent, useState, useContext } from 'react';
import styled from 'styled-components';
import gameService from '@services/GameService';
import socketService from '@services/SocketService';
import gameContext from '@context/gameContext';
import { useRouter } from '@lib/hooks/useRouter';
import Button from '@components/shared/button';
import IconButton from '@components/shared/icon-button';
import Input from '@components/shared/input';
import './game.css';
import useToast from '@lib/hooks/useToast';

const JoinRoomContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
`;

const JoinRoom = () => {
  const toast = useToast();
  const router = useRouter();
  const { setGameEvents, setMyPlayer, setOtherPlayer, setGameConfig, gameConfig } = useContext(gameContext);
  const [roomId, setRoomId] = useState('');
  const [isJoining, setJoining] = useState(false);

  const handleRoomIdChange = (e: ChangeEvent<any>) => {
    const value = e.target.value;
    setRoomId(value.slice(0, 6));
  };

  const joinRoom = async (e: FormEvent) => {
    e.preventDefault();

    const socket = socketService.socket;
    if (!roomId || !roomId.trim() || !socket) return;

    if (roomId.trim().length !== 6) return toast.error('Room Id must be 6 characters long');

    setJoining(true);

    const joined = await gameService.joinGameRoom(socket, roomId).catch((err: Error) => {
      console.log('Error: ', err);
      toast.error(err ? err.message : 'Something went wrong');
      setJoining(false);
    });
    if (!joined) return;
    const myId = socketService.socket?.id;

    const { id, players } = joined;

    players.forEach((player) => {
      if (player.uId === myId) {
        setMyPlayer((prev: any) => {
          return { ...prev, ...player, isComputer: false };
        });
      } else {
        setOtherPlayer((prev: any) => {
          return { ...prev, ...player, isComputer: false };
        });
      }
    });

    setGameConfig((prev: any) => {
      return {
        ...prev,
        roomId: id,
        gameType: 'online',
        playerMode: 'multi',
      };
    });

    console.log('joined', joined);

    if (joined) {
      setGameEvents((prev: any) => {
        return {
          ...prev,
          isInRoom: true,
        };
      });

      setJoining(false);

      router.navigate('/game', { state: gameConfig });
    }
  };

  return (
    <form onSubmit={joinRoom} className="mt-20">
      <div className="fixed top-4 left-4">
        <IconButton onClick={() => router.navigate('/')}>
          <i className="bx bx-log-out -ml-2"></i>
        </IconButton>
      </div>
      <JoinRoomContainer>
        <Input
          placeholder="Room Id (e.g. 123456)"
          value={roomId}
          required={true}
          onChange={handleRoomIdChange}
          className="bg-main text-main_white border-solid border-4 border-main_white text-xl rounded-xl p-2 input"
          type={'number'}
          maxLength={6}
          style={{ width: '20em', outline: 'none' }}
          id={''}
        />
        <Button type="submit" disabled={isJoining}>
          {isJoining ? 'Joining...' : 'Join'}
        </Button>
      </JoinRoomContainer>
    </form>
  );
};

export default JoinRoom;
