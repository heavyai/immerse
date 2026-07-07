// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as NavBarActions from "actions/nav-bar-action-creators"

import { mapStateToProps, mapDispatchToProps } from "./navigation-bar-container"

describe("NavigationBarContainer Component", () => {
  const state = {
    dashboard: {
      currentDataSource: "flights",
      privileges: {
        editDashboard: false
      }
    },
    connection: {
      isConnected: true,
      isDemo: false,
      isRenderingEnabled: false,
      isMSDEnabled: false,
      user: { username: "heavyai" },
      sessionInfo: {
        user: "heavyai",
        database: "heavyai"
      },
      privileges: {
        viewSqlEditor: true
      }
    },
    navBar: {
      helpMenuOpen: false,
      userMenuOpen: false
    },
    router: {
      location: {
        pathname: "heavyai"
      }
    },
    userConfigurableUI: {
      themeTint: { hsl: { h: 200, s: 0.5, l: 0 } }
    }
  }
  const dispatch = jest.fn()
  describe("mapStateToProps", () => {
    it("should mapStateToProps", () => {
      const result = mapStateToProps(state)
      expect(result).toStrictEqual({
        canCreateTable: undefined,
        title: undefined,
        isMSDEnabled: false,
        charts: undefined,
        warnDashboardUnsaved: false,
        canEditDashboard: false,
        user: { username: "heavyai" },
        username: "heavyai",
        database: "heavyai",
        connected: true,
        appVersion: undefined,
        coreVersion: undefined,
        helpMenuOpen: false,
        userMenuOpen: false,
        isDemo: false,
        isRenderingEnabled: false,
        isTrial: false,
        route: "heavyai",
        themeTint: { hsl: { h: 200, s: 0.5, l: 0 } },
        disableHelpMenu: false,
        enableSqlEditor: true,
        hasCustomHomeRoute: false,
        showUnsavedChangesDialog: false
      })
    })
  })

  describe("mapDispatchToProps", () => {
    const { actions } = mapDispatchToProps(dispatch)

    it("should return proper actions", () => {
      actions.disconnect()
      expect(dispatch).toHaveBeenCalled()

      actions.navigateHome()
      expect(dispatch).toHaveBeenLastCalledWith(NavBarActions.handleHomeClick())

      actions.navigateToHomeOverride()
      expect(dispatch).toHaveBeenLastCalledWith(
        NavBarActions.routeToHomeOverride()
      )

      actions.goToCommunityForum()
      expect(dispatch).toHaveBeenLastCalledWith(
        NavBarActions.routeToCommunityForum()
      )

      actions.goToDocumentation()
      expect(dispatch).toHaveBeenLastCalledWith(
        NavBarActions.routeToDocumentation()
      )

      actions.goToTutorials()
      expect(dispatch).toHaveBeenLastCalledWith(
        NavBarActions.routeToTutorials()
      )
    })
  })
})
