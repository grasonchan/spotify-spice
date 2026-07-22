import { useFADStatus } from '@/hooks/host/use-fad-status.js';
import View from './view.js';
import '../../styles/integrations/fad.css';
import './index.css';

const FAD = () => {
  const status = useFADStatus();

  if (!status) return null;
  return <View />;
};

export default FAD;
