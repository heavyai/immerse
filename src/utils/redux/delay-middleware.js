// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const DELAY_ACTION_TYPE = "@@DELAY_ACTION"

export function delay(delayed, timeout) {
  return {
    type: DELAY_ACTION_TYPE,
    delayed,
    timeout
  }
}

export function applyDelay() {
  return () => (next) => (action) => {
    if (action.type === DELAY_ACTION_TYPE) {
      return window.setTimeout(action.delayed, action.timeout)
    } else {
      return next(action)
    }
  }
}
