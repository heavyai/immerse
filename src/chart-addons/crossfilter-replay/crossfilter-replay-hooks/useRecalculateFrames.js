// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from "react"

export const useRecalculateFrames = ({
  setFrames,
  recalculatedFrames,
  needsToSetFrames
}) =>
  useEffect(() => {
    if (needsToSetFrames) {
      setFrames(recalculatedFrames)
    }
  }, [setFrames, recalculatedFrames, needsToSetFrames])
