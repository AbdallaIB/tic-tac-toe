import { useState } from 'react';
import { motion } from 'framer-motion';
import { FullScreenHandle } from 'react-full-screen';
import IconButton from '@components/shared/icon-button';
import Modal from '@components/modal';
import useModal from '@lib/hooks/useModal';
import { useRouter } from '@lib/hooks/useRouter';

interface Props {
  fullScreenToggle: () => void;
  fullScreenHandle: FullScreenHandle;
}

export const showMenu = {
  enter: {
    opacity: 1,
    y: 0,
    display: 'block',
  },
  exit: {
    y: -5,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
    transitionEnd: {
      display: 'none',
    },
  },
};

const Settings = ({ fullScreenHandle, fullScreenToggle }: Props) => {
  const { navigate } = useRouter();
  const { isModalOpen, setIsModalOpen } = useModal();
  const [shown, setShown] = useState(false);
  const [sound, setSound] = useState(false);

  const handleLeaveGame = () => {
    navigate('/');
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div className="flex justify-start flex-col items-end h-full z-[999]">
        <IconButton onClick={() => setShown(!shown)}>
          <i className="bx bx-cog"></i>
        </IconButton>
        <motion.ul
          variants={showMenu}
          initial="exit"
          animate={shown ? 'enter' : 'exit'}
          className="absolute rounded-sm top-24"
        >
          <div className="flex flex-col gap-3">
            <IconButton onClick={fullScreenToggle}>
              <i className={fullScreenHandle.active ? 'bx bx-exit-fullscreen' : 'bx bx-fullscreen'}></i>
            </IconButton>
            <IconButton onClick={() => setSound(!sound)}>
              <i className={sound ? 'bx bx-volume-mute' : 'bx bx-volume-full'}></i>
            </IconButton>
            <IconButton onClick={() => setIsModalOpen(true)}>
              <i className="bx bx-log-out -ml-2"></i>
            </IconButton>
          </div>
        </motion.ul>
      </motion.div>
      <Modal
        hasFooter={true}
        hasCancelButton={true}
        styles={{ content: { height: 'auto', width: 'auto' } }}
        isOpen={isModalOpen}
        title={'Leave Game'}
        cancel={() => setIsModalOpen(false)}
        confirm={() => handleLeaveGame}
        confirmText="Leave"
      >
        <div className="text-2xl m-12 whitespace-nowrap">
          <span>Are you sure you want to quit game?</span>
        </div>
      </Modal>
    </>
  );
};

export default Settings;
