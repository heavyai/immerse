// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"

import ChartSettingsGeoJsonDropdown from "./chart-settings-geojson-dropdown"

describe("ChartSettingsGeoJsonDropdown", () => {
  const baseProps = {
    chartType: "backendChoropleth",
    defaultValue: { label: "test", value: "test" },
    geoJoin: { table: "test" },
    isPolyRasterEnabled: true,
    options: [{ label: "test", value: "test", type: "TEXT" }],
    updateGeoJoinValue: jest.fn(),
    updateGeoJsonValue: jest.fn(),
    selectJoinDataSource: jest.fn(),
    clearJoinDataSource: jest.fn()
  }

  const store = {
    getState: () => ({
      dashboard: { dataSources: {} },
      tables: { list: [], listWithMeta: [] },
      joinDataSources: [],
      tablesMeta: {},
      connection: { roles: [] }
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn()
  }

  it("renders ChartSourceSelector when poly raster is enabled and appropriate chart type", () => {
    const { container } = render(
      <Provider store={store}>
        <ChartSettingsGeoJsonDropdown {...baseProps} />
      </Provider>
    )

    expect(
      container.querySelector(".geo-join-source-selector")
    ).toBeInTheDocument()
    expect(container.querySelector(".geo-json-dropdown")).toBeInTheDocument()
  })
})
