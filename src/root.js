import { createRoot } from './lib/react-dom.js';
import App from './app.js';

const fragment = document.createDocumentFragment();
const root = createRoot(fragment);
root.render(<App />);
