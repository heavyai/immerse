// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import DatabaseSwitcher from "components/database-switcher/database-switcher"
import { MenuSurfaceAnchor, MenuSurface, MenuItem } from "@rmwc/menu"
import cx from "classnames"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import { SecondaryButton } from "widgets/button/Button"
import React from "react"
import { noop } from "utils/helpers"
import AccountPanelAnchor from "./account-panel-anchor"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import IconAccount from "components/svg-icons/icon-account"
import { getThemes, currentTheme } from "utils/dark-mode-switcher"
import HelpMenu from "components/global-side-nav/HelpMenu"
import {
  IMMERSE_UI_HELP_DROPDOWN,
  ImmerseUIRequired
} from "services/immerse-ui-provider"
import { routeToSettings } from "utils/routerPath"
import { Link } from "react-router-dom"
import { Icon } from "@rmwc/icon"
import { useIsControlPanelAdmin } from "components/settings/selectors/permissionsSelectors"
import { useImmerseUITheme } from "utils/theme/use-immerse-ui-theme"
const {
  GLOBAL_SIDE_NAV,
  INTERRUPT_SESSION_QUERIES,
  ENABLE_CONTROL_PANEL_2,
  ENABLE_KEY_MANAGER
} = available_feature_flags

const AccountPanel = ({
  isOpen,
  onToggleOpen = noop,
  username,
  wrapDatabaseChange,
  onThemeSelection = noop,
  onCancelClick = noop,
  onLogoutClick = noop,
  helpLinks = [],
  disableHelpMenu = false,
  database,
  isSuperuser
}) => {
  const isControlPanelAdmin = useIsControlPanelAdmin()
  const { theme } = useImmerseUITheme()
  return (
    <div className="account-panel" data-testid="account-panel-trigger">
      <MenuSurfaceAnchor>
        <MenuSurface
          {...{
            className: "account-menu-panel",
            open: isOpen,
            onClose: () => {
              if (isOpen) {
                onToggleOpen()
              }
            }
          }}
        >
          <div className="account-user">
            <span className="user-label">Logged in as: </span>
            <span className="user-value" title={username}>
              {username}
            </span>
          </div>
          <DatabaseSwitcher wrapChange={wrapDatabaseChange} />
          <MultiSelect
            className="theme-selector"
            data-testid="theme-selector"
            value={{
              label: `${theme}`,
              value: theme
            }}
            placeholder={"UI Theme"}
            options={getThemes().map((name) => ({
              label: `${name}`,
              value: name
            }))}
            onChange={(option) => onThemeSelection(option.value)}
          />
          {getFeatureFlag(ENABLE_CONTROL_PANEL_2) && isControlPanelAdmin && (
            <Link to={routeToSettings(database)}>
              <MenuItem className="control-panel-link" onClick={onToggleOpen}>
                <Icon icon="tune" size="small" />
                Control Panel
              </MenuItem>
            </Link>
          )}
          {!disableHelpMenu &&
            isSuperuser &&
            getFeatureFlag(ENABLE_KEY_MANAGER) && (
              <ImmerseUIRequired uiKey={IMMERSE_UI_HELP_DROPDOWN}>
                <div className="separator-top" />
                <HelpMenu helpLinks={helpLinks} toggleIsOpen={onToggleOpen} />
                <div className="separator-bottom" />
              </ImmerseUIRequired>
            )}
          {getFeatureFlag(INTERRUPT_SESSION_QUERIES) && (
            <div
              className={"cancel-queries-button-wrapper"}
              id={"cancel-queries"}
              onClick={onCancelClick}
            >
              <SecondaryButton label="Cancel Queries" icon="close" />
            </div>
          )}
          <div
            className={"logout-button-wrapper"}
            id={"logout"}
            onClick={onLogoutClick}
          >
            <SecondaryButton>Log out</SecondaryButton>
          </div>
        </MenuSurface>

        {getFeatureFlag(GLOBAL_SIDE_NAV) ? (
          <div
            className={cx("global-side-nav__account", {
              "is-panel-open": isOpen
            })}
            onClick={onToggleOpen}
            data-testid="account-panel"
          >
            <IconAccount />
          </div>
        ) : (
          <AccountPanelAnchor
            {...{
              isOpen,
              onToggleOpen
            }}
          />
        )}
      </MenuSurfaceAnchor>
    </div>
  )
}

export default AccountPanel
