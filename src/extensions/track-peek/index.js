import { createRoot } from 'react-dom/client';
import App from './app.js';
import './index.css';

const fragment = document.createDocumentFragment();
const root = createRoot(fragment);
root.render(<App />);
