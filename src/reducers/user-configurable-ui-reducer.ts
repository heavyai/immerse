// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"

import {
  SET_PREVIEW_STYLES,
  SAVE_DATABASE_STYLES_REQUEST,
  SAVE_DATABASE_STYLES_SUCCESS,
  SAVE_DATABASE_STYLES_ERROR,
  SET_DATABASE_STYLES,
  SET_SERVERS_JSON_COLORS,
  RESET_TO_THEME_DEFAULTS,
  RESET_PREVIEW_STYLES,
  SET_THEME_TINT,
  SET_SAVED_THEME_TINT,
  SET_UI_THEME,
  SET_SAVED_UI_THEME,
  SET_CUSTOM_THEME_ENABLED
} from "actions/user-configurable-ui-action-creators"

import { DEFAULT_DATABASE_STYLES } from "components/ui-config-panel/constants"

import { OmniColorSchemes } from "services/colors"
import { AppState } from "vega/charts/types"
import { UserConfig, PreviewStyles } from "components/ui-config-panel/types"
import { isEqual } from "lodash"
import { createSelectorCreator, defaultMemoize } from "reselect"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { DARK_THEME, ImmerseUITheme } from "utils/theme/types"
import { currentTheme } from "utils/dark-mode-switcher"

const { DASHBOARD_GRID_MARGIN } = available_feature_flags

/**
 * This portion of the state exists to store user-configurable settings in
 * Redux. These settings are not saved along with the dashboard, but are
 * persisted elsewhere and then reflected here.
 *
 * We currently have two sources that populate this data:
 * - servers.json whitelabeling (custom color palettes, themes, text, etc)
 * - Per-database settings that are saved on the webserver and set via the
 *   Config UI panel
 *
 * One of the goals of this reducer is to move away from services like
 * `services/colors.ts`, and to start keeping this information in the store so we
 * can access the information through the typical react props handoff. More
 * information about colors architecture is located in the Front End wiki.
 *
 * Another goal is to have a safe place to keep configurable UI data that won't
 * get cleared like `store.ui` does
 *
 */

const initialState = {
  saving: false,
  saveError: false,
  // Colors coming from servers.json
  serversJSONColors: {} as OmniColorSchemes,
  // UI Config Panel: styles saved to database
  savedDatabaseStyles: {} as UserConfig,
  // UI Config Panel: live styles for preview
  previewStyles: {} as PreviewStyles,
  // Theme tint color
  themeTint: { hsl: { h: 240, s: 0.32, l: 0.15 }, hex: "#1B1B34" },
  // Theme tint color saved in config instance
  savedThemeTint: { hsl: { h: 240, s: 0.32, l: 0.15 }, hex: "#1B1B34" },
  // UI theme
  uiTheme: currentTheme(),
  // UI theme saved in config instance
  savedUITheme: currentTheme(),
  // Show custom theme option
  customThemeEnabled: false
}

type PersistedState = typeof initialState

const reducers = {
  [SET_SERVERS_JSON_COLORS]: (
    state: PersistedState,
    { colors }: { colors: OmniColorSchemes }
  ) => ({
    ...state,
    serversJSONColors: colors
  }),
  [SET_PREVIEW_STYLES]: (
    state: PersistedState,
    { previewStyles }: { previewStyles: PreviewStyles }
  ) => ({
    ...state,
    previewStyles: {
      ...state.previewStyles,
      ...previewStyles
    }
  }),
  [RESET_PREVIEW_STYLES]: (state: PersistedState) => ({
    ...state,
    previewStyles: {}
  }),
  [SAVE_DATABASE_STYLES_REQUEST]: (state: PersistedState) => ({
    ...state,
    saving: true,
    saveError: false
  }),
  [SAVE_DATABASE_STYLES_SUCCESS]: (
    state: PersistedState,
    { styles }: { styles: UserConfig }
  ) => ({
    ...state,
    savedDatabaseStyles: styles,
    previewStyles: {},
    saving: false,
    saveError: false
  }),
  [SAVE_DATABASE_STYLES_ERROR]: (
    state: PersistedState,
    { error }: { error: string }
  ) => ({
    ...state,
    saving: false,
    saveError: error
  }),
  [SET_DATABASE_STYLES]: (
    state: PersistedState,
    { styles }: { styles: UserConfig }
  ) => ({
    ...state,
    savedDatabaseStyles: styles
  }),
  [RESET_TO_THEME_DEFAULTS]: (state: PersistedState) => ({
    ...state,
    savedDatabaseStyles: {},
    previewStyles: {}
  }),
  [SET_THEME_TINT]: (state: PersistedState, { color }: { color: any }) => ({
    ...state,
    themeTint: color
  }),
  [SET_SAVED_THEME_TINT]: (
    state: PersistedState,
    { color }: { color: any }
  ) => ({
    ...state,
    savedThemeTint: color
  }),
  [SET_UI_THEME]: (
    state: PersistedState,
    { theme }: { theme: ImmerseUITheme }
  ) => ({
    ...state,
    uiTheme: theme
  }),
  [SET_SAVED_UI_THEME]: (
    state: PersistedState,
    { theme }: { theme: ImmerseUITheme }
  ) => ({
    ...state,
    savedUITheme: theme
  }),
  [SET_CUSTOM_THEME_ENABLED]: (
    state: PersistedState,
    { enabled }: { enabled: boolean }
  ) => ({
    ...state,
    customThemeEnabled: enabled
  })
}

