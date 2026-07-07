// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import Logo from "components/logo/logo"

export const appInfoContentTestId = "appInfoContentTestId"
export const appInfoSpecsTestId = "appInfoSpecsTestId"

AppInfo.propTypes = {
  appVersion: PropTypes.string,
  coreVersion: PropTypes.string,
  isRenderingEnabled: PropTypes.bool
}

export default function AppInfo(props) {
  return (
    <div className="app-info-content" data-testid={appInfoContentTestId}>
      <div className="app-info-logo">
        <Logo />
      </div>
      <ul className="app-info-specs" data-testid={appInfoSpecsTestId}>
        {props.appVersion && <li>{`Immerse v${props.appVersion}`}</li>}
        {props.coreVersion && <li>{`Core v${props.coreVersion}`}</li>}
        {typeof props.isRenderingEnabled === "boolean" && (
          <li>{`Backend Rendering ${
            props.isRenderingEnabled ? "Enabled" : "Disabled"
          }`}</li>
        )}
      </ul>
    </div>
  )
}
