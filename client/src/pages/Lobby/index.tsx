import { PlayerCard } from '@components/player';
import Button from '@components/shared/button';
import IconButton from '@components/shared/icon-button';
import { generateColor } from '@lib/hooks/useRandomColor';
import { useRouter } from '@lib/hooks/useRouter';
import useToast from '@lib/hooks/useToast';
import useGameStore, { GameConfig } from '@lib/store/game';
import gameService from '@services/GameService';
import socketService from '@services/SocketService';
import { useEffect } from 'react';
import './index.css';

const Lobby = () => {
  const { success, error } = useToast();
  const router = useRouter();
  const {
    myPlayer,
    otherPlayer,
    setGameEvents,
    setGameConfig,
    gameConfig,
    gameEvents,
    setMyPlayer,
    setOtherPlayer,
    clearStore,
  } = useGameStore();

  useEffect(() => {
    const state = router.location.state as GameConfig;
    console.log(router.location.state, gameConfig);
    if (!gameConfig || gameConfig.gameType !== state.gameType) {
      clearStore();
      router.navigate('/');
    }
    if (gameConfig.gameType === 'online') {
      setOtherPlayer({ ...otherPlayer, isComputer: false });
      handleUserJoined();
      handleStartGame();
      createRoom();
      console.log('online');
    }
    if (gameConfig.gameType === 'offline') {
      // set colors
      changeColors('renew');
    }
  }, []);

  const createRoom = async () => {
    const socket = socketService.socket;
    if (!socket) return;

    const room = await gameService.createGameRoom(socket).catch((err) => {
      console.log('Error: ', err);
      error(err ? err.message : 'Something went wrong');
    });
    if (!room) return;
    const myId = socketService.socket?.id;

    const { id, players } = room;

    players.forEach((player) => {
      if (player.uId === myId) {
        setMyPlayer({ ...player, isComputer: false });
      } else {
        setOtherPlayer({ ...player, isComputer: false });
      }
    });

    setGameConfig({ ...gameConfig, roomId: id, gameType: 'online', playerMode: 'multi' });

    console.log('created', room, gameConfig);
  };

  const handleStartGame = () => {
    const socket = socketService.socket;
    if (socket)
      gameService.onStartGame(socket, (data) => {
        const { id, players } = data.room;

        console.log('start game', myPlayer, otherPlayer);
        setGameEvents({
          ...gameEvents,
          isPlayerTurn: data.symbol === myPlayer.symbol,
          isInRoom: true,
          isGameStarted: true,
        });
        players.forEach((player) => {
          if (player.uId === socket.id) {
            setMyPlayer({ ...player, isComputer: false });
          } else {
            setOtherPlayer({ ...player, isComputer: false });
          }
        });
        router.navigate('/online', { state: gameConfig });
      });
  };

  const handleUserJoined = () => {
    const socket = socketService.socket;
    if (socket)
      gameService.onUserJoined(socket, (room) => {
        console.log('onUserJoined', room);
        room.players.forEach((player) => {
          if (player.username !== myPlayer.username) {
            setOtherPlayer({ ...player, isComputer: false });
          }
        });
      });
  };

  const changeColors = async (type: 'swap' | 'renew') => {
    setMyPlayer({
      ...myPlayer,
      color: type === 'renew' ? generateColor([myPlayer.color, otherPlayer.color]) : otherPlayer.color,
    });
    setOtherPlayer({
      ...otherPlayer,
      color: type === 'renew' ? generateColor([myPlayer.color, otherPlayer.color]) : myPlayer.color,
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(gameConfig.roomId);
    success('Room ID copied!');
  };

  const handleStartOfflineGame = () => {
    setGameEvents({
      ...gameEvents,
      isGameStarted: true,
    });
    router.navigate('/offline', {
      state: { gameConfig, myPlayer, otherPlayer },
    });
  };

  return (
    <div className="flex flex-col justify-around w-full h-3/4 text-main_white mt-20">
      {gameConfig.gameType === 'online' && (
        <>
          <div className="flex flex-row gap-2 text-center items-center justify-center">
            <h1 className="text-3xl font-semibold">Room Id: {gameConfig.roomId}</h1>
            <IconButton style={{ padding: '0px 3px', height: '2.5rem', width: '2.5rem' }} onClick={copyRoomId}>
              <i className="bx bx-clipboard text-xl"></i>
            </IconButton>
          </div>

          <div className="flex text-center justify-center">
            <h1 className="text-xl font-semibold">
              Waiting for other player to join<span className="loading"></span>
            </h1>
          </div>
        </>
      )}
      <div className="flex flex-row justify-evenly">
        <PlayerCard
          color={myPlayer.color}
          symbol={myPlayer.symbol}
          username={myPlayer.username}
          isComputer={false}
          isPlayer1={true}
        ></PlayerCard>
        <div className="flex flex-col items-center justify-center gap-4">
          <span className="text-5xl font-black text-white">VS</span>
          {gameConfig.gameType === 'offline' && (
            <div className="flex flex-row items-center justify-center gap-6">
              <IconButton onClick={() => changeColors('renew')}>
                <i className="bx bx-paint"></i>
              </IconButton>
              <IconButton onClick={() => changeColors('swap')}>
                <i className="bx bx-transfer"></i>
              </IconButton>
            </div>
          )}
        </div>
        <PlayerCard
          color={otherPlayer.color}
          symbol={otherPlayer.symbol}
          username={otherPlayer.username}
          isComputer={otherPlayer.isComputer}
          isPlayer1={false}
        ></PlayerCard>
      </div>
      {gameConfig.gameType === 'offline' && (
        <div className="flex justify-center">
          <Button onClick={handleStartOfflineGame}>Start</Button>
        </div>
      )}
    </div>
  );
};

export default Lobby;
