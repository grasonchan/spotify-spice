import { classnames } from '@/lib/spicetify.js';
import { TooltipWrapper } from '@/lib/host-components.js';
import './svg-button.css';

const SVGButton = ({
  text,
  icon,
  svgPriority = true,
  svgProps = {},
  plain = false,
  className,
  style = {},
  disabled = false,
  onClick,
  tooltipProps = {},
}) => (
  <TooltipWrapper
    {...tooltipProps}
    disabled={disabled || !tooltipProps.label || tooltipProps.disabled}
  >
    <button
      className={classnames({ 'common-svg-button': !plain }, className)}
      style={style}
      disabled={disabled}
      onClick={onClick}
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="currentColor"
        {...svgProps}
        dangerouslySetInnerHTML={{
          __html: icon,
        }}
      />
      {text && (
        <span
          style={{
            order: svgPriority ? 0 : -1,
          }}
        >
          {text}
        </span>
      )}
    </button>
  </TooltipWrapper>
);

export default SVGButton;
