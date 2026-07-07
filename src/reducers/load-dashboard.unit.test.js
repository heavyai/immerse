// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { assocPath } from "ramda"

import { LOAD_DASHBOARD_SUCCESS } from "constants/action-types"

import loadDashboard, {
  convertISODatesToRegularDates,
  replaceValuesIfDateFilter,
  replaceValuesIfTimeStamp,
  convertDateStringsToDateObjects,
  normalizeAppState,
  normalizeDCState,
  maybeAddRangeFilter,
  showNullDimensions,
  checkForCustomBasemap
} from "./load-dashboard-higher-order-reducer"
import { initialState as initialUIState } from "reducers/ui-reducer"

import {
  DEFAULT_BASEMAP,
  MINIMALIST_BASEMAP_VALUE,
  MINIMALIST_THEME_LABEL
} from "constants/charts"
import {
  currentBasemapValue,
  initializeBasemapsForTests
} from "charts/raster-chart/basemap"

import { initialState as initialDCState } from "reducers/dc-reducer"

describe("Load Dashboard Reducer", () => {
  let initialState = {}
  let loadDashboardReducer = {}
  let reducer = {}

  beforeEach(() => {
    const sortColumn = null

    initialState = {
      annotations: {
        annotations: {},
        enabled: true
      },
      charts: {
        "0": {
          dimensions: [{ type: "INT" }],
          measures: [],
          filters: [],
          dcFlag: 0
        },
        "1": {
          dimensions: [{ type: "INT" }],
          filters: [],
          sortColumn: "val",
          ordering: "asc",
          color: { type: "ordinal" },
          measures: [],
          dcFlag: 1
        },
        "2": {
          dimensions: [{ type: "INT" }],
          filters: [],
          sortColumn,
          color: { type: "ordinal" },
          savedColors: { solid: { type: "solid" } },
          measures: [],
          dcFlag: 2
        },
        "3": {
          dimensions: [{ type: "INT" }],
          measures: [],
          filters: [],
          sortColumn,
          dcFlag: 3
        },
        "4": {
          type: "pointmap",
          mapZoomCenter: {},
          sortColumn,
          measures: [
            {
              isError: false,
              isRequired: false,
              inactive: false,
              name: "x",
              table: "taxi_weather_tracts_factual",
              type: "FLOAT",
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "dropoff_longitude",
              value: "dropoff_longitude",
              colorType: "quantitative",
              minMax: [-95.430908203125, 0.03898299857974052],
              aggType: "Avg",
              custom: false,
              originIndex: 0
            },
            {
              inactive: false,
              name: "y",
              isError: false,
              isRequired: false,
              table: "taxi_weather_tracts_factual",
              type: "FLOAT",
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "dropoff_latitude",
              value: "dropoff_latitude",
              colorType: "quantitative",
              minMax: [-0.04947699978947639, 48.66306686401367],
              aggType: "Avg",
              custom: false,
              originIndex: 1
            },
            {
              inactive: false,
              name: "color",
              isError: false,
              isRequired: false,
              table: "taxi_weather_tracts_factual",
              type: "STR",
              is_array: false,
              is_dict: true,
              name_is_ambiguous: false,
              label: "dropoff_boroname",
              value: "dropoff_boroname",
              colorType: "ordinal",
              categories: [
                "Default",
                "Manhattan",
                "Queens",
                "Brooklyn",
                "Bronx",
                "Staten Island"
              ],
              aggType: "# Unique",
              custom: false,
              originIndex: 3
            }
          ],
          dcFlag: 4
        },
        "5": {
          sortColumn,
          loading: false
        }
      },
      connection: {
        user: {
          mapboxCustomStyles: []
        }
      },
      dashboard: {
        table: "tweets",
        chartContainers: [{}],
        dashData: "data",
        selectedTabId: undefined,
        tabs: undefined,
        loadState: {
          request: false,
          error: false
        }
      },
      ui: { uiData: "data" },
      filters: [123],
      dc: {
        initialRender: {
          pending: true
        }
      }
    }
    reducer = jest.fn((state) => state)
    loadDashboardReducer = loadDashboard(reducer)
  })

  it("should load the correct newState", () => {
    const state = loadDashboardReducer(initialState, {
      type: LOAD_DASHBOARD_SUCCESS,
      dashboardState: initialState
    })
    const normalizedState = normalizeAppState(initialState)
    expect(state).toEqual(
      Object.assign({}, normalizedState, {
        dashboard: {
          ...normalizedState.dashboard,
          id: undefined,
          owner: undefined,
          raw: initialState
        },
        dc: normalizeDCState(
          initialState.dashboard,
          initialState.dc,
          initialState.charts
        )(initialDCState),
        ui: initialUIState
      })
    )
  })

  it("should load the state and set loadState request and error to false", () => {
    const newInitialState = assocPath(["dashboard", "loadState"], {
      request: true,
      error: false
    })(initialState)
    const state = loadDashboardReducer(initialState, {
      type: LOAD_DASHBOARD_SUCCESS,
      dashboardState: newInitialState
    })
    const normalizedState = normalizeAppState(initialState)
    expect(state).toEqual(
      Object.assign({}, normalizedState, {
        omnifilters: [],
        dashboard: {
          ...normalizedState.dashboard,
          raw: newInitialState,
          id: undefined,
          owner: undefined
        },
        dc: normalizeDCState(
          initialState.dashboard,
          initialState.dc,
          initialState.charts
        )(initialDCState),
        ui: initialUIState
      })
    )
  })

  it("should remove chart with id 0", () => {
    expect(initialState.charts.hasOwnProperty("0")).toEqual(true)
    const state = loadDashboardReducer(initialState, {
      type: LOAD_DASHBOARD_SUCCESS,
      dashboardState: initialState
    })
    expect(state.charts.hasOwnProperty("0")).toEqual(false)
  })

  it("should update charts to use object sortColumn", () => {
    expect(initialState.charts["1"].sortColumn).toEqual("val")
    expect(initialState.charts["1"].ordering).toEqual("asc")
    const state = loadDashboardReducer(initialState, {
      type: LOAD_DASHBOARD_SUCCESS,
      dashboardState: initialState
    })
    expect(state.charts["1"].sortColumn.col.name).toEqual("val")
    expect(state.charts["1"].sortColumn.order).toEqual("asc")
  })

  it("should not update sortColumn on unsorted/able charts", () => {
    expect(initialState.charts["2"].sortColumn).toEqual(null)
    const state = loadDashboardReducer(initialState, {
      type: LOAD_DASHBOARD_SUCCESS,
      dashboardState: initialState
    })
    expect(state.charts["2"].sortColumn).toEqual(null)
  })

  it("should remove ordering from charts", () => {
    expect(initialState.charts["1"].ordering).toEqual("asc")
    const state = loadDashboardReducer(initialState, {
      type: LOAD_DASHBOARD_SUCCESS,
      dashboardState: initialState
    })
    expect(state.charts["1"].ordering).toEqual(undefined)
  })

  it("should call the next reducer if action type does not match LOAD_DASHBOARD_SUCCESS", () => {
    loadDashboardReducer(
      { data: "data" },
      { type: "SOME_OTHER_ACTION", dashboardState: initialState }
    )
    expect(reducer).toHaveBeenCalled()
  })

  it("should migrate noncustom colors when no savedColors", () => {
    initialState.charts[1].color.type = "solid"
    expect(initialState.charts[1].color).toEqual({ type: "solid" })
    expect(initialState.charts[1].savedColors).toBeUndefined()
    const newState = loadDashboardReducer(initialState, {
      type: LOAD_DASHBOARD_SUCCESS,
      dashboardState: initialState
    })
    expect(newState.charts[1].savedColors).toEqual({
      solid: { type: "solid", column: null }
    })
  })

  it("should migrate custom colors when no savedColors", () => {
    initialState.charts[1].color = {
      type: "ordinal",
      customDomain: ["en", "es"]
    }
    initialState.charts[1].measures[3] = {
      name: "color",
      value: "lang",
      scaleType: "categorical",
      originIndex: 3
    }
    expect(initialState.charts[1].savedColors).toBeUndefined()
    const newState = loadDashboardReducer(initialState, {
      type: LOAD_DASHBOARD_SUCCESS,
      dashboardState: initialState
    })
    expect(newState.charts[1].savedColors).toEqual({
      custom_lang: {
        type: "ordinal",
        column: "lang",
        customDomain: ["en", "es"]
      }
    })
    expect(newState.charts[1].measures[3]).toEqual({
      name: "color",
      value: "lang",
      colorType: "ordinal",
      categories: ["en", "es"],
      scaleType: null,
      originIndex: 3
    })
  })

  it("set the mapZoomCenter bounds when there is none", () => {
    const newState = loadDashboardReducer(initialState, {
      type: LOAD_DASHBOARD_SUCCESS,
      dashboardState: initialState
    })
    expect(newState.charts[4].mapZoomCenter.bounds).toEqual({
      lonMin: -89.99999,
      lonMax: 0.03898299857974052,
      latMin: -0.04947699978947639,
      latMax: 48.66306686401367
    })
  })
})

