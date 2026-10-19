import { useEffect } from 'react';
import { useFADStatus } from '@/hooks/integrations/use-fad-status.js';
import './fad.css';

const FAD = ({ playerControls, enabled }) => {
  const status = useFADStatus();

  useEffect(() => {
    if (!(status && enabled && playerControls)) return;
    playerControls.setAttribute('popover', 'manual');
    playerControls.showPopover();
    return () => playerControls.removeAttribute('popover');
  }, [status, enabled, playerControls]);

  return null;
};

export default FAD;
