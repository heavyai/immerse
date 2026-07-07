// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import withStoreContext from "utils/test-helpers/with-store-context"

import Dashboards from "./dashboards"

describe("Dashboards Component", () => {
  const state = {
    dashboards: {
      selected: new Set()
    },
    dashboard: {
      columnMetadata: []
    },
    filters: [],
    connection: {
      user: {},
      roles: []
    }
  }

  const props = {
    dashboards: {
      list: [
        {
          error: false,
          image_hash: "",
          loading: false,
          update_time: "",
          dashboard_name: "empty-dash",
          dashboard_state: ""
        },
        {
          dashboard_name: "dash1",
          image_hash: "",
          update_time: "",
          dashboard_state: "",
          error: false
        },
        {
          dashboard_name: "dash2",
          image_hash: "",
          update_time: "",
          dashboard_state: "",
          error: false
        }
      ],
      selected: new Set(),
      error: null
    },
    loadLinkId: "",
    hideModal: () => {},
    initializeDashboard: () => {},
    sharingEnabled: true,
    showDashboardImportModal: () => {},
    clearDashboard: () => {},
    resetAppState: () => {},
    dbName: "heavyai"
  }

  props.getDashboards = jest.fn()
  props.loadDashboardLink = jest.fn()
  props.showModal = jest.fn()

  function renderDashboards(nextProps) {
    return render(
      withStoreContext(<Dashboards {...props} {...nextProps} />, state)
    )
  }

  it("should be initialized with getDashboards", () => {
    renderDashboards()
    expect(props.getDashboards).toHaveBeenCalled()
  })

  it("should be initialized with loadDashboardLink", () => {
    renderDashboards({ loadLinkId: "asdfas" })
    expect(props.loadDashboardLink).toHaveBeenCalled()
  })
})
