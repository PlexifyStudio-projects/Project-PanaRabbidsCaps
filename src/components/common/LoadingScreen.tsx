import { motion } from 'framer-motion';
import Spinner from '../ui/Spinner';
import './LoadingScreen.scss';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message }: LoadingScreenProps) => {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <motion.div
        className="loading-screen__content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.h1
          className="loading-screen__logo"
          initial={{ opacity: 0, letterSpacing: '0.3em' }}
          animate={{ opacity: 1, letterSpacing: '0.15em' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          PANA RABBIDS
        </motion.h1>

        <div className="loading-screen__spinner">
          <Spinner size="lg" />
        </div>

        {message && <p className="loading-screen__message">{message}</p>}
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
