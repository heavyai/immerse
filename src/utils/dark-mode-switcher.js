// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  There's a fair bit of new logic here.

  The "theme" can be set in 3 different places -
    in a servers(.local)?.json file.
    in localStorage in ui_theme_default (which reflects the current value of servers.json)
    in localStorage in ui_theme (which refleces the user's preference.)

  ui_theme always wins.
  ui_theme_default wins as the STARTUP default (but could be changed by servers.json later during load)
  servers.json sets the default, which may cause a theme blink on first load after change.

  To determine the current theme, look to the user preferences first, default second. default will always
  be set by the connection reducer.
*/

import {
  getFeatureFlag,
  setFeatureFlag,
  removeFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const {
  UI_THEME,
  UI_DEFAULT_THEME,
  ENABLE_CUSTOM_THEME
} = available_feature_flags
import { importableStore as store } from "store/importableStore"
import { DARK_THEME, LIGHT_THEME, CUSTOM_THEME } from "./theme/types"

export function getThemes() {
  const customThemeEnabled =
    store.getState().userConfigurableUI?.customThemeEnabled ||
    getFeatureFlag(ENABLE_CUSTOM_THEME)

  let themes = [DARK_THEME, LIGHT_THEME]
  if (customThemeEnabled) {
    themes = themes.concat([CUSTOM_THEME])
  }
  return themes
}

export function getAllThemes() {
  return [DARK_THEME, LIGHT_THEME, CUSTOM_THEME]
}

export function setUIThemeDefault(newTheme) {
  if (newTheme === null || !getThemes().includes(newTheme)) {
    removeFeatureFlag(UI_DEFAULT_THEME)
  } else {
    setFeatureFlag(UI_DEFAULT_THEME, newTheme)
  }
}

// Any calls to this also needs to set the theme in the store
export function setCurrentTheme(newTheme) {
  if (getThemes().includes(newTheme)) {
    setFeatureFlag(UI_THEME, newTheme)
  }

  return newTheme
}

export async function setCurrentThemeAsync(newTheme, includeCustom) {
  if (includeCustom || getThemes().includes(newTheme)) {
    await setFeatureFlag(UI_THEME, newTheme)
  }
}

export function currentTheme() {
  return getFeatureFlag(UI_THEME) || getFeatureFlag(UI_DEFAULT_THEME)
}

window.currentTheme = currentTheme
window.setCurrentTheme = setCurrentTheme
