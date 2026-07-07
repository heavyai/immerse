// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapStateToProps } from "./dashboards-parent"

describe("Dashboards Parent", () => {
  const state = {
    connection: {
      isDemo: false,
      isMSDEnabled: true,
      privileges: {},
      version: 3,
      sessionInfo: {
        database: "heavyai",
        user: "admin"
      }
    },
    dashboards: [],
    dashboard: {
      loadState: {
        loadLinkId: "12j48jd"
      }
    },
    router: {
      location: {
        pathname: ""
      }
    }
  }

  it("should mapStateToProps properly", () => {
    expect(mapStateToProps(state)).toEqual({
      canCreateDashboard: undefined,
      dashboards: [],
      isDemo: false,
      loadLinkId: "12j48jd",
      version: 3,
      pathname: "",
      dbName: "heavyai",
      username: "admin"
    })
  })
})
