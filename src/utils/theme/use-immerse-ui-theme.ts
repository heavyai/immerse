// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SET_SAVED_UI_THEME,
  SET_UI_THEME
} from "actions/user-configurable-ui-action-creators"
import { useDispatch, useSelector } from "react-redux"
import { ImmerseUITheme, DARK_THEME, CUSTOM_THEME } from "./types"

/**
 * Packages up the uiTheme and savedUITheme and customThemeEnabled and provides a way to set them
 *
 * @param theme - The theme to set
 * @param savedTheme - The saved theme to set
 * @param customThemeEnabled - The custom theme enabled to set
 *
 * @returns
 */
export const useImmerseUITheme = () => {
  const dispatch = useDispatch()
  const uiTheme = useSelector((state: any) => state.userConfigurableUI.uiTheme)
  const savedUITheme = useSelector(
    (state: any) => state.userConfigurableUI.savedUITheme
  )
  const customThemeEnabled = useSelector(
    (state: any) => state.userConfigurableUI.customThemeEnabled
  )

  const setTheme = (theme: ImmerseUITheme) => {
    dispatch({ type: SET_UI_THEME, theme })
  }
  const setSavedTheme = (theme: ImmerseUITheme) => {
    dispatch({ type: SET_SAVED_UI_THEME, theme })
  }
  return {
    theme: uiTheme as ImmerseUITheme,
    setTheme,
    savedTheme: savedUITheme as ImmerseUITheme,
    setSavedTheme,
    customThemeEnabled: customThemeEnabled as boolean
  }
}

export const isThemeDark = (theme: ImmerseUITheme) => {
  return theme === DARK_THEME
}

export function isThemeDarkOrCustom(theme: ImmerseUITheme) {
  return theme === CUSTOM_THEME || theme === DARK_THEME
}
