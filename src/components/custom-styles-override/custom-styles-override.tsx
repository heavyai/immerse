// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect } from "react"
import { connect, ConnectedProps } from "react-redux"
import blinder from "color-blind"
import initCSSVars from "polyfills/css-vars"

import { AppState } from "vega/charts/types"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { currentTheme, getAllThemes } from "utils/dark-mode-switcher"
import { CUSTOM_THEME } from "utils/theme/types"
import {
  fontSizeWeightOverrides,
  labelOverrides,
  legendOverrides,
  chartMarginOverrides
} from "components/ui-config-panel/utils"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"

const { COLOR_BLIND } = available_feature_flags

function buildStyleString({ buttonPrimaryColor = "#0089D1" }) {
  switch (getFeatureFlag(COLOR_BLIND)) {
    case "protanopia":
      buttonPrimaryColor = blinder.protanopia(buttonPrimaryColor)
      break
    case "deuteranopia":
      buttonPrimaryColor = blinder.deuteranopia(buttonPrimaryColor)
      break
    case "tritanopia":
      buttonPrimaryColor = blinder.tritanopia(buttonPrimaryColor)
      break
    default:
  }

  return `
      html body {
        --blue-main: ${buttonPrimaryColor || "#0089D1"};
      }
    `
}

function buildUIVariables(theme, themeTint) {
  const { h, s } = theme === CUSTOM_THEME ? themeTint.hsl : { h: 200, s: 0 }
  return `
      html body {
        --main-color: ${h};
        --main-saturation: ${s * 100}%;
      }
    `
}

const mapStateToProps = (state: AppState) => {
  return {
    // We use this to set button styles
    serversJSONStyles: state.connection.user.customStyles,
    // We use this to set dark / light mode
    theme: currentTheme(),
    themeTint: state.userConfigurableUI.themeTint,
    // We use this to change styles based on the current UserConfigurableUI
    // settings
    userConfigurableUISettings: getUserConfigurableUISettings(state)
  }
}

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  undefined,
  undefined,
  AppState
>(mapStateToProps)

type Props = ConnectedProps<typeof connector>

const CustomStylesOverrides: FC<Props> = ({
  serversJSONStyles = {},
  theme,
  themeTint,
  userConfigurableUISettings
}) => {
  useEffect(() => {
    initCSSVars.init()
  }, [serversJSONStyles])

  useEffect(() => {
    const themes = getAllThemes()
    if (themes.includes(theme)) {
      document.body.classList.remove(
        ...themes.map((themeName) => `${themeName}-mode`)
      )
      document.body.classList.add(`${theme}-mode`)
    }
  }, [theme])

  useEffect(() => {
    if (userConfigurableUISettings.highContrastFontColors) {
      document.body.classList.add("high-contrast")
    } else {
      document.body.classList.remove("high-contrast")
    }
  }, [userConfigurableUISettings])

  return (
    <>
      <style type="text/css" id="servers-json-styles">
        {buildStyleString(serversJSONStyles)}
        {buildUIVariables(theme, themeTint)}
      </style>
      <style type="text/css" id="ui-config-styles">
        {fontSizeWeightOverrides(userConfigurableUISettings)}
        {labelOverrides(userConfigurableUISettings)}
        {legendOverrides(userConfigurableUISettings)}
        {chartMarginOverrides(userConfigurableUISettings)}
      </style>
    </>
  )
}

export default connector(CustomStylesOverrides)
