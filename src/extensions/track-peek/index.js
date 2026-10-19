import { createRoot } from 'react-dom/client';
import App from './app.js';
import './index.css';
import './adjacent-tracks-peek-npb.css';

const fragment = document.createDocumentFragment();
const root = createRoot(fragment);
root.render(<App />);
