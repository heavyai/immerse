// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"

import { DataSourceSelector } from "./data-source-selector"

describe("DataSourceSelector", () => {
  it("should dispatch an action when mounted if tables list is empty", async () => {
    const state = {
      connection: {
        isMSDEnabled: true
      },
      dashboard: { dataSources: {} },
      tables: { list: [], loading: false, loaded: false },
      chartEditor: { savedDataSources: { dataSources: {} } },
      charts: {},
      joinDataSources: []
    }

    const dispatch = jest.fn()
    const store = {
      getState: () => state,
      dispatch,
      subscribe: jest.fn()
    }

    render(
      <Provider store={store}>
        <DataSourceSelector chartId="1" />
      </Provider>
    )

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalled()
    })
  })
})