// Combines all persisted color palettes and the current preview palettes to
// create the palettes that should appear in charts. All color palettes take the
// same shape as the servers.json scheme. Heirarchy looks like:
//  1. We start with the defaults as outlined in (DEFAULT_DATABASE_STYLES)
//  2. Then we override any styles with styles set in servers.json
//  3. Then we override the styles from servers.json with any styles that are
//    currently saved in the database
//  4. Then we override the styles from the database with any styles the user is
//    currently previewing
const getFinalColorPalettes = (
  userConfigurableUI: AppState["userConfigurableUI"],
  dashboardStyles: UserConfig
) => ({
  ...DEFAULT_DATABASE_STYLES.colorPalettes,
  ...(userConfigurableUI?.serversJSONColors || {}),
  ...(userConfigurableUI?.savedDatabaseStyles?.colorPalettes || {}),
  ...(dashboardStyles?.colorPalettes || {}),
  ...(userConfigurableUI?.previewStyles?.colorPalettes || {})
})

// Same as color palettes, minus servers.json (we don't store text settings there)
const getFinalTextSettings = (
  userConfigurableUI: AppState["userConfigurableUI"],
  dashboardStyles: UserConfig
) => ({
  ...DEFAULT_DATABASE_STYLES.text,
  ...(userConfigurableUI?.savedDatabaseStyles?.text || {}),
  ...(dashboardStyles?.text || {}),
  ...(userConfigurableUI?.previewStyles?.text || {})
})

const getFinalLabelSettings = (
  userConfigurableUI: AppState["userConfigurableUI"],
  dashboardStyles: UserConfig
) => ({
  ...DEFAULT_DATABASE_STYLES.label,
  ...(userConfigurableUI?.savedDatabaseStyles?.label || {}),
  ...(dashboardStyles?.label || {}),
  ...(userConfigurableUI?.previewStyles?.label || {})
})

// The current high contrast color settings will be the following:
// 1. If a preview highContrastColorSettings is set, use that value
// 2. If not, use the saved value
// 3. If there is no saved value, use the default value
const getFinalHighContrastColorSettings = (
  userConfigurableUI: AppState["userConfigurableUI"],
  dashboardStyles: UserConfig
): boolean => {
  const { savedDatabaseStyles, previewStyles } = userConfigurableUI

  if (typeof previewStyles?.highContrastFontColors !== "undefined") {
    return previewStyles?.highContrastFontColors
  }

  if (typeof dashboardStyles?.highContrastFontColors !== "undefined") {
    return dashboardStyles?.highContrastFontColors
  }

  if (typeof savedDatabaseStyles?.highContrastFontColors !== "undefined") {
    return savedDatabaseStyles?.highContrastFontColors
  }

  return DEFAULT_DATABASE_STYLES?.highContrastFontColors
}

// Combines all UserConfig.chart settings. Slightly different than text or label
// settings in that it also incorporates the current feature flag value for
// dashboard grid margin. The user can specify this in the control panel. This
// value takes precedence over the default value (24), but is superceded by
// database-level UI config, dashboard-level UI config, and preview styles.
const getFinalChartSettings = (
  userConfigurableUI: AppState["userConfigurableUI"],
  dashboardStyles: UserConfig
) => {
  const featureFlagGridMarginValue = getFeatureFlag(DASHBOARD_GRID_MARGIN)
  return {
    ...DEFAULT_DATABASE_STYLES.chart,
    ...{ dashboardGridMargin: featureFlagGridMarginValue },
    ...(userConfigurableUI?.savedDatabaseStyles?.chart || {}),
    ...(dashboardStyles?.chart || {}),
    ...(userConfigurableUI?.previewStyles?.chart || {})
  }
}

// The point of this function is to combine all the ways the user can configure their UI:
//
// - through servers.json whitelabeling
// - through saved styles to the database
// - through saved styles to the current dashboard
// - through active previewing of new styles using the ui-config-panel
//
//   And spit out one final object that's a combination of all of these. The
//   goal is to have a default, that is superceded by servers.json settings,
//   which is superceded by database settings, which is finally superceded by
//   preview settings.
//
const computeUserConfigurableUISettings = (
  userConfigurableUI: AppState["userConfigurableUI"],
  dashboardStyles: UserConfig
): UserConfig => {
  return {
    version: DEFAULT_DATABASE_STYLES.version,
    text: getFinalTextSettings(userConfigurableUI, dashboardStyles),
    label: getFinalLabelSettings(userConfigurableUI, dashboardStyles),
    colorPalettes: getFinalColorPalettes(userConfigurableUI, dashboardStyles),
    highContrastFontColors: getFinalHighContrastColorSettings(
      userConfigurableUI,
      dashboardStyles
    ),
    chart: getFinalChartSettings(userConfigurableUI, dashboardStyles)
  }
}

const uiConfigSelector = (state: AppState) => state.userConfigurableUI
const dashboardUIConfigSelector = (state: AppState) =>
  state.dashboard?.userConfigurableUI

// This just wraps + memoizes `computeUserConfigurableUISettings` so it's not
// regenerating a new object all the time
export const getUserConfigurableUISettings = createSelectorCreator(
  defaultMemoize,
  isEqual
)(
  [uiConfigSelector, dashboardUIConfigSelector],
  (userConfigurableUISettings, dashboardUserConfigurableUISettings) => {
    return computeUserConfigurableUISettings(
      userConfigurableUISettings,
      dashboardUserConfigurableUISettings
    )
  }
)

export default createReducer(reducers, initialState)
