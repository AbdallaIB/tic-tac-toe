import { useEffect, useState } from 'react';
import styled from 'styled-components';
import './App.css';
import GameContext, { GameConfig, GameEvents, IGameContextProps, Player } from '@context/gameContext';
import { Loader } from '@components/loader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Routes from '@routes/index';
import { Settings } from '@components/settings';
import CountdownTimer from '@components/timer';
import Modal from '@components/modal';
import socketService from '@services/socketService';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { useRouter } from '@lib/hooks/useRouter';
import logo from '@assets/icons/logo.svg';

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

function App() {
  const router = useRouter();
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

  const defaultState: IGameContextProps = {
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
  const [isModalOpen, setModalState] = useState(false);
  const [modalType, setModalType] = useState<'gameOver' | 'exitGame'>('gameOver');
  const leaveGameHandler = () => {
    if (!gameEvents.isInRoom) router.navigate('/');
    else {
      setModalType('gameOver');
      setModalState(true);
    }
  };
  const connectSocket = async () => {
    await socketService.connect(process.env.SOCKET_ENDPOINT as string).catch((err: Error) => {
      console.log('Error: ', err);
      toast.error(err ? err.message : 'Something went wrong');
    });
    console.log('sonnected: ', socketService.socket);
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

  const MINS = 2;
  const MIN_IN_MS = 60 * 1000 * MINS;
  const NOW_IN_MS = new Date(new Date().getTime() + MIN_IN_MS);

  const score = 0;
  const isLobby = router.location.pathname.startsWith('/lobby');

  return (
    <GameContext.Provider value={defaultState}>
      <FullScreen className="AppContainer" handle={handle}>
        <div className="flex flex-col items-center justify-start gap-4 text-white h-full w-full">
          <div className="grid items-start justify-end flex-row w-full mt-4 px-4 fluid-grid h-20">
            <div className="flex justify-start">{gameEvents.isInRoom && <CountdownTimer targetDate={NOW_IN_MS} />}</div>
            <div className="flex justify-center">
              {(gameEvents.isInRoom || isLobby) && <img className="h-20" src={logo} alt="logo" />}
            </div>
            <Settings
              leaveGame={leaveGameHandler}
              fullScreenHandle={handle}
              fullScreenToggle={handle.active ? handle.exit : handle.enter}
            ></Settings>
          </div>

          {isModalOpen && (
            <div>
              <Modal
                type={modalType}
                confirmationData={{
                  score,
                  isOpen: isModalOpen,
                  text: 'Are you sure',
                  onCancel: () => {
                    setModalState(false);
                  },
                  onConfirm: () => {},
                }}
              ></Modal>
            </div>
          )}
          <ToastContainer toastClassName="bg-main_white" pauseOnHover={false} />
          <MainContainer className="gap-4" style={{ height: !gameEvents.isInRoom && !isLobby ? '65%' : '100%' }}>
            {!gameEvents.isInRoom && !isLobby && (
              <div>
                <img src={logo} alt="logo" />
              </div>
            )}
            {isLoading && <Loader width={250} percent={1}></Loader>}
            {!isLoading && <Routes />}
          </MainContainer>
        </div>
      </FullScreen>
    </GameContext.Provider>
  );
}

export default App;
