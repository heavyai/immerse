// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"

import { getActiveDataSources } from "./currently-active-datasources"

import {
  mock_state_1,
  mock_state_2,
  mock_state_3,
  mock_state_4,
  mock_state_5,
  mock_state_6,
  mock_state_7
} from "utils/test-helpers/mock-app-states/filter-panel-states"

describe("getActiveDataSources for current filter-set", () => {
  it("should return datasources currently in filters or charts", () => {
    const dataSources = getActiveDataSources(mock_state_1, true)
    expect(dataSources).to.eql(["flights"])
  })
  it("should return datasources currently in filters or charts, even if there are additional datasources loaded", () => {
    const dataSources = getActiveDataSources(mock_state_2, true)
    expect(dataSources).to.eql(["flights"])
  })
  it("should return datasources currently in filters or charts, for dashboard with active filters from multiple datasources", () => {
    const dataSources = getActiveDataSources(mock_state_3, true)
    expect(dataSources).to.eql(["flights", "airplanes"])
  })
  it("should return datasources currently in filters or charts, for the given filter set", () => {
    const dataSources = getActiveDataSources(mock_state_4, true)
    expect(dataSources).to.eql(["contributions", "flights"])
  })
})

describe("getActiveDataSources for entire dashboard, regardless of filter-set", () => {
  it("should return datasources currently in filters or charts on dashboards with multiple filter sets", () => {
    const dataSources = getActiveDataSources(mock_state_4, false)
    expect(dataSources).to.eql(["flights", "airplanes", "contributions"])
  })
  it("should return datasources for new vega bar chart", () => {
    const dataSources = getActiveDataSources(mock_state_5, false)
    expect(dataSources).to.eql(["flights"])
  })
  it("should return datasources for multisource raster", () => {
    const dataSources = getActiveDataSources(mock_state_6, false)
    expect(dataSources).to.eql(["flights", "tweets_small"])
  })
  it("should return datasources for vdf combo", () => {
    const dataSources = getActiveDataSources(mock_state_7, false)
    expect(dataSources).to.eql(["flights", "tweets_small"])
  })
})
