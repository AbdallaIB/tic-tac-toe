import { useEffect, useState } from 'react';
import styled from 'styled-components';
import './App.css';
import Loader from '@components/loader';
import Routes from '@routes/index';
import Settings from '@components/settings';
import CountdownTimer from '@components/countdown-timer';
import socketService from '@services/SocketService';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { useRouter } from '@lib/hooks/useRouter';
import logo from '@assets/icons/logo_bold.png';
import useToast from '@lib/hooks/useToast';
import { Toaster } from 'react-hot-toast';
import Modal from '@components/modal';
import useModal from '@lib/hooks/useModal';
import theme from '@styles/shared/theme';
import { formatFinalScore, PageTitles } from '@utils/helpers';
import { useLocation } from 'react-router-dom';
import useGameStore from '@lib/store/game';

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const App = () => {
  const { pathname } = useLocation();
  const { navigate, location } = useRouter();
  const toast = useToast();
  const { gameEvents, gameConfig, scores, otherPlayer, setGameConfig, setGameEvents, clearStore } = useGameStore();
  const { isModalOpen, setIsModalOpen } = useModal();
  const handle = useFullScreenHandle();
  const [isLoading, setIsLoading] = useState(true);

  const onTimerEndHandler = () => {
    if (!gameEvents.isInRoom) navigate('/');
    else {
      setIsModalOpen(true);
    }
  };

  const leaveGame = () => {
    setIsModalOpen(false);
    setGameConfig({ ...gameConfig, roomId: '' });
    setGameEvents({ ...gameEvents, isInRoom: false });
    clearStore();
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

  useEffect(() => {
    const path: keyof typeof PageTitles = pathname as any;
    document.title = PageTitles[path] ?? 'Tic Tac Toe';
  }, [pathname]);

  const pathName = location.pathname;
  const showLargeLogo = isLoading || pathName === '/' || pathName === '/join';
  const isLobby = pathName.startsWith('/lobby');

  return (
    <FullScreen className="AppContainer" handle={handle}>
      <div className="flex flex-col items-center justify-start gap-4 text-white h-full w-full relative">
        {!isLoading && (
          <header className="grid items-start justify-end flex-row w-full mt-4 px-4 fluid-grid">
            <div className="flex justify-start">
              {gameEvents.isInRoom && (
                <CountdownTimer hours={0} seconds={0} minutes={2} onTimerEnd={onTimerEndHandler} />
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
            <span>{formatFinalScore(scores, gameConfig, otherPlayer).msg}</span>
          </div>
        </Modal>
      </div>
    </FullScreen>
  );
};

export default App;
