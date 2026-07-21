import { useMemo } from 'react';
import { classnames, Player, SVGIcons } from '@/lib/spicetify.js';
import { getAdjacentTracks } from '@/utils/track.js';

export const useAdjacentTracksPeekStandalone = ({
  initialConfig = {},
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
      className: classnames(
        'adjacent-tracks-peek-standalone__item',
        className
      ),
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

  const injectDynamicData = () => {
    const { prevTrack, nextTrack } = getAdjacentTracks(
      queue,
      ({ contextTrack: { metadata } }) => metadata.title
    );

    return [
      {
        ...staticConfig.basics.prev,
        text: prevTrack,
        ...staticConfig.controls.prev,
        disabled: !canSkipPrevious,
      },
      {
        ...staticConfig.basics.next,
        text: nextTrack,
        ...staticConfig.controls.next,
        disabled: !canSkipNext,
      },
    ];
  };

  return injectDynamicData();
};