describe("ConvertISODatesToRegularDates Util", () => {
  const date = "2016-06-06T18:40:39.426Z"
  const convertedDate = new Date("2016-06-06T18:40:39.426Z")

  it("should convert ISO Dates to Regular Dates", () => {
    const initialISOState = {
      dimensions: {
        0: {
          type: "TIMESTAMP",
          currentLowValue: date,
          currentHighValue: date,
          max_val: date,
          min_val: date
        }
      },
      filters: [date],
      rangeFilter: [date]
    }

    const newChartState = convertISODatesToRegularDates(initialISOState)
    expect(newChartState).toEqual({
      dimensions: {
        0: {
          type: "TIMESTAMP",
          currentLowValue: convertedDate,
          currentHighValue: convertedDate,
          max_val: convertedDate,
          min_val: convertedDate,
          initDomain: undefined,
          minMax: undefined
        }
      },
      filters: [convertedDate],
      rangeFilter: [convertedDate]
    })
  })

  it("should convert ISO Dates to Regular Dates on NESTED array filters", () => {
    const initialISOState = {
      dimensions: {
        0: {
          type: "TIMESTAMP",
          currentLowValue: date,
          currentHighValue: date,
          max_val: date,
          min_val: date
        }
      },
      filters: [[date, date]],
      rangeFilter: [[date, date]]
    }

    const newChartState = convertISODatesToRegularDates(initialISOState)
    expect(newChartState).toEqual({
      dimensions: {
        0: {
          type: "TIMESTAMP",
          currentLowValue: convertedDate,
          currentHighValue: convertedDate,
          max_val: convertedDate,
          min_val: convertedDate,
          initDomain: undefined,
          minMax: undefined
        }
      },
      filters: [[convertedDate, convertedDate]],
      rangeFilter: [[convertedDate, convertedDate]]
    })
  })
})

