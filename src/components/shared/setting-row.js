import { classnames } from '@/lib/spicetify.js';
import './setting-row.css';

const SettingRow = ({
  label,
  description,
  children,
  className,
  style,
  ...props
}) => {
  return (
    <div
      className={classnames('gc-setting-row', className)}
      style={style}
      {...props}
    >
      <div className="gc-setting-row__info">
        <div className="gc-setting-row__label">{label}</div>
        {description && (
          <div className="gc-setting-row__description">
            {description}
          </div>
        )}
      </div>
      <div className="gc-setting-row__controls">{children}</div>
    </div>
  );
};

export default SettingRow;
