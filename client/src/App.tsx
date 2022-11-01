import { useEffect, useState } from 'react';
import styled from 'styled-components';
import './App.css';
import GameContext, { GameConfig, GameEvents, IGameContextProps, Player, Scores } from '@context/gameContext';
import Loader from '@components/loader';
import Routes from '@routes/index';
import Settings from '@components/settings';
import CountdownTimer from '@components/countdown-timer';
import socketService from '@services/SocketService';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { useRouter } from '@lib/hooks/useRouter';
import logo from '@assets/icons/logo.svg';
import useToast from '@lib/hooks/useToast';
import { Toaster } from 'react-hot-toast';
import Modal from '@components/modal';
import useModal from '@lib/hooks/useModal';
import theme from '@styles/shared/theme';

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const App = () => {
  const { navigate, location } = useRouter();
  const toast = useToast();
  const { isModalOpen, setIsModalOpen } = useModal();
  const handle = useFullScreenHandle();
  const [myPlayer, setMyPlayer] = useState<Player>({
    uId: '',
    color: '',
    username: '',
    symbol: 'x',
    isComputer: false,
  });
  const [otherPlayer, setOtherPlayer] = useState<Player>({
    uId: '',
    color: '',
    username: '',
    symbol: 'o',
    isComputer: true,
  });

  const [gameConfig, setGameConfig] = useState<GameConfig>({
    roomId: '',
    gameType: 'offline',
    playerMode: 'single',
  });

  const [gameEvents, setGameEvents] = useState<GameEvents>({
    isInRoom: false,
    isPlayerTurn: false,
    isGameStarted: false,
    isGameOver: false,
  });

  const [scores, setScores] = useState({
    p1: 0,
    p2: 0,
  });

  const defaultState: IGameContextProps = {
    scores,
    setScores,
    gameConfig,
    setGameConfig,
    myPlayer,
    setMyPlayer,
    otherPlayer,
    setOtherPlayer,
    gameEvents,
    setGameEvents,
  };

  const [isLoading, setIsLoading] = useState(true);

  const onTimerEndHandler = () => {
    if (!gameEvents.isInRoom) navigate('/');
    else {
      setIsModalOpen(true);
    }
  };

  const leaveGame = () => {
    setIsModalOpen(false);
    setGameConfig((prev) => ({ ...prev, roomId: '' }));
    setGameEvents((prev) => ({ ...prev, isInRoom: false }));
    navigate('/');
  };

  const connectSocket = async () => {
    await socketService.connect(process.env.SOCKET_ENDPOINT as string).catch((err: Error) => {
      console.log('Error: ', err);
      toast.error(err ? err.message : 'Something went wrong');
    });
    console.log('connected: ', socketService.socket);
  };

  useEffect(() => {
    connectSocket();
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      const socket = socketService.socket;
      if (socket) socket.disconnect();
    };
  }, []);

  const handleFinalScore = (scores: Scores, gameConfig: GameConfig) => {
    const { p1, p2 } = scores;
    const { playerMode } = gameConfig;
    const pointsDiff = Math.abs(p1 - p2);
    const points = pointsDiff > 1 ? 'points' : 'point';
    if (p1 === 0 && p2 === 0) return { msg: 'Game ended with no wins!' };
    if (playerMode === 'single') {
      if (p1 > p2) return { msg: `You won by ${pointsDiff} ${points}!`, score: p1 };
      if (p1 < p2) return { msg: `Computer won by ${pointsDiff} ${points}!`, score: p2 };
      return { msg: 'Game ended in a draw!', score: 0 };
    } else if (playerMode === 'multi') {
      if (p1 > p2) return { msg: `Player 1 won by ${pointsDiff} ${points}!`, score: p1 };
      if (p1 < p2) return { msg: `Player 2 won by ${pointsDiff} ${points}!`, score: p2 };
      return { msg: 'Game ended in a draw!', score: 0 };
    }
    if (p1 > p2) return { msg: `You won by ${pointsDiff} ${points}!`, score: p1 };
    if (p1 < p2) return { msg: `${otherPlayer.username} won by ${pointsDiff} ${points}!`, score: p2 };
    return { msg: 'Game ended in a draw!', score: 0 };
  };

  const pathName = location.pathname;
  const showLargeLogo = isLoading || pathName === '/' || pathName === '/join';
  const isLobby = pathName.startsWith('/lobby');

  return (
    <GameContext.Provider value={defaultState}>
      <FullScreen className="AppContainer" handle={handle}>
        <div className="flex flex-col items-center justify-start gap-4 text-white h-full w-full relative">
          {!isLoading && (
            <header className="grid items-start justify-end flex-row w-full mt-4 px-4 fluid-grid">
              <div className="flex justify-start">
                {gameEvents.isInRoom && (
                  <CountdownTimer hours={0} seconds={10} minutes={0} onTimerEnd={onTimerEndHandler} />
                )}
              </div>
              <div className="flex justify-center">
                {!showLargeLogo && <img className={'h-20'} src={logo} alt="logo" />}
              </div>
              <Settings
                fullScreenHandle={handle}
                fullScreenToggle={handle.active ? handle.exit : handle.enter}
              ></Settings>
            </header>
          )}
          <main className="fill-available-height fill-available-width">
            <MainContainer
              className="gap-4 relative"
              style={{ height: !gameEvents.isInRoom || !isLobby || pathName.startsWith('/offline') ? '65%' : '100%' }}
            >
              {showLargeLogo && <img src={logo} alt="logo" />}
              {isLoading && <Loader width={250} percent={1}></Loader>}
              {!isLoading && <Routes />}
            </MainContainer>
          </main>
          {/* Toast Container */}
          <Toaster
            toastOptions={{
              position: 'top-center',
              style: { backgroundColor: theme.colors.main_dark, color: 'white' },
            }}
          />
          {/* Modal */}
          <Modal
            hasFooter={true}
            hasCancelButton={false}
            styles={{ content: { height: 'auto', width: 'auto' } }}
            isOpen={isModalOpen}
            title={'Game Over'}
            cancel={leaveGame}
            confirm={leaveGame}
            confirmText="Continue"
          >
            <div className="text-2xl m-12 whitespace-nowrap">
              <span>{handleFinalScore(scores, gameConfig).msg}</span>
            </div>
          </Modal>
        </div>
      </FullScreen>
    </GameContext.Provider>
  );
};

export default App;