describe("replaceValuesIfDateFilter", () => {
  it("should not convert range filters with a 0 to a date", () => {
    expect(replaceValuesIfDateFilter([0, 10])).toEqual([0, 10])
  })
  it("should convert stringified dates to numbers", () => {
    const dateString = "2016-07-01T19:34:50.198Z"
    expect(replaceValuesIfDateFilter([dateString, dateString])).toEqual([
      new Date(dateString),
      new Date(dateString)
    ])
  })
})

describe("replaceValuesIfTimeStamp", () => {
  const dimension = {
    isError: false,
    isRequired: false,
    inactive: false,
    name: "X Axis",
    is_dict: false,
    label: "contrib_date",
    value: "contrib_date",
    min_val: "1989-01-01T00:00:00.000Z",
    max_val: "2015-10-15T00:00:00.000Z",
    currentLowValue: "1989-01-01T00:00:00.000Z",
    currentHighValue: "2015-10-15T00:00:00.000Z",
    isBinned: true,
    isBinnable: true,
    numOfBins: 400,
    autobin: true,
    maxBinSize: 250
  }
  it("should replace values if timestamp", () => {
    dimension.type = "TIMESTAMP"
    expect(replaceValuesIfTimeStamp(dimension)).toEqual(
      convertDateStringsToDateObjects(dimension)
    )
    expect(
      replaceValuesIfTimeStamp(dimension).currentLowValue instanceof Date
    ).toEqual(true)
    expect(
      replaceValuesIfTimeStamp(dimension).currentHighValue instanceof Date
    ).toEqual(true)
    expect(replaceValuesIfTimeStamp(dimension).min_val instanceof Date).toEqual(
      true
    )
    expect(replaceValuesIfTimeStamp(dimension).max_val instanceof Date).toEqual(
      true
    )
  })

  it("should replace values if date", () => {
    dimension.type = "DATE"
    expect(replaceValuesIfTimeStamp(dimension)).toEqual(
      convertDateStringsToDateObjects(dimension)
    )
    expect(
      replaceValuesIfTimeStamp(dimension).currentLowValue instanceof Date
    ).toEqual(true)
    expect(
      replaceValuesIfTimeStamp(dimension).currentHighValue instanceof Date
    ).toEqual(true)
    expect(replaceValuesIfTimeStamp(dimension).min_val instanceof Date).toEqual(
      true
    )
    expect(replaceValuesIfTimeStamp(dimension).max_val instanceof Date).toEqual(
      true
    )
  })

  it("should just return value if not timestamp or date", () => {
    dimension.type = "STRING"
    expect(replaceValuesIfTimeStamp(dimension)).toEqual(dimension)
  })
})

