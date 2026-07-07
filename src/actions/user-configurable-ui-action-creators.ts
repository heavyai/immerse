// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-underscore-dangle */
import { OmniColorSchemes, applyColors } from "services/colors"
import { setConfigurationDB, getConfigurationDB } from "services/configuration"
import { Dispatch } from "redux"
import { AppState } from "vega/charts/types"
import {
  SET_DASHBOARD_STYLES,
  RESET_DASHBOARD_STYLES
} from "constants/action-types"
import { setAppError } from "actions/app-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"
import { UserConfig, PreviewStyles } from "components/ui-config-panel/types"
import { setCurrentTheme } from "utils/dark-mode-switcher"

export const SET_SERVERS_JSON_COLORS = "SET_SERVERS_JSON_COLORS"
export const SET_DATABASE_STYLES = "SET_DATABASE_STYLES"
export const SET_PREVIEW_STYLES = "SET_PREVIEW_STYLES"
export const RESET_PREVIEW_STYLES = "RESET_PREVIEW_STYLES"
export const RESET_TO_THEME_DEFAULTS = "RESET_TO_THEME_DEFAULTS"
export const SAVE_DATABASE_STYLES_REQUEST = "SAVE_DATABASE_STYLES_REQUEST"
export const SAVE_DATABASE_STYLES_SUCCESS = "SAVE_DATABASE_STYLES_SUCCESS"
export const SAVE_DATABASE_STYLES_ERROR = "SAVE_DATABASE_STYLES_ERROR"
export const SET_THEME_TINT = "SET_THEME_TINT"
export const SET_SAVED_THEME_TINT = "SET_SAVED_THEME_TINT"
export const RESET_THEME_TINT = "RESET_THEME_TINT"
export const SET_UI_THEME = "SET_UI_THEME"
export const SET_SAVED_UI_THEME = "SET_SAVED_UI_THEME"
export const SET_CUSTOM_THEME_ENABLED = "SET_CUSTOM_THEME_ENABLED"

export const fetchConfigurationDB = async (): Promise<UserConfig | null> => {
  const response = await getConfigurationDB()
  return !response.ok
    ? Promise.reject("Error fetching configuration")
    : ((await response.json()) as UserConfig)
}

const handleSaveDBStyles = async (
  styles: UserConfig | {},
  dispatch: Dispatch
) => {
  const response = await setConfigurationDB(styles)
  if (response.status === 422) {
    // We are firing both this error action and `setAppError` because this one
    // sets error states in the userConfigurableUI state while `setAppError`
    // triggers our standard error modals. Tis the state of the world unless we
    // decide we don't want to use those standard error modals
    dispatch({
      type: SAVE_DATABASE_STYLES_ERROR,
      error: "Configuration persistence unavailable"
    })
    dispatch(
      setAppError(
        SAVE_DATABASE_STYLES_ERROR,
        "Configuration persistence unavailable"
      )
    )
    // eslint-disable-next-line no-console
    console.error("Configuration Persistence Unavailable")
  } else if (!response.ok) {
    // See comment above
    dispatch({
      type: SAVE_DATABASE_STYLES_ERROR,
      error: "Error setting configuration"
    })
    dispatch(
      setAppError(SAVE_DATABASE_STYLES_ERROR, "Error setting configuration")
    )
    // eslint-disable-next-line no-console
    console.error("Error setting configuration")
  } else {
    dispatch({ type: SAVE_DATABASE_STYLES_SUCCESS, styles })
  }
}

// All actions here that update the colors / styles
// need to then call this function, that updates the colors service. This has
// the effect of keeping redux and the colors service in sync. The goal is to
// eventually just have all this data in redux, but for now this is the easiest
// way to get things working without updating all components.
const updateColorsService = (getState: () => AppState) => {
  const state = getState()
  if (state.userConfigurableUI) {
    const updatedColors = getUserConfigurableUISettings(state).colorPalettes
    applyColors(updatedColors)
  }
}

// This is used on load when we get servers.json color palettes and then persist
// them in redux. Updates colors service.
export const setServersJSONColors = (colors: OmniColorSchemes) => (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  dispatch({
    type: SET_SERVERS_JSON_COLORS,
    colors
  })
  updateColorsService(getState)
}

// This is used on load when we fetch the database config and need to persist it
// to Redux
export const setDatabaseStyles = (styles: UserConfig) => (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  dispatch({
    type: SET_DATABASE_STYLES,
    styles
  })
  updateColorsService(getState)
}

// This is used to set preview styles when the user is actively making changes
// in the user config panel
export const setPreviewStyles = (previewStyles: PreviewStyles) => (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  dispatch({
    type: SET_PREVIEW_STYLES,
    previewStyles
  })

  // This will add a * to the dashboard save button to indicate that the user
  // needs to save these changes for them to persist on the dashboard. This does
  // NOT indicate that we've actually modified the dashboard Redux state in any way
  dispatch(updateDashboardSaveState())

  updateColorsService(getState)
}

// This is used to reset preview styles
export const resetPreviewStyles = () => (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  dispatch({
    type: RESET_PREVIEW_STYLES
  })
  updateColorsService(getState)
}

// Copies any of the styles the user have set in preview to the dashboard
// and dirties the dashboard save state
export const setDashboardStyles = () => (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  const { userConfigurableUI } = getState()

  // This sets the styles on the dashboard state as well so that when a user
  // clicks Save on the dashboard, the styles are saved
  dispatch({
    type: SET_DASHBOARD_STYLES,
    styles: userConfigurableUI.previewStyles
  })
}

// This resets styles for both preview and the current dashboard,
// and dirties the dashboard save state
export const resetDashboardStyles = () => (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  dispatch(resetPreviewStyles())

  dispatch({
    type: RESET_DASHBOARD_STYLES
  })

  // This will add a * to the dashboard save button to indicate dashboard
  // state is dirty (resetting the styles doesn't save automatically)
  dispatch(updateDashboardSaveState())

  updateColorsService(getState)
}

// Reset the styles back to the defaults, which we do by clearing out
// savedDatabaseStyles and previewStyles. But wait until the save request
// completes successfully, then update redux
export const resetToThemeDefaults = () => (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  dispatch({ type: SAVE_DATABASE_STYLES_REQUEST })

  handleSaveDBStyles({}, dispatch).then(() => {
    dispatch({
      type: RESET_TO_THEME_DEFAULTS
    })
    updateColorsService(getState)
  })
}

// Save styles to the database
export const saveDatabaseStyles = () => async (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  dispatch({ type: SAVE_DATABASE_STYLES_REQUEST })

  const styles = getUserConfigurableUISettings(getState())
  await handleSaveDBStyles(styles, dispatch)
}

// Save tint theme color
export const setThemeTint = (color) => ({
  type: SET_THEME_TINT,
  color
})

export const setSavedThemeTint = (color) => ({
  type: SET_SAVED_THEME_TINT,
  color
})

export const resetThemeTint = () => async (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  const color = getState().userConfigurableUI.savedThemeTint
  dispatch({
    type: SET_THEME_TINT,
    color
  })
}

export const setCurrentUITheme = (theme: string) => ({
  type: SET_UI_THEME,
  theme
})

export const resetUITheme = () => async (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  const theme = getState().userConfigurableUI.savedUITheme
  setCurrentTheme(theme)
  dispatch({
    type: SET_UI_THEME,
    theme
  })
}

export const setSavedUITheme = (theme: string) => ({
  type: SET_SAVED_UI_THEME,
  theme
})

export const setCustomThemeEnabled = (enabled: boolean) => ({
  type: SET_CUSTOM_THEME_ENABLED,
  enabled
})
