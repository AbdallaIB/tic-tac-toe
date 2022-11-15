import './index.css';
import Modal from 'react-modal';
import { ReactNode } from 'react';
import Button from '@components/shared/button';

interface Props {
  title: string;
  isOpen: boolean;
  children?: ReactNode;
  confirmText: string;
  styles: { content: { height: string; width: string } };
  hasFooter: boolean;
  hasCancelButton: boolean;
  cancel: () => void;
  confirm: () => void;
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const Modals = ({
  title,
  isOpen,
  children,
  cancel,
  confirm,
  confirmText,
  styles,
  hasFooter = true,
  hasCancelButton,
}: Props) => {
  return (
    <Modal
      style={{
        content: {
          ...customStyles.content,
          ...styles.content,
          overflow: 'hidden',
          color: 'white',
          fontSize: '1.5rem',
          backgroundColor: '#A42EF2',
        },
      }}
      ariaHideApp={false}
      contentLabel={title}
      isOpen={isOpen}
    >
      <header className="header">
        <h2 className="font-medium"> {title} </h2>
      </header>
      <main className={'flex flex-col items-center justify-center w-full mt-4'} style={{ height: '85%' }}>
        {children}
      </main>
      {hasFooter && (
        <footer className="footer justify-center">
          {hasCancelButton && <Button onClick={cancel}>Cancel</Button>}
          <Button onClick={confirm}>{confirmText}</Button>
        </footer>
      )}
    </Modal>
  );
};

export default Modals;
