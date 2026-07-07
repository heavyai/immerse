// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SET_IMMERSE_UI_KEY,
  SET_IMMERSE_UI_KEYS,
  ENABLE_ALL_IMMERSE_UI_KEYS,
  DISABLE_ALL_IMMERSE_UI_KEYS
} from "./constants"

export const setImmerseUIKey = (key, value) => ({
  type: SET_IMMERSE_UI_KEY,
  payload: { key, value }
})

export const setImmerseUIKeys = (config) => ({
  type: SET_IMMERSE_UI_KEYS,
  payload: config
})

export const enableAllImmerseUIKeys = () => ({
  type: ENABLE_ALL_IMMERSE_UI_KEYS
})
export const disableAllImmerseUIKeys = () => ({
  type: DISABLE_ALL_IMMERSE_UI_KEYS
})
