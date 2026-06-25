import { useState } from 'react';
import { classnames } from '@/lib/spicetify.js';
import { Slider, Toggle } from '@/lib/host-components.js';
import {
  RPM_PRESET_LIST,
  RPM_PRECISION,
  SETTINGS_NAME,
  RPM_RANGE,
  DEFAULT_SETTINGS,
} from './constants.js';
import Modal from '@/components/shared/modal.js';
import SettingRow from '@/components/shared/setting-row.js';
import './settings.css';

const Settings = ({
  title = SETTINGS_NAME,
  visible = false,
  rotationEnabled = DEFAULT_SETTINGS.rotationEnabled,
  rpm = DEFAULT_SETTINGS.rpm,
  coloredEnabled = DEFAULT_SETTINGS.coloredEnabled,
  rpmPrecision = RPM_PRECISION,
  minRPM = RPM_RANGE.MIN,
  maxRPM = RPM_RANGE.MAX,
  presetRPMs = RPM_PRESET_LIST,
  onRotateEnabledChange = () => {},
  onRPMChange = () => {},
  onColoredEnabledChange = () => {},
  onClose = () => {},
}) => {
  const [localRPM, setLocalRPM] = useState(rpm);

  const transform2RPM = (value) => {
    const rpmMultiplier = Math.pow(10, rpmPrecision);
    return (
      Math.round(value * (maxRPM - minRPM) * rpmMultiplier) /
        rpmMultiplier +
      minRPM
    );
  };

  return (
    <Modal title={title} visible={visible} onClose={onClose}>
      <SettingRow
        label="Rotation"
        description="Enable smooth rotation effect."
      >
        <Toggle
          value={rotationEnabled}
          onSelected={onRotateEnabledChange}
        />
      </SettingRow>
      {rotationEnabled && (
        <SettingRow
          label="Rotation speed"
          className="vinyl-speed-setting"
        >
          <div className="vinyl-speed-setting__slider">
            <span className="vinyl-speed-setting__rpm">
              {`${localRPM.toFixed(rpmPrecision)} RPM`}
            </span>
            <Slider
              value={localRPM - minRPM}
              max={maxRPM - minRPM}
              onDragMove={(value) => setLocalRPM(transform2RPM(value))}
              onDragEnd={(value) => {
                const rpm = transform2RPM(value);
                setLocalRPM(rpm);
                onRPMChange(rpm);
              }}
            />
          </div>
          {presetRPMs && (
            <div className="vinyl-speed-setting__presets">
              {presetRPMs.map((preset) => (
                <button
                  key={preset.value}
                  title={preset.tooltip}
                  className={classnames('vinyl-speed-setting__preset', {
                    checked: localRPM === preset.value,
                  })}
                  onClick={() => {
                    setLocalRPM(preset.value);
                    onRPMChange(preset.value);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </SettingRow>
      )}
      <SettingRow
        label="Colored"
        description="Enable colored vinyl effect in the Now Playing View (local files are not supported)."
      >
        <Toggle
          value={coloredEnabled}
          onSelected={onColoredEnabledChange}
        />
      </SettingRow>
    </Modal>
  );
};

export default Settings;
