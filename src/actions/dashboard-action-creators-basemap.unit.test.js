// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  importDashboard,
  mapStateToSerializedViewState,
  normalizeMinimalistBasemapState
} from "actions/dashboard-action-creators"

const decodeSerializedState = (state) =>
  JSON.parse(window.decodeURIComponent(window.escape(window.atob(state))))

describe("dashboard-action-creators minimalist basemap", () => {
  it("serializes legacy minimalist basemap objects using the sentinel value", () => {
    const state = {
      connection: { version: "1.0.0" },
      dashboard: {
        saveState: { lastState: "ignore" }
      },
      charts: {
        "1": {
          basemap: {
            label: "Minimalist",
            value: {
              version: 8,
              sources: {
                countries: {
                  type: "geojson",
                  data: { type: "FeatureCollection", features: [] }
                }
              },
              layers: [{ id: "countries", source: "countries" }]
            }
          }
        }
      },
      filters: []
    }

    const serializedState = mapStateToSerializedViewState(state)
    const decodedState = decodeSerializedState(serializedState)

    expect(decodedState.charts["1"].basemap.value).toBe("minimalist")
    expect(JSON.stringify(decodedState)).not.toContain(
      '"sources":{"countries":{"type":"geojson","data":{"type":"FeatureCollection"'
    )
  })

  it("normalizes imported legacy minimalist basemap payloads before save", async () => {
    const services = new Map()
    const createDashboardAsync = jest.fn().mockResolvedValue(undefined)
    services.set("DbCon", {
      getDashboardsAsync: jest.fn().mockResolvedValue([]),
      createDashboardAsync
    })

    const dispatch = jest.fn()
    const getState = () => ({})
    const legacyImportState = JSON.stringify({
      charts: {
        "1": {
          basemap: {
            label: "Minimalist",
            value: {
              version: 8,
              sources: {
                countries: {
                  type: "geojson",
                  data: { type: "FeatureCollection", features: [] }
                }
              },
              layers: [{ id: "countries", source: "countries" }]
            }
          }
        }
      },
      dashboard: {
        title: "Legacy"
      }
    })

    await importDashboard("Legacy", "{}", legacyImportState)(
      dispatch,
      getState,
      services
    )

    const serializedImportedState = createDashboardAsync.mock.calls[0][1]
    const decodedImportedState = decodeSerializedState(serializedImportedState)

    expect(decodedImportedState.charts["1"].basemap.value).toBe("minimalist")
  })

  it("normalizes legacy minimalist basemaps inside tabs", () => {
    const normalizedState = normalizeMinimalistBasemapState({
      tabs: {
        tab1: {
          charts: {
            "2": {
              basemap: {
                label: "Minimalist",
                value: {
                  version: 8,
                  sources: {
                    countries: {
                      type: "geojson",
                      data: { type: "FeatureCollection", features: [] }
                    }
                  },
                  layers: [{ id: "countries", source: "countries" }]
                }
              }
            }
          }
        }
      }
    })

    expect(normalizedState.tabs.tab1.charts["2"].basemap.value).toBe(
      "minimalist"
    )
  })
})
