import { createElement } from '@/lib/react.js';
import { useFADStatus } from '@/hooks/host/use-fad-status.js';
import FADView from './fad-view.js';
import './fad.css';

const FAD = () => {
  const status = useFADStatus();

  if (!status) return null;
  return createElement(FADView);
};

export default FAD;
