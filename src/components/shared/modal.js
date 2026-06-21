import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { classnames, SVGIcons } from '@/lib/spicetify.js';
import SVGButton from './svg-button.js';
import './modal.css';

const Modal = ({
  title,
  children,
  size = 'medium',
  className,
  style,
  visible,
  onClose,
  ...props
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!(modal && visible)) return;
    modal.showModal();
    return () => modal.close();
  }, [visible]);

  return (
    visible &&
    createPortal(
      <dialog
        className={classnames(
          'gc-modal',
          `gc-modal--${size}`,
          className
        )}
        style={style}
        closedby="any"
        ref={modalRef}
        onCancel={onClose}
        {...props}
      >
        <div className="gc-modal__content">
          <SVGButton
            icon={SVGIcons.x}
            className="gc-modal__close-btn"
            onClick={onClose}
          />
          {title && <h2 className="gc-modal__title">{title}</h2>}
          <div className="gc-modal__body">{children}</div>
        </div>
      </dialog>,
      document.body
    )
  );
};

export default Modal;
