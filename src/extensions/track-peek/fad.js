import { useEffect } from 'react';
import { useFADStatus } from '@/hooks/integrations/use-fad-status.js';
import './fad.css';

const FAD = ({ playerControls }) => {
  const status = useFADStatus();

  useEffect(() => {
    if (!(status && playerControls)) return;
    playerControls.setAttribute('popover', 'manual');
    playerControls.showPopover();
    return () => playerControls.removeAttribute('popover');
  }, [status, playerControls]);

  return null;
};

export default FAD;
