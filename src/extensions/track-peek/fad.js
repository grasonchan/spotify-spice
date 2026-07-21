import { createPortal } from 'react-dom';
import { useFADStatus } from '@/hooks/host/use-fad-status.js';
import AdjacentTracksPeekStandalone from './adjacent-tracks-peek.standalone.js';
import './fad.css';

const FAD = () => {
  const status = useFADStatus();

  if (!status) return null;
  return createPortal(
    <AdjacentTracksPeekStandalone className="fad-adjacent-tracks-peek" />,
    document.querySelector('#full-app-display')
  );
};

export default FAD;
