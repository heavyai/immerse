// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { customStyleSelector } from "reducers/connection"
import nvLogoWhite from "../../assets/imgs/nvidia-h-white.png"
import nvLogoBlack from "../../assets/imgs/nvidia-h-black.png"
import {
  isThemeDarkOrCustom,
  useImmerseUITheme
} from "utils/theme/use-immerse-ui-theme"

function customLogoSelector(state) {
  const { darkThemeLogoURL, logoURL } = customStyleSelector(state)
  return isThemeDarkOrCustom(state.userConfigurableUI.uiTheme) &&
    darkThemeLogoURL
    ? darkThemeLogoURL
    : logoURL
}

function mapStateToProps(state) {
  return {
    customLogo: customLogoSelector(state),
    serversJsonPending: state.connection.serversJsonPending
  }
}

Logo.propTypes = {
  customLogo: PropTypes.string,
  serversJsonPending: PropTypes.bool
}

function Logo({ customLogo, serversJsonPending }) {
  if (serversJsonPending) {
    return <div className="app-logo" />
  } else if (customLogo) {
    return <img className={"app-logo custom-logo"} src={customLogo} />
  } else {
    return <ComboLogo />
  }
}

export default connect(mapStateToProps)(Logo)

export const HeavyAILogo = () => (
  <span className="app-logo heavy-logo">HeavyAI</span>
)

const NVLogo = () => {
  const { theme } = useImmerseUITheme()
  const nvLogo = isThemeDarkOrCustom(theme) ? nvLogoWhite : nvLogoBlack
  return <img src={nvLogo} className="nv-logo" />
}

export const ComboLogo = () => {
  return (
    <div className="combo-logo">
      <NVLogo />
      <div className="vertical-separator" />
      <HeavyAILogo />
    </div>
  )
}
