// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import {
  FILTER_TYPE_ISNULL,
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_DISTANCE,
  FILTER_TYPE_NOT,
  FILTER_TYPE_OR
} from "vega/constants/filter-type-constants"

const services = new Map()
services.set("dc", {
  redrawAllAsync() {
    return Promise.resolve()
  }
})

const middlewares = [thunk.withExtraArgument(services)]

const mockStore = configureStore(middlewares)

import * as InteropActions from "./filter-action-creators-crossfilter-interop"

describe("crossfilter interop actions", () => {
  it("setFilterX on a chart to add integer filter", async () => {
    const initialState = {
      dc: { initialRender: { done: true } },
      dashboard: { id: "1", selectedTab: "1" },
      charts: {
        1: {
          filters: [1],
          dataSource: "test_table",
          dimensions: [
            {
              table: "test_table",
              type: "SMALLINT",
              value: "test_column",
              label: "test_column"
            }
          ],
          measures: []
        }
      },
      filterZones: {
        "test-filter-set-id": {
          id: "test-filter-set-id",
          selected: true
        }
      },
      omnifilters: [],
      crossLinks: [],
      chartEditor: { editId: 999 }
    }

    const store = mockStore(initialState)

    await store.dispatch(
      InteropActions.setFilterX(1, { filterName: "-test-omnifilter" })
    )
    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "UPDATE_DASHBOARD_SAVE_STATE",
      warnUnsaved: false
    })
    expect(actions[1]).toEqual({
      type: "SET_FILTER_CROSSFILTER",
      payload: {
        chartId: 1,
        appliesTo: "CROSSFILTER",
        name: "-test-omnifilter",
        enabled: true,
        dataSources: ["test_table"],
        filter: {
          dataExpression: "test_column",
          dataSource: "test_table",
          table: "test_table",
          dataType: "SMALLINT",
          dataTypeIsArray: undefined,
          extract: undefined,
          filterType: FILTER_TYPE_SIMPLE,
          operator: "=",
          value: 1
        },
        chartFilters: [...initialState.charts[1].filters],
        chartRangeFilter: [],
        mapZoomCenter: undefined,
        isRangeFilter: false,
        isOldFilter: true,
        areFiltersInverse: undefined,
        userGenerated: false
      }
    })
  })

  it("setFilterX on a chart to add inverse integer filter", async () => {
    const initialState = {
      dc: { initialRender: { done: true } },
      dashboard: { id: "1", selectedTab: "1" },
      charts: {
        1: {
          filters: [1],
          dataSource: "test_table",
          dimensions: [
            {
              table: "test_table",
              type: "SMALLINT",
              value: "test_column",
              label: "test_column"
            }
          ],
          measures: []
        }
      },
      filterZones: {
        "test-filter-set-id": {
          id: "test-filter-set-id",
          selected: true
        }
      },
      omnifilters: [],
      crossLinks: [],
      chartEditor: { editId: 999 }
    }

    const store = mockStore(initialState)

    await store.dispatch(
      InteropActions.setFilterX(1, {
        filterName: "-test-omnifilter",
        areFiltersInverse: true
      })
    )
    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "UPDATE_DASHBOARD_SAVE_STATE",
      warnUnsaved: false
    })
    expect(actions[1]).toEqual({
      type: "SET_FILTER_CROSSFILTER",
      payload: {
        chartId: 1,
        appliesTo: "CROSSFILTER",
        name: "-test-omnifilter",
        enabled: true,
        dataSources: ["test_table"],
        filter: {
          filterType: FILTER_TYPE_OR,
          filters: [
            {
              filterType: FILTER_TYPE_NOT,
              filter: {
                dataExpression: "test_column",
                dataSource: "test_table",
                table: "test_table",
                dataType: "SMALLINT",
                dataTypeIsArray: undefined,
                extract: undefined,
                filterType: FILTER_TYPE_SIMPLE,
                operator: "=",
                value: 1
              }
            },
            {
              filterType: FILTER_TYPE_ISNULL,
              dataExpression: "test_column",
              dataSource: "test_table",
              table: "test_table",
              dataType: "SMALLINT",
              dataTypeIsArray: undefined,
              extract: undefined
            }
          ]
        },
        chartFilters: [...initialState.charts[1].filters],
        chartRangeFilter: [],
        mapZoomCenter: undefined,
        isRangeFilter: false,
        isOldFilter: true,
        areFiltersInverse: true,
        userGenerated: false
      }
    })
  })

  it("setFilterX on a chart to add string filter", async () => {
    const initialState = {
      dc: { initialRender: { done: true } },
      dashboard: { id: "1", selectedTab: "1" },
      charts: {
        1: {
          filters: ["foo"],
          dataSource: "test_table",
          dimensions: [
            {
              table: "test_table",
              type: "SMALLINT",
              value: "test_column",
              label: "test_column"
            }
          ],
          measures: []
        }
      },
      filterZones: {
        "test-filter-set-id": {
          id: "test-filter-set-id",
          selected: true
        }
      },
      omnifilters: [],
      crossLinks: [],
      chartEditor: { editId: 999 }
    }

    const store = mockStore(initialState)

    await store.dispatch(
      InteropActions.setFilterX(1, { filterName: "-test-omnifilter" })
    )
    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "UPDATE_DASHBOARD_SAVE_STATE",
      warnUnsaved: false
    })
    expect(actions[1]).toEqual({
      type: "SET_FILTER_CROSSFILTER",
      payload: {
        chartId: 1,
        appliesTo: "CROSSFILTER",
        name: "-test-omnifilter",
        enabled: true,
        dataSources: ["test_table"],
        filter: {
          dataExpression: "test_column",
          dataSource: "test_table",
          table: "test_table",
          dataType: "SMALLINT",
          dataTypeIsArray: undefined,
          extract: undefined,
          filterType: FILTER_TYPE_SIMPLE,
          operator: "=",
          value: "foo"
        },
        chartFilters: [...initialState.charts[1].filters],
        chartRangeFilter: [],
        mapZoomCenter: undefined,
        isRangeFilter: false,
        isOldFilter: true,
        areFiltersInverse: undefined,
        userGenerated: false
      }
    })
  })

  it("setFilterX on a chart to add null filter", async () => {
    const initialState = {
      dc: { initialRender: { done: true } },
      dashboard: { id: "1", selectedTab: "1" },
      charts: {
        1: {
          filters: [null],
          dataSource: "test_table",
          dimensions: [
            {
              table: "test_table",
              type: "SMALLINT",
              value: "test_column",
              label: "test_column"
            }
          ],
          measures: []
        }
      },
      filterZones: {
        "test-filter-set-id": {
          id: "test-filter-set-id",
          selected: true
        }
      },
      omnifilters: [],
      crossLinks: [],
      chartEditor: { editId: 999 }
    }

    const store = mockStore(initialState)

    await store.dispatch(
      InteropActions.setFilterX(1, { filterName: "-test-omnifilter" })
    )
    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "UPDATE_DASHBOARD_SAVE_STATE",
      warnUnsaved: false
    })
    expect(actions[1]).toEqual({
      type: "SET_FILTER_CROSSFILTER",
      payload: {
        chartId: 1,
        appliesTo: "CROSSFILTER",
        name: "-test-omnifilter",
        enabled: true,
        dataSources: ["test_table"],
        filter: {
          dataExpression: "test_column",
          dataSource: "test_table",
          table: "test_table",
          dataType: "SMALLINT",
          dataTypeIsArray: undefined,
          filterType: FILTER_TYPE_ISNULL,
          label: "test_column is null"
        },
        chartFilters: [...initialState.charts[1].filters],
        chartRangeFilter: [],
        mapZoomCenter: undefined,
        isRangeFilter: false,
        isOldFilter: true,
        areFiltersInverse: undefined,
        userGenerated: false
      }
    })
  })

  it("setFilterX on a chart to delete a filter", async () => {
    const initialState = {
      dc: { initialRender: { done: true } },
      dashboard: { id: "1", selectedTab: "1" },
      charts: {
        1: {
          filters: [],
          dataSource: "test_table",
          dimensions: [
            {
              table: "test_table",
              type: "SMALLINT",
              value: "test_column",
              label: "test_column"
            }
          ],
          measures: []
        }
      },
      filterZones: {
        "test-filter-set-id": {
          id: "test-filter-set-id",
          selected: true,
          filters: ["-test-omnifilter"]
        }
      },
      omnifilters: [
        {
          chartId: 1,
          name: "-test-omnifilter"
        }
      ],
      crossLinks: [],
      chartEditor: { editId: 999 }
    }

    const store = mockStore(initialState)

    await store.dispatch(
      InteropActions.setFilterX(1, { filterName: "-test-omnifilter" })
    )
    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "DELETE_FILTER_CROSSFILTER",
      payload: {
        chartId: 1,
        name: "-test-omnifilter"
      }
    })
  })

  it("setFilterX should discard Point filters", async () => {
    const initialState = {
      dc: { initialRender: { done: true } },
      dashboard: { id: "1", selectedTab: "1" },
      charts: {
        1: {
          filters: [{ type: "Point" }],
          dataSource: "test_table",
          dimensions: [
            {
              table: "test_table",
              type: "SMALLINT",
              value: "test_column",
              label: "test_column"
            }
          ],
          measures: []
        }
      },
      filterZones: {
        "test-filter-set-id": {
          id: "test-filter-set-id",
          selected: true,
          filters: ["-test-omnifilter"]
        }
      },
      omnifilters: [],
      crossLinks: [],
      chartEditor: { editId: 999 }
    }

    const store = mockStore(initialState)

    await store.dispatch(
      InteropActions.setFilterX(1, { filterName: "-test-omnifilter" })
    )
    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "DELETE_FILTER_CROSSFILTER",
      payload: {
        chartId: 1,
        name: "-test-omnifilter"
      }
    })
  })

  it("setFilterX should discard PolyLine filters", async () => {
    const initialState = {
      dc: { initialRender: { done: true } },
      dashboard: { id: "1", selectedTab: "1" },
      charts: {
        1: {
          filters: [{ type: "PolyLine" }],
          dataSource: "test_table",
          dimensions: [
            {
              table: "test_table",
              type: "SMALLINT",
              value: "test_column",
              label: "test_column"
            }
          ],
          measures: []
        }
      },
      filterZones: {
        "test-filter-set-id": {
          id: "test-filter-set-id",
          selected: true,
          filters: ["-test-omnifilter"]
        }
      },
      omnifilters: [],
      crossLinks: [],
      chartEditor: { editId: 999 }
    }

    const store = mockStore(initialState)

    await store.dispatch(
      InteropActions.setFilterX(1, { filterName: "-test-omnifilter" })
    )
    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "DELETE_FILTER_CROSSFILTER",
      payload: {
        chartId: 1,
        name: "-test-omnifilter"
      }
    })
  })

  it("setFilterX on a chart to add LatLonCircle filter", async () => {
    const initialState = {
      dc: { initialRender: { done: true } },
      dashboard: { id: "1", selectedTab: "1" },
      charts: {
        1: {
          filters: [
            {
              type: "LatLonCircle",
              radius: 50,
              visible: true,
              zIndex: 1,
              fillColor: "rgba(34, 167, 240, 0.09803921568627451)",
              strokeColor: "rgba(34, 167, 240, 1)",
              strokeWidth: 1.5,
              lineJoin: "miter",
              lineCap: "butt",
              dashPattern: [],
              dashOffset: 0,
              position: [-25, 25],
              scale: [1, 1],
              rotation: 0,
              pivot: [1, 22806.5],
              table: "test_table"
            }
          ],
          dataSource: "test_table",
          layerId: "master",
          dimensions: [
            {
              table: "test_table",
              type: "SMALLINT",
              value: "test_column",
              label: "test_column"
            }
          ],
          layers: [
            {
              dataSource: "test_table",
              measures: [
                {
                  name: "x",
                  type: "FLOAT",
                  value: "lon",
                  table: "test_table"
                },
                {
                  name: "y",
                  type: "FLOAT",
                  value: "lat",
                  table: "test_table"
                }
              ]
            }
          ],
          measures: [
            [
              {
                name: "x",
                dataSource: "test_table",
                table: "test_table",
                type: "FLOAT",
                value: "lon"
              },
              {
                name: "y",
                dataSource: "test_table",
                table: "test_table",
                type: "FLOAT",
                value: "lat"
              }
            ]
          ]
        }
      },
      filterZones: {
        "test-filter-set-id": {
          id: "test-filter-set-id",
          selected: true
        }
      },
      omnifilters: [],
      crossLinks: [],
      chartEditor: { editId: 999 }
    }

    const store = mockStore(initialState)

    await store.dispatch(
      InteropActions.setFilterX(1, { filterName: "-test-omnifilter" })
    )
    const actions = store.getActions()

    expect(actions[0]).toEqual({
      type: "UPDATE_DASHBOARD_SAVE_STATE",
      warnUnsaved: false
    })
    expect(actions[1]).toEqual({
      type: "SET_FILTER_CROSSFILTER",
      payload: {
        chartId: 1,
        appliesTo: "CROSSFILTER",
        name: "-test-omnifilter",
        enabled: true,
        dataSources: ["test_table"],
        filter: {
          distanceInMeters: 50000,
          filterType: FILTER_TYPE_DISTANCE,
          isGeoJoin: false,
          latDataType: "FLOAT",
          latExpression: "lat",
          layerId: "master",
          lonDataType: "FLOAT",
          lonExpression: "lon",
          originalPosition: [-25, 25],
          point: [-0.000224579, 0.000224567],
          radius: 50,
          dataSource: "test_table",
          table: "test_table",
          dataExpression: undefined,
          distanceInKM: 50
        },
        chartFilters: initialState.charts[1].filters.map((f) => ({
          ...f,
          layerId: "master"
        })),
        chartRangeFilter: [],
        mapZoomCenter: undefined,
        isRangeFilter: false,
        isOldFilter: true,
        areFiltersInverse: undefined,
        userGenerated: false
      }
    })
  })
})
