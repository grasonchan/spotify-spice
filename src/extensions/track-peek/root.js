import { createRoot } from 'react-dom/client';
import SongPreviewAttacher from '@/components/host-aware/song-preview-attacher.js';

const fragment = document.createDocumentFragment();
const root = createRoot(fragment);
root.render(
  <SongPreviewAttacher
    containerSelector=".Root__now-playing-bar"
    prevSelector="[data-testid='control-button-skip-back']"
    nextSelector="[data-testid='control-button-skip-forward']"
  />
);
