import useGameStore from '@lib/store/game';
import { useEffect, useState } from 'react';

interface ICountdown {
  hours: number;
  minutes: number;
  seconds: number;
}

const CountDownTimer = ({
  hours = 0,
  minutes = 2,
  seconds = 0,
  onTimerEnd,
}: ICountdown & { onTimerEnd: () => void }) => {
  const { setGameEvents, gameEvents } = useGameStore();
  const [time, setTime] = useState<ICountdown>({ hours, minutes, seconds });

  const tick = () => {
    if (time.hours === 0 && time.minutes === 0 && time.seconds === 0) reset();
    else if (time.seconds === 0) {
      setTime({ hours: time.hours, minutes: time.minutes - 1, seconds: 59 });
    } else {
      setTime({ hours: time.hours, minutes: time.minutes, seconds: time.seconds - 1 });
    }
  };
  const reset = () => {
    setTime({ hours: time.hours, minutes: time.minutes, seconds: time.seconds });
    onTimerEnd();
    setGameEvents({
      ...gameEvents,
      isGameOver: true,
    });
  };

  useEffect(() => {
    const timerId = setInterval(() => tick(), 1000);
    return () => clearInterval(timerId);
  });

  return (
    <div className="flex flex-row py-2 px-4 bg-main_dark rounded-xl text-white font-bold text-2xl">
      <span>{time.minutes}</span>
      <p className="font-bold text-2xl">:</p>
      <span>{time.seconds.toString().padStart(2, '0')}</span>
    </div>
  );
};

export default CountDownTimer;
