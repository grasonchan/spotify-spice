import { createPortal } from 'react-dom';
import { useFADStatus } from '@/hooks/host/use-fad-status.js';
import SongPreview from './song-preview.js';
import './fad.css';

const FAD = () => {
  const status = useFADStatus();

  if (!status) return null;
  return createPortal(
    <SongPreview containerClassName="fad-song-preview" />,
    document.querySelector('#full-app-display')
  );
};

export default FAD;
