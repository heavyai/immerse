// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from "react"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { PIN_GLOBAL_SIDE_NAV_CACHE_KEY } from "components/global-side-nav/GlobalSideNav"
import { retrieveFromLocalStorage } from "utils/local-storage"

export const useScrollRecalculate = (recalculate, scrollingElements) => {
  useEffect(() => {
    if (scrollingElements) {
      scrollingElements.forEach((el) => {
        if (el) {
          el.addEventListener("scroll", recalculate)
        }
      })
    }

    return () => {
      if (scrollingElements) {
        scrollingElements.forEach((el: HTMLElement) => {
          if (el) {
            el.removeEventListener("scroll", recalculate)
          }
        })
      }
    }
  }, [recalculate, scrollingElements])
}

export const getGlobalSideNavOffset = () => {
  const { GLOBAL_SIDE_NAV } = available_feature_flags
  const sidebarEnabled = getFeatureFlag(GLOBAL_SIDE_NAV)
  const sidebarPinned = retrieveFromLocalStorage(
    PIN_GLOBAL_SIDE_NAV_CACHE_KEY,
    {
      defaultValue: true,
      asJSON: true
    }
  )
  return !sidebarEnabled || !sidebarPinned ? 0 : 54
}
