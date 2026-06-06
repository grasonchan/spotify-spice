import { createRoot } from 'react-dom/client';
import TrackPeek from '@/components/host-aware/track-peek.js';

const fragment = document.createDocumentFragment();
const root = createRoot(fragment);
root.render(
  <TrackPeek
    containerSelector=".Root__now-playing-bar"
    prevSelector="[data-testid='control-button-skip-back']"
    nextSelector="[data-testid='control-button-skip-forward']"
  />
);
