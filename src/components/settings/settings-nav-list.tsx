// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import SettingsNavItem from "./settings-nav-item"
import SettingsHeader from "./settings-header"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
const { GLOBAL_SIDE_NAV } = available_feature_flags
import {
  useIsControlPanelAdmin,
  useIsSuperuser
} from "components/settings/selectors/permissionsSelectors"
import { SETTINGS_PERMISSION } from "components/settings/types"

const getSettingsSections = (
  isControlPanelAdmin: boolean,
  isSuperuser: boolean
) => {
  return [
    // {
    //   header: "Account",
    //   sections: [{ label: "Profile", settingsSection: "profile" }],
    //   permission: SETTINGS_PERMISSION.USER
    // },
    {
      header: "Administration",
      sections: [
        // BE only returns roles list for superusers
        ...(isSuperuser ? [{ label: "Roles", settingsSection: "roles" }] : []),
        { label: "Users", settingsSection: "users" }
      ],
      permission: SETTINGS_PERMISSION.ADMIN
    },
    {
      header: "Customization",
      sections: [
        { label: "Feature Flags", settingsSection: "features" },
        { label: "Immerse Theming", settingsSection: "theming" },
        { label: "Color Palettes", settingsSection: "color-palettes" }
      ],
      permission: SETTINGS_PERMISSION.ADMIN
    },
    {
      header: "System",
      sections: [
        // Usage page currently blocked by cross-database queries
        // { label: "Usage & Diagnostics", settingsSection: "usage" },
        { label: "System Dashboards", settingsSection: "system-dashboards" },
        { label: "Log Files", settingsSection: "logs" }
      ],
      permission: SETTINGS_PERMISSION.ADMIN
    }
  ].filter(
    ({ permission }) =>
      isControlPanelAdmin || permission === SETTINGS_PERMISSION.USER
  )
}

const SettingsNavList = () => {
  const isControlPanelAdmin = useIsControlPanelAdmin()
  const isSuperuser = useIsSuperuser()
  return (
    <ul className="settings__nav">
      {!getFeatureFlag(GLOBAL_SIDE_NAV) && <SettingsHeader />}
      {getSettingsSections(isControlPanelAdmin, isSuperuser).map(
        ({ header, sections }) => (
          <React.Fragment key={header}>
            <h6>{header}</h6>
            <ul>
              {sections.map(({ settingsSection, label }) => {
                return (
                  <SettingsNavItem
                    settingsSection={settingsSection}
                    label={label}
                    key={settingsSection}
                  />
                )
              })}
            </ul>
          </React.Fragment>
        )
      )}
    </ul>
  )
}

export default SettingsNavList
