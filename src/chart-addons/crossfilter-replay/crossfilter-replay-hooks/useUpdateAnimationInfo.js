// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from "react"

import { useDashboardDcRedrawAll } from "hooks"
import { useHasPendingVegaComboRequest } from "hooks/useVegaRequestState"

export const useUpdateAnimationInfo = ({ animationInfo, playing, looping }) => {
  const {
    done: redrawDone,
    error: redrawError,
    pending: redrawPending
  } = useDashboardDcRedrawAll()

  const vegaComboPending = useHasPendingVegaComboRequest()

  return useEffect(() => {
    animationInfo.current = {
      ...animationInfo.current,
      redrawDone: redrawDone && !vegaComboPending,
      redrawError,
      redrawPending: redrawPending || vegaComboPending,
      playing,
      looping
    }
  }, [
    animationInfo,
    redrawDone,
    redrawError,
    redrawPending,
    playing,
    looping,
    vegaComboPending
  ])
}
