import { createRoot } from 'react-dom/client';
import App from './app.js';

const fragment = document.createDocumentFragment();
const root = createRoot(fragment);
root.render(<App />);
