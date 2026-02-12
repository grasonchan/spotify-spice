import { createElement } from '../../lib/react.js';
import { classnames } from '../../lib/spicetify.js';
import './svg-button.css';

const SVGButton = ({
  text,
  icon,
  svgPriority = true,
  svgProps = {},
  className,
  style = {},
  disabled = false,
  onClick,
}) => {
  return createElement(
    'button',
    {
      className: classnames('common-svg-button', className),
      style,
      disabled,
      onClick,
    },
    createElement('svg', {
      width: 16,
      height: 16,
      viewBox: '0 0 16 16',
      fill: 'currentColor',
      ...svgProps,
      dangerouslySetInnerHTML: {
        __html: icon,
      },
    }),
    text &&
      createElement(
        'span',
        {
          style: {
            order: svgPriority ? 0 : -1,
          },
        },
        text
      )
  );
};

export default SVGButton;
