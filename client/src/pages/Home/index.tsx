import Button from '@components/shared/button';
import IconButton from '@components/shared/icon-button';
import { useRouter } from '@lib/hooks/useRouter';
import useGameStore, { GameConfig } from '@lib/store/game';
import { useState } from 'react';

const Home = () => {
  const router = useRouter();
  const { gameConfig, setGameConfig } = useGameStore();
  const [hasSetGameType, setHasSetGameType] = useState(false);

  const handleGameConfig = (prop: string, value: string, navigate: boolean) => {
    const newGameConfig: GameConfig = {
      ...gameConfig,
      [prop]: value,
    };
    setGameConfig(newGameConfig);
    if (navigate) {
      router.navigate('/lobby', { state: newGameConfig });
    }
  };

  return (
    <div className="home flex flex-col">
      <div className="fixed top-4 left-4">
        {hasSetGameType && (
          <IconButton onClick={() => setHasSetGameType(false)}>
            <i className="bx bx-log-out -ml-2"></i>
          </IconButton>
        )}
      </div>
      <div className="flex flex-row gap-2">
        {hasSetGameType && gameConfig.gameType === 'offline' && (
          <div className="flex gap-12">
            <Button onClick={() => handleGameConfig('playerMode', 'single', true)}>1 Player</Button>
            <Button onClick={() => handleGameConfig('playerMode', 'multi', true)}>2 Player</Button>
          </div>
        )}

        {hasSetGameType && gameConfig.gameType === 'online' && (
          <div className="flex gap-12">
            <Button onClick={() => router.navigate('/join')}>Join</Button>
            <Button onClick={() => handleGameConfig('playerMode', 'multi', true)}>Create</Button>
          </div>
        )}

        {!hasSetGameType && (
          <div className="flex gap-12">
            <Button
              onClick={() => {
                handleGameConfig('gameType', 'online', false);
                setHasSetGameType(true);
              }}
            >
              Multiplayer
            </Button>
            <Button
              onClick={() => {
                handleGameConfig('gameType', 'offline', false);
                setHasSetGameType(true);
              }}
            >
              Singleplayer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
