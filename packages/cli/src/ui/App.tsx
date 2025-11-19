/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useIsScreenReaderEnabled } from 'ink';
import { useStableTerminalSize } from './hooks/useStableSize.js';
import { lerp } from '../utils/math.js';
import { useUIState } from './contexts/UIStateContext.js';
import { StreamingContext } from './contexts/StreamingContext.js';
import { QuittingDisplay } from './components/QuittingDisplay.js';
import { ScreenReaderAppLayout } from './layouts/ScreenReaderAppLayout.js';
import { DefaultAppLayout } from './layouts/DefaultAppLayout.js';
import { useMemo } from 'react';

const getContainerWidth = (terminalWidth: number): string => {
  if (terminalWidth <= 80) {
    return '98%';
  }
  if (terminalWidth >= 132) {
    return '90%';
  }

  // Linearly interpolate between 80 columns (98%) and 132 columns (90%).
  const t = (terminalWidth - 80) / (132 - 80);
  const percentage = lerp(98, 90, t);

  return `${Math.round(percentage)}%`;
};

export const App = () => {
  const uiState = useUIState();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const { columns } = useStableTerminalSize();

  const containerWidth = useMemo(() => getContainerWidth(columns), [columns]);

  // Không gọi useMemo sau return nữa -> sửa bằng cách tạo layout trước
  const layout = useMemo(() => {
    if (isScreenReaderEnabled) {
      return <ScreenReaderAppLayout />;
    }
    return <DefaultAppLayout width={containerWidth} />;
  }, [isScreenReaderEnabled, containerWidth]);

  // Early return *sau* hooks
  if (uiState.quittingMessages) {
    return <QuittingDisplay />;
  }

  return (
    <StreamingContext.Provider value={uiState.streamingState}>
      {layout}
    </StreamingContext.Provider>
  );
};
