import { classnames } from '@/lib/spicetify.js';
import './circle.css';

const Progress = ({
  size = 32,
  strokeWidth = 2,
  trackColor = 'rgb(var(--spice-rgb-button), 32%)',
  color = 'var(--spice-button)',
  progress = 0,
  className,
  style,
  children,
  ...restProps
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const offset =
    circumference - (clampedProgress / 100) * circumference;

  const circleCommonProps = {
    cx: center,
    cy: center,
    r: radius,
    fill: 'none',
    strokeWidth,
  };

  return (
    <div
      className={classnames('progress-circle', className)}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      {...restProps}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="progress-circle-svg"
        shapeRendering="geometricPrecision"
      >
        <circle {...circleCommonProps} stroke={trackColor} />
        <circle
          className="progress-circle-bar"
          {...circleCommonProps}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {children}
    </div>
  );
};

export default Progress;
