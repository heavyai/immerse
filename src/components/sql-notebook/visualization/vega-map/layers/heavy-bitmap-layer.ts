// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { BitmapLayer } from "deck.gl"

// Not sure why this works, but i'm not going to question it
export class HeavyBitmapLayer<D, _> extends BitmapLayer<D> {
  shouldUpdateState({ changeFlags }) {
    // Omits propsChanged changeFlag, which is causing the flicker
    const {
      viewportChanged,
      dataChanged,
      stateChanged,
      updateTriggersChanged
    } = changeFlags
    return [
      viewportChanged,
      stateChanged,
      updateTriggersChanged,
      dataChanged
    ].some(Boolean)
  }
}
