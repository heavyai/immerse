// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Redirect, Route, Switch } from "react-router-dom"

import { ROUTE_ROLE_SETTINGS } from "routes/paths"
import {
  useIsControlPanelAdmin,
  useIsSuperuser
} from "components/settings/selectors/permissionsSelectors"
import { useSettingsPath } from "./routing/useSettingsPath"
import UsageSettings from "./settings-sections/usage"
import FeatureSettings from "./settings-sections/features"
import UsersSettings from "./settings-sections/users"
import RolesSettings from "./settings-sections/roles"
// import ProfileSettings from "./settings-sections/profile"
import SystemDashboards from "./settings-sections/system-dashboards"
import { ImmerseTheming } from "./settings-sections/theming"
import { ColorPalettes } from "./settings-sections/color-palettes"
import Logs from "./settings-sections/logs"

const SettingsContent = () => {
  const isSuperuser = useIsSuperuser()
  const rolesSettingsPath = useSettingsPath({ settingsSection: "roles" })
  const usersSettingsPath = useSettingsPath({ settingsSection: "users" })
  const defaultPath = isSuperuser ? rolesSettingsPath : usersSettingsPath
  const controlPanelAdminContent = (
    <Switch>
      <Route path={useSettingsPath({})} exact>
        <Redirect to={defaultPath} />
      </Route>
      <Route
        path={useSettingsPath({ settingsSection: "usage" })}
        exact
        component={UsageSettings}
      />
      <Route
        path={useSettingsPath({ settingsSection: "users" })}
        exact
        component={UsersSettings}
      />
      <Route
        path={useSettingsPath({ settingsSection: "features" })}
        exact
        component={FeatureSettings}
      />
      <Route
        path={useSettingsPath({ settingsSection: "theming" })}
        exact
        component={ImmerseTheming}
      />
      <Route
        path={useSettingsPath({ settingsSection: "color-palettes" })}
        exact
        component={ColorPalettes}
      />
      {/* <Route*/}
      {/*  path={useSettingsPath({ settingsSection: "profile" })}*/}
      {/*  exact*/}
      {/*  component={ProfileSettings}*/}
      {/* />*/}
      <Route
        path={useSettingsPath({ settingsSection: "system-dashboards" })}
        exact
        component={SystemDashboards}
      />
      <Route
        path={useSettingsPath({ settingsSection: "logs" })}
        exact
        component={Logs}
      />
      {isSuperuser && (
        <Route path={ROUTE_ROLE_SETTINGS} exact component={RolesSettings} />
      )}
      <Redirect to={defaultPath} />
    </Switch>
  )

  // const userContent = (
  //   <>
  //     <Switch>
  //       <Route
  //         path={useSettingsPath({ settingsSection: "profile" })}
  //         exact
  //         component={ProfileSettings}
  //       />
  //       <Redirect to={useSettingsPath({ settingsSection: "profile" })} />
  //     </Switch>
  //   </>
  // )

  const userContent = <Redirect to={"/"} />

  return (
    <div className="settings__content">
      {useIsControlPanelAdmin() ? controlPanelAdminContent : userContent}
    </div>
  )
}

export default SettingsContent
