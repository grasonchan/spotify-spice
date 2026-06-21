export const SETTINGS_NAME = 'Vinyl settings';
export const CONFIG_KEY = 'vinyl:settings';

export const RPM_PRECISION = 1;

export const RPM_RANGE = {
  MIN: 2,
  MAX: 78,
};

export const RPM_PRESET_MAP = {
  AMBIENT: 5,
  LP: 33.3,
  EP: 45,
  SP: 78,
};

export const DEFAULT_SETTINGS = {
  rotationEnabled: true,
  rpm: 5,
};

export const RPM_PRESET_LIST = [
  {
    label: 'Ambient',
    tooltip: 'Ambient Mode',
    value: RPM_PRESET_MAP.AMBIENT,
  },
  { label: 'LP', tooltip: 'Long Play', value: RPM_PRESET_MAP.LP },
  { label: 'EP', tooltip: 'Extended Play', value: RPM_PRESET_MAP.EP },
  { label: 'SP', tooltip: 'Standard Play', value: RPM_PRESET_MAP.SP },
];
