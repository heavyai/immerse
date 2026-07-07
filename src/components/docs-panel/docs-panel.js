// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MenuSurfaceAnchor, MenuSurface, MenuItem } from "@rmwc/menu"
import cx from "classnames"
import React from "react"
import { noop } from "utils/helpers"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { shallowEqual, useSelector } from "react-redux"
import { Icon } from "@rmwc/icon"
import "./docs-panel.scss"

const { GLOBAL_SIDE_NAV } = available_feature_flags

const DocsPanel = ({ isOpen, onToggleOpen = noop, onDocsClick = noop }) => {
  const appInfo = useSelector(({ connection }) => {
    return {
      coreVersion: `Core v${connection.version}`,
      isRenderingEnabled: connection.isRenderingEnabled ? "Enabled" : "Disabled"
    }
  }, shallowEqual)

  return (
    <div className="docs-panel account-panel" data-testid="docs-panel-trigger">
      <MenuSurfaceAnchor>
        <MenuSurface
          {...{
            className: "docs-menu-panel account-menu-panel",
            open: isOpen,
            onClose: () => {
              if (isOpen) {
                onToggleOpen()
              }
            }
          }}
        >
          <MenuItem onClick={onDocsClick}>
            <Icon icon="description" size="small" />
            Documentation
          </MenuItem>

          <div className="separator-top" />

          <div className="section-wrapper">
            <h3>About Immerse</h3>
            <div className="app-info">
              {appInfo.coreVersion}
              <br />
              Backend Rendering {appInfo.isRenderingEnabled}
            </div>
          </div>
        </MenuSurface>

        <div
          className={cx("docs-panel__anchor", {
            "global-side-nav__docs": getFeatureFlag(GLOBAL_SIDE_NAV),
            "is-panel-open": isOpen
          })}
          onClick={onToggleOpen}
          data-testid="docs-panel"
        >
          <Icon icon="help_outline" />
        </div>
      </MenuSurfaceAnchor>
    </div>
  )
}

export default DocsPanel
