import { Toggle } from '@/lib/host-components.js';
import { DEFAULT_SETTINGS, SETTINGS_NAME } from './constants.js';
import Modal from '@/components/shared/modal.js';
import SettingRow from '@/components/shared/setting-row.js';

const Settings = ({
  visible = false,
  audioPreviewEnabled = DEFAULT_SETTINGS.audioPreviewEnabled,
  adjacentTracksEnabled = DEFAULT_SETTINGS.adjacentTracksEnabled,
  onAudioPreviewEnabledChange = () => {},
  onAdjacentTracksEnabledChange = () => {},
  onClose = () => {},
}) => (
  <Modal title={SETTINGS_NAME} visible={visible} onClose={onClose}>
    <SettingRow
      label="Adjacent tracks"
      description="Show previous and next tracks on the corresponding skip buttons."
    >
      <Toggle
        value={adjacentTracksEnabled}
        onSelected={onAdjacentTracksEnabledChange}
      />
    </SettingRow>
    <SettingRow
      label="Audio preview"
      description="Add a Preview audio option to track context menus."
    >
      <Toggle
        value={audioPreviewEnabled}
        onSelected={onAudioPreviewEnabledChange}
      />
    </SettingRow>
  </Modal>
);

export default Settings;
