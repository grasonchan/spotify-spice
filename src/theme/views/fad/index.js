import { useFADStatus } from '@/hooks/integrations/use-fad-status.js';
import View from './view.js';
import '../../styles/integrations/fad.css';
import './index.css';

const FAD = () => {
  const status = useFADStatus();

  if (!status) return null;
  return <View />;
};

export default FAD;
