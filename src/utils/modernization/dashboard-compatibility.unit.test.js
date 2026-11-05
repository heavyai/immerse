// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"
import { mapStateToSerializedViewState } from "actions/dashboard-action-creators"
import { deserialize } from "utils/dashboard-load"
import loadDashboard from "reducers/load-dashboard-higher-order-reducer"
import { initialState as dc } from "reducers/dc-reducer"
import { LOAD_DASHBOARD_SUCCESS } from "constants/action-types"
import {
  getFeatureFlag,
  setFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import legacy from "../../../test-config/modernization/fixtures/legacy-single-source.json"
import mixed from "../../../test-config/modernization/fixtures/mixed-engines.json"

const { DASHBOARD_TABS } = available_feature_flags
const fixtures = { legacy, mixed }
const clone = (value) => cloneDeep(value)
const load = (document, previous = {}) =>
  loadDashboard((state) => state)(
    { dashboard: {}, dc: clone(dc), ...previous },
    {
      type: LOAD_DASHBOARD_SUCCESS,
      dashboardState: clone(document),
      dashboardId: "fixture-dashboard",
      dashboardOwner: "fixture-owner"
    }
  )

describe("dashboard compatibility kernel", () => {
  let previousTabs = false
  beforeEach(() => {
    previousTabs = getFeatureFlag(DASHBOARD_TABS)
    setFeatureFlag(DASHBOARD_TABS, false)
  })
  afterEach(() => setFeatureFlag(DASHBOARD_TABS, previousTabs))

  it.each(Object.keys(fixtures))(
    "%s preserves writer bytes and canonical migration output",
    (name) => {
      const serialized = mapStateToSerializedViewState(clone(fixtures[name]))
      // Golden wire bytes are independent of the decoder under test.
      expect(serialized).toMatchSnapshot(`${name} wire base64`)
      const document = deserialize(serialized)
      expect(Buffer.from(serialized, "base64").toString("utf8")).toBe(
        JSON.stringify(document)
      )
      const loaded = load(document)
      const canonicalWire = mapStateToSerializedViewState({
        ...loaded,
        connection: { version: "9.0.0" }
      })
      expect(deserialize(canonicalWire)).toMatchSnapshot(
        `${name} canonical upgraded document`
      )
      // The supported normalization/upgrader pipeline reaches a fixed point.
      const reloaded = load(deserialize(canonicalWire))
      expect(
        mapStateToSerializedViewState({
          ...reloaded,
          connection: { version: "9.0.0" }
        })
      ).toBe(canonicalWire)
      expect(loaded.dashboard.title).toBe("Compatibility — 測試")
    }
  )

  it("upgrades legacy source and sorting while retaining legacy filters", () => {
    const loaded = load(
      deserialize(mapStateToSerializedViewState(clone(legacy)))
    )
    expect(loaded.charts["1"].dataSource).toBe("fixture_sales")
    expect(loaded.filters[0].dataSource).toBe("fixture_sales")
    expect(loaded.charts["1"].sortColumn).toEqual({
      col: { name: "region" },
      index: 0,
      order: "asc"
    })
    expect(loaded.omnifilters).toEqual([])
  })

  it("retains query/filter, parameter, join, addon and engine identifiers", () => {
    const loaded = load(clone(mixed))
    expect(Object.values(loaded.charts).map((chart) => chart.type)).toEqual([
      "pie",
      "vega-combo",
      "pointmap",
      "deckgl-pointmap",
      "number",
      "iframe"
    ])
    for (const key of [
      "omnifilters",
      "parameters",
      "joinDataSources",
      "crossLinks",
      "chartAddons"
    ]) {
      expect(loaded[key]).toEqual(mixed[key])
    }
  })

  it("preserves inactive tabs and shared state through the real tabbed writer", () => {
    setFeatureFlag(DASHBOARD_TABS, true)
    const active = clone(mixed)
    active.dashboard.selectedTabId = "tab-a"
    active.dashboard.tabs = { "tab-a": clone(mixed), "tab-b": clone(legacy) }
    const serialized = mapStateToSerializedViewState(active)
    expect(serialized).toMatchSnapshot("tabbed wire base64")
    const document = deserialize(serialized)
    expect(Object.keys(document.tabs)).toEqual(["tab-a", "tab-b"])
    expect(document.tabs["tab-a"].charts).toEqual(mixed.charts)
    expect(document.tabs["tab-b"].charts).toEqual(legacy.charts)
    expect(document.parameters).toEqual(mixed.parameters)
    for (const tab of Object.values(document.tabs)) {
      expect(load(tab).dashboard.title).toBe(active.dashboard.title)
    }
  })

  it("rejects malformed wire input instead of silently yielding an empty document", () => {
    expect(() => deserialize("not base64!!")).toThrow()
    expect(() => deserialize(window.btoa("{invalid json}"))).toThrow()
  })
})
