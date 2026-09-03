// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Theme constants
 */
export const DARK_THEME = "dark" as const
export const LIGHT_THEME = "light" as const
export const LIGHT2_THEME = "light2" as const
export const CUSTOM_THEME = "custom" as const
export const HOTDOG_THEME = "hotdog" as const

/**
 * Type definition for Immerse UI theme values - derived from the const values above
 */
export type ImmerseUITheme =
  | typeof DARK_THEME
  | typeof LIGHT_THEME
  | typeof LIGHT2_THEME
  | typeof CUSTOM_THEME
  | typeof HOTDOG_THEME
