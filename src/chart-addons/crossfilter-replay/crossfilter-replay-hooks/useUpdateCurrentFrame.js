// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from "react"

export const useUpdateCurrentFrame = ({
  setCurrentFrame,
  internalSetCrossFilter,
  duration,
  frames,
  internalCrossFilter
}) =>
  useCallback(
    (e) => {
      const newFrame = e.target.value
      if (newFrame >= 1 && newFrame <= frames) {
        setCurrentFrame(newFrame)
        internalSetCrossFilter({
          filter: internalCrossFilter,
          frame: newFrame,
          frames,
          duration
        })
      }
    },
    [
      setCurrentFrame,
      internalSetCrossFilter,
      duration,
      frames,
      internalCrossFilter
    ]
  )
