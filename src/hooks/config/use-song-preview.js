import { useMemo } from '../../lib/react.js';
import { classnames, Player, SVGIcons } from '../../lib/spicetify.js';
import { getAdjacentTracks } from '../../utils/track.js';

export const useSongPreviewConfig = ({
  initialConfig = {},
  isControllable = true,
  queue = {},
  restrictions: { canSkipPrevious = true, canSkipNext = true } = {},
}) => {
  const staticConfig = useMemo(() => {
    const {
      commonConfig: { className, ...restCommonConfig } = {},
      svgCommonConfig: { svgProps, ...restSvgCommonConfig } = {},
      svgConfig = { prev: {}, next: {} },
    } = initialConfig;

    const combinedCommonConfig = {
      className: classnames('song-preview-item', className),
      ...restCommonConfig,
    };

    const combinedSVGCommonConfig = {
      svgProps: { width: 10, height: 10, ...svgProps },
      ...restSvgCommonConfig,
    };

    const combinedBasicsConfig = {
      prev: { ...combinedCommonConfig, key: 'prev-track' },
      next: { ...combinedCommonConfig, key: 'next-track' },
    };

    const combinedControlsConfig = {
      prev: {
        ...combinedSVGCommonConfig,
        icon: SVGIcons['chevron-left'],
        ...svgConfig.prev,
        onClick: Player.back,
      },
      next: {
        ...combinedSVGCommonConfig,
        icon: SVGIcons['chevron-right'],
        svgPriority: false,
        ...svgConfig.next,
        onClick: Player.next,
      },
    };

    return {
      basics: combinedBasicsConfig,
      controls: combinedControlsConfig,
    };
  }, [initialConfig]);

  const createControlConfig = (controlConfig, isEnable) =>
    isControllable ? { ...controlConfig, disabled: !isEnable } : {};

  const injectDynamicData = () => {
    const { prevTrack, nextTrack } = getAdjacentTracks(
      queue,
      ({ contextTrack: { metadata } }) => metadata.title
    );

    return [
      {
        ...staticConfig.basics.prev,
        text: prevTrack,
        ...createControlConfig(
          staticConfig.controls.prev,
          canSkipPrevious
        ),
      },
      {
        ...staticConfig.basics.next,
        text: nextTrack,
        ...createControlConfig(staticConfig.controls.next, canSkipNext),
      },
    ];
  };

  return injectDynamicData();
};