describe("maybeAddRangeFilter", () => {
  const badChartState = {
    dimensions: [],
    measures: []
  }
  const goodChartState = Object.assign(badChartState, { rangeFilter: [] })

  it("should not add rangeFilter if chart state has rangeFilter property", () => {
    expect(maybeAddRangeFilter(goodChartState)).toEqual(goodChartState)
  })

  it("should add rangeFilter property if chart state DOES NOT have rangeFilter property", () => {
    expect(maybeAddRangeFilter(badChartState)).toEqual(goodChartState)
  })
})

describe("showNullDimensions", () => {
  const badChartState = {
    dimensions: [],
    measures: []
  }
  const goodChartState = Object.assign(badChartState, {
    showNullDimensions: false
  })

  it("should not add rangeFilter if chart state has rangeFilter property", () => {
    expect(showNullDimensions(goodChartState)).toEqual(goodChartState)
  })

  it("should add rangeFilter property if chart state DOES NOT have rangeFilter property", () => {
    expect(showNullDimensions(badChartState)).toEqual(goodChartState)
  })
})

describe("checkForCustomBasemap", () => {
  let charts = {}
  beforeEach(() => {
    charts = {
      "1": {
        basemap: {
          label: "custom",
          value: "fake/url/to/mapbox-style-spec.json"
        }
      },
      "2": {
        basemap: {
          label: "custom",
          value: "fake/url/to/mapbox-style-spec.json"
        }
      }
    }
  })
  const customStyles = [
    { label: "custom", value: "fake/url/to/mapbox-style-spec.json" }
  ]

  it(`should replace chart.basemap with the default map style if chart.basemap is a
    custom style and that custom style does not exist on app load`, () => {
    initializeBasemapsForTests()
    expect(checkForCustomBasemap(charts)).toEqual({
      "1": { basemap: DEFAULT_BASEMAP },
      "2": { basemap: DEFAULT_BASEMAP }
    })
  })

  it(`should NOT replace chart.basemap with the default map style if chart.basemap
    is a custom style and that custom style DOES exist on app load`, () => {
    initializeBasemapsForTests(customStyles)
    expect(checkForCustomBasemap(charts)).toEqual({
      "1": {
        basemap: {
          label: "custom",
          value: "fake/url/to/mapbox-style-spec.json"
        }
      },
      "2": {
        basemap: {
          label: "custom",
          value: "fake/url/to/mapbox-style-spec.json"
        }
      }
    })
  })

  it("should normalize legacy minimalist basemap objects when basemaps are offline-only", () => {
    initializeBasemapsForTests([], null, [
      { label: MINIMALIST_THEME_LABEL, value: MINIMALIST_BASEMAP_VALUE }
    ])

    const minimalThemeCharts = {
      "1": {
        basemap: {
          label: MINIMALIST_THEME_LABEL,
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

    expect(checkForCustomBasemap(minimalThemeCharts)).toEqual({
      "1": {
        basemap: {
          label: MINIMALIST_THEME_LABEL,
          value: MINIMALIST_BASEMAP_VALUE
        }
      }
    })
  })

  it("should resolve minimalist sentinel to a map style object", () => {
    initializeBasemapsForTests([], null, [
      { label: MINIMALIST_THEME_LABEL, value: MINIMALIST_BASEMAP_VALUE }
    ])

    const value = currentBasemapValue({
      basemap: {
        label: MINIMALIST_THEME_LABEL,
        value: MINIMALIST_BASEMAP_VALUE
      }
    })

    expect(typeof value).toEqual("object")
    expect(value.sources.countries.type).toEqual("geojson")
    expect(value.layers[0].id).toEqual("countries")
  })
})
