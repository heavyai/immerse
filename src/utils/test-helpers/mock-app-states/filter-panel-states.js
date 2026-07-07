// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_OR,
  FILTER_TYPE_SQL
} from "vega/constants/filter-type-constants"

// Dashboard with one chart and one dashboard filter in one filter zone
export const mock_state_1 = {
  charts: {
    "1": {
      autoSize: true,
      areFiltersInverse: false,
      cap: 12,
      renderArea: false,
      color: {
        type: "none"
      },
      colorDomain: null,
      dataSelections: [
        {
          table: null,
          dimensions: {
            xAxis: null,
            color: null
          },
          measures: {
            size: null,
            color: null
          }
        }
      ],
      selectedLayerId: 0,
      dcFlag: 1,
      densityAccumulatorEnabled: true,
      dimensions: [
        {
          inactive: false,
          name: null,
          isRequired: false,
          isError: false,
          table: "flights",
          type: "TIMESTAMP",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "arr_timestamp",
          value: "arr_timestamp",
          custom: false,
          axisLabel: null,
          loading: false,
          timeBin: "auto",
          min_val: "2008-01-01T00:57:00.000Z",
          max_val: "2009-01-01T18:27:00.000Z",
          currentLowValue: "2008-01-01T00:57:00.000Z",
          currentHighValue: "2009-01-01T18:27:00.000Z",
          cardinality: 455902,
          isBinned: true,
          isBinnable: true,
          autobin: true,
          maxBinSize: 250,
          numOfBins: 1000
        },
        {
          isRequired: false,
          isError: false
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: true,
      measures: [
        {
          inactive: false,
          name: "col0",
          isRequired: false,
          isError: false,
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          custom: false,
          axisLabel: null,
          minMax: null,
          categories: null,
          colorType: "quantitative",
          aggType: "Count",
          originIndex: 0
        },
        {
          isRequired: false,
          isError: false
        }
      ],
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {},
      sortColumn: null,
      ticks: 3,
      title: "",
      type: "table",
      showOther: false,
      showNullDimensions: true,
      markTypes: [],
      multiSources: {},
      legendCollapsed: false,
      hasError: false,
      dataSource: "flights",
      hoverSelectedColumns: []
    },
    flights: {
      dcFlag: 2,
      loading: false,
      color: {
        defaultOtherDomain: "Default"
      }
    }
  },
  omnifilters: [
    {
      appliesTo: "GLOBAL",
      name: "-LrH-8WEgmrSzezSWdCA",
      enabled: true,
      dataSources: ["flights"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: "flight_month",
        dataSource: "flights",
        dataType: "SMALLINT",
        operator: "=",
        value: "12"
      }
    }
  ],
  dashboard: {
    id: null,
    title: null,
    columnMetadata: null,
    chartContainers: [
      {
        id: "1"
      }
    ],
    table: null,
    filtersId: [],
    layout: [
      {
        w: 10,
        h: 10,
        x: 0,
        y: 0,
        i: "1",
        moved: false,
        static: false
      }
    ],
    currentDataSource: "flights",
    dataSources: {
      flights: {
        alias: "A",
        columnMetadata: [
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_year",
            value: "flight_year"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_month",
            value: "flight_month"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofmonth",
            value: "flight_dayofmonth"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofweek",
            value: "flight_dayofweek"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "deptime",
            value: "deptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsdeptime",
            value: "crsdeptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrtime",
            value: "arrtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsarrtime",
            value: "crsarrtime"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "uniquecarrier",
            value: "uniquecarrier"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flightnum",
            value: "flightnum"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "tailnum",
            value: "tailnum"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "actualelapsedtime",
            value: "actualelapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crselapsedtime",
            value: "crselapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "airtime",
            value: "airtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrdelay",
            value: "arrdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "depdelay",
            value: "depdelay"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin",
            value: "origin"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest",
            value: "dest"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "distance",
            value: "distance"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiin",
            value: "taxiin"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiout",
            value: "taxiout"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "cancelled",
            value: "cancelled"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "cancellationcode",
            value: "cancellationcode"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "diverted",
            value: "diverted"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "carrierdelay",
            value: "carrierdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "weatherdelay",
            value: "weatherdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "nasdelay",
            value: "nasdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "securitydelay",
            value: "securitydelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lateaircraftdelay",
            value: "lateaircraftdelay"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dep_timestamp",
            value: "dep_timestamp"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arr_timestamp",
            value: "arr_timestamp"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "carrier_name",
            value: "carrier_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_type",
            value: "plane_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_manufacturer",
            value: "plane_manufacturer"
          },
          {
            table: "flights",
            type: "DATE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_issue_date",
            value: "plane_issue_date"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_model",
            value: "plane_model"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_status",
            value: "plane_status"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_aircraft_type",
            value: "plane_aircraft_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_engine_type",
            value: "plane_engine_type"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_year",
            value: "plane_year"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_name",
            value: "origin_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_city",
            value: "origin_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_state",
            value: "origin_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_country",
            value: "origin_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lat",
            value: "origin_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lon",
            value: "origin_lon"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_name",
            value: "dest_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_city",
            value: "dest_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_state",
            value: "dest_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_country",
            value: "dest_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lat",
            value: "dest_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lon",
            value: "dest_lon"
          }
        ]
      }
    },
    privileges: {},
    saveLinkState: {
      error: false,
      request: false,
      saveLinkId: null
    },
    loadState: {
      error: false,
      dataAccessError: false,
      complete: true,
      request: false,
      loadLinkId: null
    },
    saveState: {
      error: false,
      request: false,
      lastState: null,
      isLink: false,
      isSaved: false
    },
    copyState: {
      error: false,
      request: false
    },
    streaming: {
      interval: 0,
      request: false
    }
  },
  filters: [],
  filterZones: {
    "-LrH-3fWoqRQv5Lgsa3Y": {
      id: "-LrH-3fWoqRQv5Lgsa3Y",
      name: "Default Filter Set",
      filters: ["-LrH-8WEgmrSzezSWdCA"],
      selected: true,
      dimensions: {}
    }
  }
}

// Dashboard with one chart and one dashboard filter, but an additional datasource
// in the store.dashboard.datasources
export const mock_state_2 = {
  charts: {
    "1": {
      autoSize: true,
      areFiltersInverse: false,
      cap: 12,
      renderArea: false,
      color: {
        type: "none"
      },
      colorDomain: null,
      dataSelections: [
        {
          table: null,
          dimensions: {
            xAxis: null,
            color: null
          },
          measures: {
            size: null,
            color: null
          }
        }
      ],
      selectedLayerId: 0,
      dcFlag: 1,
      densityAccumulatorEnabled: true,
      dimensions: [
        {
          inactive: false,
          name: null,
          isRequired: false,
          isError: false,
          table: "flights",
          type: "TIMESTAMP",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "arr_timestamp",
          value: "arr_timestamp",
          custom: false,
          axisLabel: null,
          loading: false,
          timeBin: "auto",
          min_val: "2008-01-01T00:57:00.000Z",
          max_val: "2009-01-01T18:27:00.000Z",
          currentLowValue: "2008-01-01T00:57:00.000Z",
          currentHighValue: "2009-01-01T18:27:00.000Z",
          cardinality: 455902,
          isBinned: true,
          isBinnable: true,
          autobin: true,
          maxBinSize: 250,
          numOfBins: 1000
        },
        {
          isRequired: false,
          isError: false
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: true,
      measures: [
        {
          inactive: false,
          name: "col0",
          isRequired: false,
          isError: false,
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          custom: false,
          axisLabel: null,
          minMax: null,
          categories: null,
          colorType: "quantitative",
          aggType: "Count",
          originIndex: 0
        },
        {
          isRequired: false,
          isError: false
        }
      ],
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {},
      sortColumn: null,
      ticks: 3,
      title: "",
      type: "table",
      showOther: false,
      showNullDimensions: true,
      markTypes: [],
      multiSources: {},
      legendCollapsed: false,
      hasError: false,
      dataSource: "flights",
      hoverSelectedColumns: []
    },
    flights: {
      dcFlag: 2,
      loading: false,
      color: {
        defaultOtherDomain: "Default"
      }
    }
  },
  omnifilters: [
    {
      appliesTo: "GLOBAL",
      name: "-LrH-8WEgmrSzezSWdCA",
      enabled: true,
      dataSources: ["flights"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: "flight_month",
        dataSource: "flights",
        dataType: "SMALLINT",
        operator: "=",
        value: "12"
      }
    }
  ],
  dashboard: {
    id: null,
    title: null,
    columnMetadata: null,
    chartContainers: [
      {
        id: "1"
      }
    ],
    table: null,
    filtersId: [],
    layout: [
      {
        w: 10,
        h: 10,
        x: 0,
        y: 0,
        i: "1",
        moved: false,
        static: false
      }
    ],
    currentDataSource: "flights",
    dataSources: {
      flights: {
        alias: "A",
        columnMetadata: [
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_year",
            value: "flight_year"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_month",
            value: "flight_month"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofmonth",
            value: "flight_dayofmonth"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofweek",
            value: "flight_dayofweek"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "deptime",
            value: "deptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsdeptime",
            value: "crsdeptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrtime",
            value: "arrtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsarrtime",
            value: "crsarrtime"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "uniquecarrier",
            value: "uniquecarrier"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flightnum",
            value: "flightnum"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "tailnum",
            value: "tailnum"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "actualelapsedtime",
            value: "actualelapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crselapsedtime",
            value: "crselapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "airtime",
            value: "airtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrdelay",
            value: "arrdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "depdelay",
            value: "depdelay"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin",
            value: "origin"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest",
            value: "dest"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "distance",
            value: "distance"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiin",
            value: "taxiin"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiout",
            value: "taxiout"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "cancelled",
            value: "cancelled"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "cancellationcode",
            value: "cancellationcode"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "diverted",
            value: "diverted"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "carrierdelay",
            value: "carrierdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "weatherdelay",
            value: "weatherdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "nasdelay",
            value: "nasdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "securitydelay",
            value: "securitydelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lateaircraftdelay",
            value: "lateaircraftdelay"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dep_timestamp",
            value: "dep_timestamp"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arr_timestamp",
            value: "arr_timestamp"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "carrier_name",
            value: "carrier_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_type",
            value: "plane_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_manufacturer",
            value: "plane_manufacturer"
          },
          {
            table: "flights",
            type: "DATE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_issue_date",
            value: "plane_issue_date"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_model",
            value: "plane_model"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_status",
            value: "plane_status"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_aircraft_type",
            value: "plane_aircraft_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_engine_type",
            value: "plane_engine_type"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_year",
            value: "plane_year"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_name",
            value: "origin_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_city",
            value: "origin_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_state",
            value: "origin_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_country",
            value: "origin_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lat",
            value: "origin_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lon",
            value: "origin_lon"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_name",
            value: "dest_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_city",
            value: "dest_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_state",
            value: "dest_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_country",
            value: "dest_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lat",
            value: "dest_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lon",
            value: "dest_lon"
          }
        ]
      },
      airplanes: {
        alias: "B",
        columnMetadata: [
          {
            table: "airplanes",
            column: "Alt",
            label: "Alt",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Alt"
          },
          {
            table: "airplanes",
            column: "AltT",
            label: "AltT",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "AltT"
          },
          {
            table: "airplanes",
            column: "Bad",
            label: "Bad",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Bad"
          },
          {
            table: "airplanes",
            column: "CMsgs",
            label: "CMsgs",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "CMsgs"
          },
          {
            table: "airplanes",
            column: "CNum",
            label: "CNum",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "CNum"
          },
          {
            table: "airplanes",
            column: "CallSign",
            label: "CallSign",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "CallSign"
          },
          {
            table: "airplanes",
            column: "CallSus",
            label: "CallSus",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "CallSus"
          },
          {
            table: "airplanes",
            column: "Cou",
            label: "Cou",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Cou"
          },
          {
            table: "airplanes",
            column: "EngMount",
            label: "EngMount",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "EngMount"
          },
          {
            table: "airplanes",
            column: "EngType",
            label: "EngType",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "EngType"
          },
          {
            table: "airplanes",
            column: "Engines",
            label: "Engines",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Engines"
          },
          {
            table: "airplanes",
            column: "FSeen",
            label: "FSeen",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "FSeen"
          },
          {
            table: "airplanes",
            column: "FlightsCount",
            label: "FlightsCount",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "FlightsCount"
          },
          {
            table: "airplanes",
            column: "FromCity",
            label: "FromCity",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "FromCity"
          },
          {
            table: "airplanes",
            column: "Gnd",
            label: "Gnd",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Gnd"
          },
          {
            table: "airplanes",
            column: "HasPic",
            label: "HasPic",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "HasPic"
          },
          {
            table: "airplanes",
            column: "HasSig",
            label: "HasSig",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "HasSig"
          },
          {
            table: "airplanes",
            column: "Help",
            label: "Help",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Help"
          },
          {
            table: "airplanes",
            column: "Icao",
            label: "Icao",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Icao"
          },
          {
            table: "airplanes",
            column: "ID",
            label: "ID",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "ID"
          },
          {
            table: "airplanes",
            column: "Interested",
            label: "Interested",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Interested"
          },
          {
            table: "airplanes",
            column: "Lat",
            label: "Lat",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Lat"
          },
          {
            table: "airplanes",
            column: "Lon",
            label: "Lon",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Lon"
          },
          {
            table: "airplanes",
            column: "Man",
            label: "Man",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Man"
          },
          {
            table: "airplanes",
            column: "Mdl",
            label: "Mdl",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Mdl"
          },
          {
            table: "airplanes",
            column: "Mil",
            label: "Mil",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Mil"
          },
          {
            table: "airplanes",
            column: "Mlat",
            label: "Mlat",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Mlat"
          },
          {
            table: "airplanes",
            column: "Op",
            label: "Op",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Op"
          },
          {
            table: "airplanes",
            column: "OpIcao",
            label: "OpIcao",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "OpIcao"
          },
          {
            table: "airplanes",
            column: "PosTime",
            label: "PosTime",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "PosTime"
          },
          {
            table: "airplanes",
            column: "Rcvr",
            label: "Rcvr",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Rcvr"
          },
          {
            table: "airplanes",
            column: "Reg",
            label: "Reg",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Reg"
          },
          {
            table: "airplanes",
            column: "Spd",
            label: "Spd",
            type: "DECIMAL",
            precision: 12,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Spd"
          },
          {
            table: "airplanes",
            column: "SpdTyp",
            label: "SpdTyp",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "SpdTyp"
          },
          {
            table: "airplanes",
            column: "Species",
            label: "Species",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Species"
          },
          {
            table: "airplanes",
            column: "Sqk",
            label: "Sqk",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Sqk"
          },
          {
            table: "airplanes",
            column: "TSecs",
            label: "TSecs",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "TSecs"
          },
          {
            table: "airplanes",
            column: "Tisb",
            label: "Tisb",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Tisb"
          },
          {
            table: "airplanes",
            column: "ToCity",
            label: "ToCity",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "ToCity"
          },
          {
            table: "airplanes",
            column: "Trak",
            label: "Trak",
            type: "DECIMAL",
            precision: 12,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Trak"
          },
          {
            table: "airplanes",
            column: "TrkH",
            label: "TrkH",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "TrkH"
          },
          {
            table: "airplanes",
            column: "Trt",
            label: "Trt",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Trt"
          },
          {
            table: "airplanes",
            column: "TypePlane",
            label: "TypePlane",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "TypePlane"
          },
          {
            table: "airplanes",
            column: "Vsi",
            label: "Vsi",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Vsi"
          },
          {
            table: "airplanes",
            column: "VsiT",
            label: "VsiT",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "VsiT"
          },
          {
            table: "airplanes",
            column: "WTC",
            label: "WTC",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "WTC"
          },
          {
            table: "airplanes",
            column: "YearBuilt",
            label: "YearBuilt",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "YearBuilt"
          },
          {
            table: "airplanes",
            column: "OpName",
            label: "OpName",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "OpName"
          },
          {
            table: "airplanes",
            column: "OpCity",
            label: "OpCity",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "OpCity"
          },
          {
            table: "airplanes",
            column: "PosTimeDate",
            label: "PosTimeDate",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "PosTimeDate"
          },
          {
            table: "airplanes",
            column: "MercX",
            label: "MercX",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "MercX"
          },
          {
            table: "airplanes",
            column: "MercY",
            label: "MercY",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "MercY"
          }
        ]
      }
    },
    privileges: {},
    saveLinkState: {
      error: false,
      request: false,
      saveLinkId: null
    },
    loadState: {
      error: false,
      dataAccessError: false,
      complete: true,
      request: false,
      loadLinkId: null
    },
    saveState: {
      error: false,
      request: false,
      lastState: null,
      isLink: false,
      isSaved: false
    },
    copyState: {
      error: false,
      request: false
    },
    streaming: {
      interval: 0,
      request: false
    }
  },
  filters: [],
  filterZones: {
    "-LrH-3fWoqRQv5Lgsa3Y": {
      id: "-LrH-3fWoqRQv5Lgsa3Y",
      name: "Default Filter Set",
      filters: ["-LrH-8WEgmrSzezSWdCA"],
      selected: true,
      dimensions: {}
    }
  }
}

// Dashboard with one chart and dashboard filters from two different datasources
export const mock_state_3 = {
  charts: {
    "1": {
      autoSize: true,
      areFiltersInverse: false,
      cap: 12,
      renderArea: false,
      color: {
        type: "none"
      },
      colorDomain: null,
      dataSelections: [
        {
          table: null,
          dimensions: {
            xAxis: null,
            color: null
          },
          measures: {
            size: null,
            color: null
          }
        }
      ],
      selectedLayerId: 0,
      dcFlag: 1,
      densityAccumulatorEnabled: true,
      dimensions: [
        {
          inactive: false,
          name: null,
          isRequired: false,
          isError: false,
          table: "flights",
          type: "TIMESTAMP",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "arr_timestamp",
          value: "arr_timestamp",
          custom: false,
          axisLabel: null,
          loading: false,
          timeBin: "auto",
          min_val: "2008-01-01T00:57:00.000Z",
          max_val: "2009-01-01T18:27:00.000Z",
          currentLowValue: "2008-01-01T00:57:00.000Z",
          currentHighValue: "2009-01-01T18:27:00.000Z",
          cardinality: 455902,
          isBinned: true,
          isBinnable: true,
          autobin: true,
          maxBinSize: 250,
          numOfBins: 1000
        },
        {
          isRequired: false,
          isError: false
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: true,
      measures: [
        {
          inactive: false,
          name: "col0",
          isRequired: false,
          isError: false,
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          custom: false,
          axisLabel: null,
          minMax: null,
          categories: null,
          colorType: "quantitative",
          aggType: "Count",
          originIndex: 0
        },
        {
          isRequired: false,
          isError: false
        }
      ],
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {},
      sortColumn: null,
      ticks: 3,
      title: "",
      type: "table",
      showOther: false,
      showNullDimensions: true,
      markTypes: [],
      multiSources: {},
      legendCollapsed: false,
      hasError: false,
      dataSource: "flights",
      hoverSelectedColumns: []
    },
    flights: {
      dcFlag: 2,
      loading: false,
      color: {
        defaultOtherDomain: "Default"
      }
    }
  },
  omnifilters: [
    {
      appliesTo: "GLOBAL",
      name: "-LrH-8WEgmrSzezSWdCA",
      enabled: true,
      dataSources: ["flights"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: "flight_month",
        dataSource: "flights",
        dataType: "SMALLINT",
        operator: "=",
        value: "12"
      }
    },
    {
      appliesTo: "GLOBAL",
      name: "-LrH1sWIPjWnEJV2ZoZi",
      enabled: true,
      dataSources: ["airplanes"],
      filter: {
        filterType: FILTER_TYPE_OR,
        filters: [
          {
            filterType: FILTER_TYPE_SIMPLE,
            dataExpression: "Engines",
            dataSource: "airplanes",
            dataType: "STR",
            operator: "=",
            value: "2"
          },
          {
            filterType: FILTER_TYPE_SIMPLE,
            dataExpression: "Engines",
            dataSource: "airplanes",
            dataType: "STR",
            operator: "=",
            value: "1"
          }
        ]
      }
    }
  ],
  dashboard: {
    id: null,
    title: null,
    columnMetadata: null,
    chartContainers: [
      {
        id: "1"
      }
    ],
    table: null,
    filtersId: [],
    layout: [
      {
        w: 10,
        h: 10,
        x: 0,
        y: 0,
        i: "1",
        moved: false,
        static: false
      }
    ],
    currentDataSource: "flights",
    dataSources: {
      flights: {
        alias: "A",
        columnMetadata: [
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_year",
            value: "flight_year"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_month",
            value: "flight_month"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofmonth",
            value: "flight_dayofmonth"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofweek",
            value: "flight_dayofweek"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "deptime",
            value: "deptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsdeptime",
            value: "crsdeptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrtime",
            value: "arrtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsarrtime",
            value: "crsarrtime"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "uniquecarrier",
            value: "uniquecarrier"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flightnum",
            value: "flightnum"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "tailnum",
            value: "tailnum"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "actualelapsedtime",
            value: "actualelapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crselapsedtime",
            value: "crselapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "airtime",
            value: "airtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrdelay",
            value: "arrdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "depdelay",
            value: "depdelay"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin",
            value: "origin"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest",
            value: "dest"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "distance",
            value: "distance"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiin",
            value: "taxiin"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiout",
            value: "taxiout"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "cancelled",
            value: "cancelled"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "cancellationcode",
            value: "cancellationcode"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "diverted",
            value: "diverted"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "carrierdelay",
            value: "carrierdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "weatherdelay",
            value: "weatherdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "nasdelay",
            value: "nasdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "securitydelay",
            value: "securitydelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lateaircraftdelay",
            value: "lateaircraftdelay"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dep_timestamp",
            value: "dep_timestamp"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arr_timestamp",
            value: "arr_timestamp"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "carrier_name",
            value: "carrier_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_type",
            value: "plane_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_manufacturer",
            value: "plane_manufacturer"
          },
          {
            table: "flights",
            type: "DATE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_issue_date",
            value: "plane_issue_date"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_model",
            value: "plane_model"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_status",
            value: "plane_status"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_aircraft_type",
            value: "plane_aircraft_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_engine_type",
            value: "plane_engine_type"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_year",
            value: "plane_year"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_name",
            value: "origin_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_city",
            value: "origin_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_state",
            value: "origin_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_country",
            value: "origin_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lat",
            value: "origin_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lon",
            value: "origin_lon"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_name",
            value: "dest_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_city",
            value: "dest_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_state",
            value: "dest_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_country",
            value: "dest_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lat",
            value: "dest_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lon",
            value: "dest_lon"
          }
        ]
      },
      airplanes: {
        alias: "B",
        columnMetadata: [
          {
            table: "airplanes",
            column: "Alt",
            label: "Alt",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Alt"
          },
          {
            table: "airplanes",
            column: "AltT",
            label: "AltT",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "AltT"
          },
          {
            table: "airplanes",
            column: "Bad",
            label: "Bad",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Bad"
          },
          {
            table: "airplanes",
            column: "CMsgs",
            label: "CMsgs",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "CMsgs"
          },
          {
            table: "airplanes",
            column: "CNum",
            label: "CNum",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "CNum"
          },
          {
            table: "airplanes",
            column: "CallSign",
            label: "CallSign",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "CallSign"
          },
          {
            table: "airplanes",
            column: "CallSus",
            label: "CallSus",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "CallSus"
          },
          {
            table: "airplanes",
            column: "Cou",
            label: "Cou",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Cou"
          },
          {
            table: "airplanes",
            column: "EngMount",
            label: "EngMount",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "EngMount"
          },
          {
            table: "airplanes",
            column: "EngType",
            label: "EngType",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "EngType"
          },
          {
            table: "airplanes",
            column: "Engines",
            label: "Engines",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Engines"
          },
          {
            table: "airplanes",
            column: "FSeen",
            label: "FSeen",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "FSeen"
          },
          {
            table: "airplanes",
            column: "FlightsCount",
            label: "FlightsCount",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "FlightsCount"
          },
          {
            table: "airplanes",
            column: "FromCity",
            label: "FromCity",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "FromCity"
          },
          {
            table: "airplanes",
            column: "Gnd",
            label: "Gnd",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Gnd"
          },
          {
            table: "airplanes",
            column: "HasPic",
            label: "HasPic",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "HasPic"
          },
          {
            table: "airplanes",
            column: "HasSig",
            label: "HasSig",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "HasSig"
          },
          {
            table: "airplanes",
            column: "Help",
            label: "Help",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Help"
          },
          {
            table: "airplanes",
            column: "Icao",
            label: "Icao",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Icao"
          },
          {
            table: "airplanes",
            column: "ID",
            label: "ID",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "ID"
          },
          {
            table: "airplanes",
            column: "Interested",
            label: "Interested",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Interested"
          },
          {
            table: "airplanes",
            column: "Lat",
            label: "Lat",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Lat"
          },
          {
            table: "airplanes",
            column: "Lon",
            label: "Lon",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Lon"
          },
          {
            table: "airplanes",
            column: "Man",
            label: "Man",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Man"
          },
          {
            table: "airplanes",
            column: "Mdl",
            label: "Mdl",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Mdl"
          },
          {
            table: "airplanes",
            column: "Mil",
            label: "Mil",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Mil"
          },
          {
            table: "airplanes",
            column: "Mlat",
            label: "Mlat",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Mlat"
          },
          {
            table: "airplanes",
            column: "Op",
            label: "Op",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Op"
          },
          {
            table: "airplanes",
            column: "OpIcao",
            label: "OpIcao",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "OpIcao"
          },
          {
            table: "airplanes",
            column: "PosTime",
            label: "PosTime",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "PosTime"
          },
          {
            table: "airplanes",
            column: "Rcvr",
            label: "Rcvr",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Rcvr"
          },
          {
            table: "airplanes",
            column: "Reg",
            label: "Reg",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Reg"
          },
          {
            table: "airplanes",
            column: "Spd",
            label: "Spd",
            type: "DECIMAL",
            precision: 12,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Spd"
          },
          {
            table: "airplanes",
            column: "SpdTyp",
            label: "SpdTyp",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "SpdTyp"
          },
          {
            table: "airplanes",
            column: "Species",
            label: "Species",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Species"
          },
          {
            table: "airplanes",
            column: "Sqk",
            label: "Sqk",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Sqk"
          },
          {
            table: "airplanes",
            column: "TSecs",
            label: "TSecs",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "TSecs"
          },
          {
            table: "airplanes",
            column: "Tisb",
            label: "Tisb",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Tisb"
          },
          {
            table: "airplanes",
            column: "ToCity",
            label: "ToCity",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "ToCity"
          },
          {
            table: "airplanes",
            column: "Trak",
            label: "Trak",
            type: "DECIMAL",
            precision: 12,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Trak"
          },
          {
            table: "airplanes",
            column: "TrkH",
            label: "TrkH",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "TrkH"
          },
          {
            table: "airplanes",
            column: "Trt",
            label: "Trt",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Trt"
          },
          {
            table: "airplanes",
            column: "TypePlane",
            label: "TypePlane",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "TypePlane"
          },
          {
            table: "airplanes",
            column: "Vsi",
            label: "Vsi",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Vsi"
          },
          {
            table: "airplanes",
            column: "VsiT",
            label: "VsiT",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "VsiT"
          },
          {
            table: "airplanes",
            column: "WTC",
            label: "WTC",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "WTC"
          },
          {
            table: "airplanes",
            column: "YearBuilt",
            label: "YearBuilt",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "YearBuilt"
          },
          {
            table: "airplanes",
            column: "OpName",
            label: "OpName",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "OpName"
          },
          {
            table: "airplanes",
            column: "OpCity",
            label: "OpCity",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "OpCity"
          },
          {
            table: "airplanes",
            column: "PosTimeDate",
            label: "PosTimeDate",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "PosTimeDate"
          },
          {
            table: "airplanes",
            column: "MercX",
            label: "MercX",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "MercX"
          },
          {
            table: "airplanes",
            column: "MercY",
            label: "MercY",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "MercY"
          }
        ]
      }
    },
    privileges: {},
    saveLinkState: {
      error: false,
      request: false,
      saveLinkId: null
    },
    loadState: {
      error: false,
      dataAccessError: false,
      complete: true,
      request: false,
      loadLinkId: null
    },
    saveState: {
      error: false,
      request: false,
      lastState: null,
      isLink: false,
      isSaved: false
    },
    copyState: {
      error: false,
      request: false
    },
    streaming: {
      interval: 0,
      request: false
    }
  },
  filters: [],
  filterZones: {
    "-LrH-3fWoqRQv5Lgsa3Y": {
      id: "-LrH-3fWoqRQv5Lgsa3Y",
      name: "Default Filter Set",
      filters: ["-LrH-8WEgmrSzezSWdCA", "-LrH1sWIPjWnEJV2ZoZi"],
      selected: true,
      dimensions: {}
    }
  }
}

// Dashboard with two filter sets. Filter set 1 has two active sources (flights,
// airplanes) and filter set 2 has two active sources (flights, contributions)
export const mock_state_4 = {
  charts: {
    "1": {
      autoSize: true,
      areFiltersInverse: false,
      cap: 12,
      renderArea: false,
      color: {
        type: "none"
      },
      colorDomain: null,
      dataSelections: [
        {
          table: null,
          dimensions: {
            xAxis: null,
            color: null
          },
          measures: {
            size: null,
            color: null
          }
        }
      ],
      selectedLayerId: 0,
      dcFlag: 1,
      densityAccumulatorEnabled: true,
      dimensions: [
        {
          inactive: false,
          name: null,
          isRequired: false,
          isError: false,
          table: "flights",
          type: "TIMESTAMP",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "arr_timestamp",
          value: "arr_timestamp",
          custom: false,
          axisLabel: null,
          loading: false,
          timeBin: "auto",
          min_val: "2008-01-01T00:57:00.000Z",
          max_val: "2009-01-01T18:27:00.000Z",
          currentLowValue: "2008-01-01T00:57:00.000Z",
          currentHighValue: "2009-01-01T18:27:00.000Z",
          cardinality: 455902,
          isBinned: true,
          isBinnable: true,
          autobin: true,
          maxBinSize: 250,
          numOfBins: 1000
        },
        {
          isRequired: false,
          isError: false
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: true,
      measures: [
        {
          inactive: false,
          name: "col0",
          isRequired: false,
          isError: false,
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          custom: false,
          axisLabel: null,
          minMax: null,
          categories: null,
          colorType: "quantitative",
          aggType: "Count",
          originIndex: 0
        },
        {
          isRequired: false,
          isError: false
        }
      ],
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {},
      sortColumn: null,
      ticks: 3,
      title: "",
      type: "table",
      showOther: false,
      showNullDimensions: true,
      markTypes: [],
      multiSources: {},
      legendCollapsed: false,
      hasError: false,
      dataSource: "flights",
      hoverSelectedColumns: []
    },
    flights: {
      dcFlag: 7,
      loading: false,
      color: {
        defaultOtherDomain: "Default"
      }
    },
    contributions: {
      dcFlag: 6,
      loading: false,
      color: {
        defaultOtherDomain: "Default"
      }
    }
  },
  omnifilters: [
    {
      appliesTo: "GLOBAL",
      name: "-LrH-8WEgmrSzezSWdCA",
      enabled: false,
      dataSources: ["flights"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: "flight_month",
        dataSource: "flights",
        dataType: "SMALLINT",
        operator: "=",
        value: "12"
      }
    },
    {
      appliesTo: "GLOBAL",
      name: "-LrH1sWIPjWnEJV2ZoZi",
      enabled: false,
      dataSources: ["airplanes"],
      filter: {
        filterType: FILTER_TYPE_OR,
        filters: [
          {
            filterType: FILTER_TYPE_SIMPLE,
            dataExpression: "Engines",
            dataSource: "airplanes",
            dataType: "STR",
            operator: "=",
            value: "2"
          },
          {
            filterType: FILTER_TYPE_SIMPLE,
            dataExpression: "Engines",
            dataSource: "airplanes",
            dataType: "STR",
            operator: "=",
            value: "1"
          }
        ]
      }
    },
    {
      appliesTo: "GLOBAL",
      name: "-LrKDVNibG93aTtO3dX9",
      enabled: true,
      dataSources: ["contributions"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: "amount",
        dataSource: "contributions",
        dataType: "INT",
        operator: ">",
        value: "100"
      }
    }
  ],
  dashboard: {
    id: null,
    title: null,
    columnMetadata: null,
    chartContainers: [
      {
        id: "1"
      }
    ],
    table: null,
    filtersId: [],
    layout: [
      {
        w: 10,
        h: 10,
        x: 0,
        y: 0,
        i: "1",
        moved: false,
        static: false
      }
    ],
    currentDataSource: "flights",
    dataSources: {
      flights: {
        alias: "A",
        columnMetadata: [
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_year",
            value: "flight_year"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_month",
            value: "flight_month"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofmonth",
            value: "flight_dayofmonth"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofweek",
            value: "flight_dayofweek"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "deptime",
            value: "deptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsdeptime",
            value: "crsdeptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrtime",
            value: "arrtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsarrtime",
            value: "crsarrtime"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "uniquecarrier",
            value: "uniquecarrier"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flightnum",
            value: "flightnum"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "tailnum",
            value: "tailnum"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "actualelapsedtime",
            value: "actualelapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crselapsedtime",
            value: "crselapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "airtime",
            value: "airtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrdelay",
            value: "arrdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "depdelay",
            value: "depdelay"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin",
            value: "origin"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest",
            value: "dest"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "distance",
            value: "distance"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiin",
            value: "taxiin"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiout",
            value: "taxiout"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "cancelled",
            value: "cancelled"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "cancellationcode",
            value: "cancellationcode"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "diverted",
            value: "diverted"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "carrierdelay",
            value: "carrierdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "weatherdelay",
            value: "weatherdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "nasdelay",
            value: "nasdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "securitydelay",
            value: "securitydelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lateaircraftdelay",
            value: "lateaircraftdelay"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dep_timestamp",
            value: "dep_timestamp"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arr_timestamp",
            value: "arr_timestamp"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "carrier_name",
            value: "carrier_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_type",
            value: "plane_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_manufacturer",
            value: "plane_manufacturer"
          },
          {
            table: "flights",
            type: "DATE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_issue_date",
            value: "plane_issue_date"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_model",
            value: "plane_model"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_status",
            value: "plane_status"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_aircraft_type",
            value: "plane_aircraft_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_engine_type",
            value: "plane_engine_type"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_year",
            value: "plane_year"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_name",
            value: "origin_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_city",
            value: "origin_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_state",
            value: "origin_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_country",
            value: "origin_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lat",
            value: "origin_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lon",
            value: "origin_lon"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_name",
            value: "dest_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_city",
            value: "dest_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_state",
            value: "dest_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_country",
            value: "dest_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lat",
            value: "dest_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lon",
            value: "dest_lon"
          }
        ]
      },
      airplanes: {
        alias: "B",
        columnMetadata: [
          {
            table: "airplanes",
            column: "Alt",
            label: "Alt",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Alt"
          },
          {
            table: "airplanes",
            column: "AltT",
            label: "AltT",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "AltT"
          },
          {
            table: "airplanes",
            column: "Bad",
            label: "Bad",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Bad"
          },
          {
            table: "airplanes",
            column: "CMsgs",
            label: "CMsgs",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "CMsgs"
          },
          {
            table: "airplanes",
            column: "CNum",
            label: "CNum",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "CNum"
          },
          {
            table: "airplanes",
            column: "CallSign",
            label: "CallSign",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "CallSign"
          },
          {
            table: "airplanes",
            column: "CallSus",
            label: "CallSus",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "CallSus"
          },
          {
            table: "airplanes",
            column: "Cou",
            label: "Cou",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Cou"
          },
          {
            table: "airplanes",
            column: "EngMount",
            label: "EngMount",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "EngMount"
          },
          {
            table: "airplanes",
            column: "EngType",
            label: "EngType",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "EngType"
          },
          {
            table: "airplanes",
            column: "Engines",
            label: "Engines",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Engines"
          },
          {
            table: "airplanes",
            column: "FSeen",
            label: "FSeen",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "FSeen"
          },
          {
            table: "airplanes",
            column: "FlightsCount",
            label: "FlightsCount",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "FlightsCount"
          },
          {
            table: "airplanes",
            column: "FromCity",
            label: "FromCity",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "FromCity"
          },
          {
            table: "airplanes",
            column: "Gnd",
            label: "Gnd",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Gnd"
          },
          {
            table: "airplanes",
            column: "HasPic",
            label: "HasPic",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "HasPic"
          },
          {
            table: "airplanes",
            column: "HasSig",
            label: "HasSig",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "HasSig"
          },
          {
            table: "airplanes",
            column: "Help",
            label: "Help",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Help"
          },
          {
            table: "airplanes",
            column: "Icao",
            label: "Icao",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Icao"
          },
          {
            table: "airplanes",
            column: "ID",
            label: "ID",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "ID"
          },
          {
            table: "airplanes",
            column: "Interested",
            label: "Interested",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Interested"
          },
          {
            table: "airplanes",
            column: "Lat",
            label: "Lat",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Lat"
          },
          {
            table: "airplanes",
            column: "Lon",
            label: "Lon",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Lon"
          },
          {
            table: "airplanes",
            column: "Man",
            label: "Man",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Man"
          },
          {
            table: "airplanes",
            column: "Mdl",
            label: "Mdl",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Mdl"
          },
          {
            table: "airplanes",
            column: "Mil",
            label: "Mil",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Mil"
          },
          {
            table: "airplanes",
            column: "Mlat",
            label: "Mlat",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Mlat"
          },
          {
            table: "airplanes",
            column: "Op",
            label: "Op",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Op"
          },
          {
            table: "airplanes",
            column: "OpIcao",
            label: "OpIcao",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "OpIcao"
          },
          {
            table: "airplanes",
            column: "PosTime",
            label: "PosTime",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "PosTime"
          },
          {
            table: "airplanes",
            column: "Rcvr",
            label: "Rcvr",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Rcvr"
          },
          {
            table: "airplanes",
            column: "Reg",
            label: "Reg",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Reg"
          },
          {
            table: "airplanes",
            column: "Spd",
            label: "Spd",
            type: "DECIMAL",
            precision: 12,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Spd"
          },
          {
            table: "airplanes",
            column: "SpdTyp",
            label: "SpdTyp",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "SpdTyp"
          },
          {
            table: "airplanes",
            column: "Species",
            label: "Species",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Species"
          },
          {
            table: "airplanes",
            column: "Sqk",
            label: "Sqk",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Sqk"
          },
          {
            table: "airplanes",
            column: "TSecs",
            label: "TSecs",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "TSecs"
          },
          {
            table: "airplanes",
            column: "Tisb",
            label: "Tisb",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "Tisb"
          },
          {
            table: "airplanes",
            column: "ToCity",
            label: "ToCity",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "ToCity"
          },
          {
            table: "airplanes",
            column: "Trak",
            label: "Trak",
            type: "DECIMAL",
            precision: 12,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Trak"
          },
          {
            table: "airplanes",
            column: "TrkH",
            label: "TrkH",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "TrkH"
          },
          {
            table: "airplanes",
            column: "Trt",
            label: "Trt",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Trt"
          },
          {
            table: "airplanes",
            column: "TypePlane",
            label: "TypePlane",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "TypePlane"
          },
          {
            table: "airplanes",
            column: "Vsi",
            label: "Vsi",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "Vsi"
          },
          {
            table: "airplanes",
            column: "VsiT",
            label: "VsiT",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "VsiT"
          },
          {
            table: "airplanes",
            column: "WTC",
            label: "WTC",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "WTC"
          },
          {
            table: "airplanes",
            column: "YearBuilt",
            label: "YearBuilt",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "YearBuilt"
          },
          {
            table: "airplanes",
            column: "OpName",
            label: "OpName",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "OpName"
          },
          {
            table: "airplanes",
            column: "OpCity",
            label: "OpCity",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "OpCity"
          },
          {
            table: "airplanes",
            column: "PosTimeDate",
            label: "PosTimeDate",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "PosTimeDate"
          },
          {
            table: "airplanes",
            column: "MercX",
            label: "MercX",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "MercX"
          },
          {
            table: "airplanes",
            column: "MercY",
            label: "MercY",
            type: "DOUBLE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "MercY"
          }
        ]
      },
      contributions: {
        alias: "C",
        columnMetadata: [
          {
            table: "contributions",
            column: "id",
            label: "id",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "id"
          },
          {
            table: "contributions",
            column: "import_reference_id",
            label: "import_reference_id",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "import_reference_id"
          },
          {
            table: "contributions",
            column: "cycle_election",
            label: "cycle_election",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "cycle_election"
          },
          {
            table: "contributions",
            column: "transaction_namespace",
            label: "transaction_namespace",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "transaction_namespace"
          },
          {
            table: "contributions",
            column: "transaction_id",
            label: "transaction_id",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "transaction_id"
          },
          {
            table: "contributions",
            column: "transaction_type",
            label: "transaction_type",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "transaction_type"
          },
          {
            table: "contributions",
            column: "filing_id",
            label: "filing_id",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "filing_id"
          },
          {
            table: "contributions",
            column: "is_amendment",
            label: "is_amendment",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "is_amendment"
          },
          {
            table: "contributions",
            column: "amount",
            label: "amount",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "amount"
          },
          {
            table: "contributions",
            column: "contrib_date",
            label: "contrib_date",
            type: "DATE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "contrib_date"
          },
          {
            table: "contributions",
            column: "contributor_name",
            label: "contributor_name",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "contributor_name"
          },
          {
            table: "contributions",
            column: "contributor_ext_id",
            label: "contributor_ext_id",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "contributor_ext_id"
          },
          {
            table: "contributions",
            column: "contributor_type",
            label: "contributor_type",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "contributor_type"
          },
          {
            table: "contributions",
            column: "contributor_occupation",
            label: "contributor_occupation",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "contributor_occupation"
          },
          {
            table: "contributions",
            column: "contributor_employer",
            label: "contributor_employer",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "contributor_employer"
          },
          {
            table: "contributions",
            column: "contributor_gender",
            label: "contributor_gender",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "contributor_gender"
          },
          {
            table: "contributions",
            column: "contributor_address",
            label: "contributor_address",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "contributor_address"
          },
          {
            table: "contributions",
            column: "contributor_city",
            label: "contributor_city",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "contributor_city"
          },
          {
            table: "contributions",
            column: "contributor_state",
            label: "contributor_state",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "contributor_state"
          },
          {
            table: "contributions",
            column: "contributor_zipcode",
            label: "contributor_zipcode",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "contributor_zipcode"
          },
          {
            table: "contributions",
            column: "contributor_category",
            label: "contributor_category",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "contributor_category"
          },
          {
            table: "contributions",
            column: "organization_name",
            label: "organization_name",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "organization_name"
          },
          {
            table: "contributions",
            column: "organization_ext_id",
            label: "organization_ext_id",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "organization_ext_id"
          },
          {
            table: "contributions",
            column: "parent_organization_name",
            label: "parent_organization_name",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "parent_organization_name"
          },
          {
            table: "contributions",
            column: "parent_organization_ext_id",
            label: "parent_organization_ext_id",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "parent_organization_ext_id"
          },
          {
            table: "contributions",
            column: "recipient_name",
            label: "recipient_name",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "recipient_name"
          },
          {
            table: "contributions",
            column: "recipient_ext_id",
            label: "recipient_ext_id",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "recipient_ext_id"
          },
          {
            table: "contributions",
            column: "recipient_party",
            label: "recipient_party",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "recipient_party"
          },
          {
            table: "contributions",
            column: "recipient_type",
            label: "recipient_type",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "recipient_type"
          },
          {
            table: "contributions",
            column: "recipient_state",
            label: "recipient_state",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "recipient_state"
          },
          {
            table: "contributions",
            column: "recipient_state_held",
            label: "recipient_state_held",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "recipient_state_held"
          },
          {
            table: "contributions",
            column: "recipient_category",
            label: "recipient_category",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "recipient_category"
          },
          {
            table: "contributions",
            column: "committee_name",
            label: "committee_name",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "committee_name"
          },
          {
            table: "contributions",
            column: "committee_ext_id",
            label: "committee_ext_id",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "committee_ext_id"
          },
          {
            table: "contributions",
            column: "committee_party",
            label: "committee_party",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "committee_party"
          },
          {
            table: "contributions",
            column: "candidacy_status",
            label: "candidacy_status",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "candidacy_status"
          },
          {
            table: "contributions",
            column: "district",
            label: "district",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "district"
          },
          {
            table: "contributions",
            column: "district_held",
            label: "district_held",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "district_held"
          },
          {
            table: "contributions",
            column: "seat",
            label: "seat",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "seat"
          },
          {
            table: "contributions",
            column: "seat_held",
            label: "seat_held",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "seat_held"
          },
          {
            table: "contributions",
            column: "seat_status",
            label: "seat_status",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "seat_status"
          },
          {
            table: "contributions",
            column: "seat_result",
            label: "seat_result",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "seat_result"
          },
          {
            table: "contributions",
            column: "lon",
            label: "lon",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "lon"
          },
          {
            table: "contributions",
            column: "lat",
            label: "lat",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "lat"
          },
          {
            table: "contributions",
            column: "merc_x",
            label: "merc_x",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "merc_x"
          },
          {
            table: "contributions",
            column: "merc_y",
            label: "merc_y",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "merc_y"
          }
        ]
      }
    },
    privileges: {},
    saveLinkState: {
      error: false,
      request: false,
      saveLinkId: null
    },
    loadState: {
      error: false,
      dataAccessError: false,
      complete: true,
      request: false,
      loadLinkId: null
    },
    saveState: {
      error: false,
      request: false,
      lastState: null,
      isLink: false,
      isSaved: false
    },
    copyState: {
      error: false,
      request: false
    },
    streaming: {
      interval: 0,
      request: false
    }
  },
  filters: [],
  filterZones: {
    "-LrH-3fWoqRQv5Lgsa3Y": {
      id: "-LrH-3fWoqRQv5Lgsa3Y",
      name: "Default Filter Set",
      filters: ["-LrH-8WEgmrSzezSWdCA", "-LrH1sWIPjWnEJV2ZoZi"],
      selected: false,
      dimensions: {},
      enabledFilters: ["-LrH-8WEgmrSzezSWdCA", "-LrH1sWIPjWnEJV2ZoZi"]
    },
    "-LrKDK_SabKm7YM_tl_r": {
      id: "-LrKDK_SabKm7YM_tl_r",
      name: "New Filter Set",
      filters: ["-LrKDVNibG93aTtO3dX9"],
      selected: true,
      dimensions: {
        flights: {
          dataSource: "contributions",
          dimension: "committee_party",
          type: "STR",
          dataType: "ENUM",
          label: "committee_party",
          filterEditing: {}
        }
      }
    }
  }
}

// Dashboard with vega combo chart
export const mock_state_5 = {
  charts: {
    "1": {
      autoSize: true,
      areFiltersInverse: false,
      cap: 12,
      renderArea: false,
      color: {
        type: "ordinal",
        key: "mapD",
        val: ["#22A7F0", "#3ad6cd", "#d4e666"]
      },
      colorDomain: null,
      dataSelections: [
        {
          table: {
            name: "flights",
            columns: [
              {
                name: "flight_year",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "flight_month",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "flight_dayofmonth",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "flight_dayofweek",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "deptime",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "crsdeptime",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "arrtime",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "crsarrtime",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "uniquecarrier",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "flightnum",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "tailnum",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "actualelapsedtime",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "crselapsedtime",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "airtime",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "arrdelay",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "depdelay",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "origin",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "dest",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "distance",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "taxiin",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "taxiout",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "cancelled",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "cancellationcode",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "diverted",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "carrierdelay",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "weatherdelay",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "nasdelay",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "securitydelay",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "lateaircraftdelay",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "dep_timestamp",
                type: "TIMESTAMP",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "arr_timestamp",
                type: "TIMESTAMP",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "carrier_name",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "plane_type",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "plane_manufacturer",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "plane_issue_date",
                type: "DATE",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "plane_model",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "plane_status",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "plane_aircraft_type",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "plane_engine_type",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "plane_year",
                type: "SMALLINT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "origin_name",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "origin_city",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "origin_state",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "origin_country",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "origin_lat",
                type: "FLOAT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "origin_lon",
                type: "FLOAT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "dest_name",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "dest_city",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "dest_state",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "dest_country",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true
              },
              {
                name: "dest_lat",
                type: "FLOAT",
                precision: 0,
                is_array: false,
                is_dict: false
              },
              {
                name: "dest_lon",
                type: "FLOAT",
                precision: 0,
                is_array: false,
                is_dict: false
              }
            ]
          },
          dimensions: {
            xAxis: {
              type: "column",
              table: "flights",
              column: {
                name: "tailnum",
                type: "STR",
                precision: 0,
                is_array: false,
                is_dict: true,
                value: "tailnum"
              },
              isBinned: false,
              isBinnable: false
            },
            color: null
          },
          measures: {
            size: {
              type: "count",
              table: "flights"
            },
            color: null
          }
        }
      ],
      selectedLayerId: 0,
      dcFlag: null,
      densityAccumulatorEnabled: true,
      dimensions: [
        {
          isRequired: true,
          isError: false,
          inactive: false,
          name: null
        },
        {
          inactive: false,
          name: "group by"
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: false,
      measures: [
        {
          isRequired: true,
          isError: false,
          inactive: false,
          name: null
        },
        {
          inactive: false,
          name: "color"
        }
      ],
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {},
      sortColumn: null,
      ticks: 3,
      title: "",
      type: "vega-combo",
      showOther: false,
      showNullDimensions: true,
      markTypes: [],
      multiSources: {},
      legendCollapsed: false,
      hasError: false,
      isNotDc: true,
      isLoadingData: false
    }
  },
  omnifilters: [],
  dashboard: {
    id: null,
    title: null,
    columnMetadata: null,
    chartContainers: [
      {
        id: "1"
      }
    ],
    table: null,
    filtersId: [],
    layout: [
      {
        w: 10,
        h: 10,
        x: 0,
        y: 0,
        i: "1",
        moved: false,
        static: false
      }
    ],
    currentDataSource: null,
    dataSources: {
      flights: {
        alias: "A",
        columnMetadata: [
          {
            table: "flights",
            column: "flight_year",
            label: "flight_year",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "flight_year"
          },
          {
            table: "flights",
            column: "flight_month",
            label: "flight_month",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "flight_month"
          },
          {
            table: "flights",
            column: "flight_dayofmonth",
            label: "flight_dayofmonth",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "flight_dayofmonth"
          },
          {
            table: "flights",
            column: "flight_dayofweek",
            label: "flight_dayofweek",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "flight_dayofweek"
          },
          {
            table: "flights",
            column: "deptime",
            label: "deptime",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "deptime"
          },
          {
            table: "flights",
            column: "crsdeptime",
            label: "crsdeptime",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "crsdeptime"
          },
          {
            table: "flights",
            column: "arrtime",
            label: "arrtime",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "arrtime"
          },
          {
            table: "flights",
            column: "crsarrtime",
            label: "crsarrtime",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "crsarrtime"
          },
          {
            table: "flights",
            column: "uniquecarrier",
            label: "uniquecarrier",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "uniquecarrier"
          },
          {
            table: "flights",
            column: "flightnum",
            label: "flightnum",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "flightnum"
          },
          {
            table: "flights",
            column: "tailnum",
            label: "tailnum",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "tailnum"
          },
          {
            table: "flights",
            column: "actualelapsedtime",
            label: "actualelapsedtime",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "actualelapsedtime"
          },
          {
            table: "flights",
            column: "crselapsedtime",
            label: "crselapsedtime",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "crselapsedtime"
          },
          {
            table: "flights",
            column: "airtime",
            label: "airtime",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "airtime"
          },
          {
            table: "flights",
            column: "arrdelay",
            label: "arrdelay",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "arrdelay"
          },
          {
            table: "flights",
            column: "depdelay",
            label: "depdelay",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "depdelay"
          },
          {
            table: "flights",
            column: "origin",
            label: "origin",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "origin"
          },
          {
            table: "flights",
            column: "dest",
            label: "dest",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "dest"
          },
          {
            table: "flights",
            column: "distance",
            label: "distance",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "distance"
          },
          {
            table: "flights",
            column: "taxiin",
            label: "taxiin",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "taxiin"
          },
          {
            table: "flights",
            column: "taxiout",
            label: "taxiout",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "taxiout"
          },
          {
            table: "flights",
            column: "cancelled",
            label: "cancelled",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "cancelled"
          },
          {
            table: "flights",
            column: "cancellationcode",
            label: "cancellationcode",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "cancellationcode"
          },
          {
            table: "flights",
            column: "diverted",
            label: "diverted",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "diverted"
          },
          {
            table: "flights",
            column: "carrierdelay",
            label: "carrierdelay",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "carrierdelay"
          },
          {
            table: "flights",
            column: "weatherdelay",
            label: "weatherdelay",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "weatherdelay"
          },
          {
            table: "flights",
            column: "nasdelay",
            label: "nasdelay",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "nasdelay"
          },
          {
            table: "flights",
            column: "securitydelay",
            label: "securitydelay",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "securitydelay"
          },
          {
            table: "flights",
            column: "lateaircraftdelay",
            label: "lateaircraftdelay",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "lateaircraftdelay"
          },
          {
            table: "flights",
            column: "dep_timestamp",
            label: "dep_timestamp",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "dep_timestamp"
          },
          {
            table: "flights",
            column: "arr_timestamp",
            label: "arr_timestamp",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "arr_timestamp"
          },
          {
            table: "flights",
            column: "carrier_name",
            label: "carrier_name",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "carrier_name"
          },
          {
            table: "flights",
            column: "plane_type",
            label: "plane_type",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "plane_type"
          },
          {
            table: "flights",
            column: "plane_manufacturer",
            label: "plane_manufacturer",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "plane_manufacturer"
          },
          {
            table: "flights",
            column: "plane_issue_date",
            label: "plane_issue_date",
            type: "DATE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "plane_issue_date"
          },
          {
            table: "flights",
            column: "plane_model",
            label: "plane_model",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "plane_model"
          },
          {
            table: "flights",
            column: "plane_status",
            label: "plane_status",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "plane_status"
          },
          {
            table: "flights",
            column: "plane_aircraft_type",
            label: "plane_aircraft_type",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "plane_aircraft_type"
          },
          {
            table: "flights",
            column: "plane_engine_type",
            label: "plane_engine_type",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "plane_engine_type"
          },
          {
            table: "flights",
            column: "plane_year",
            label: "plane_year",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "plane_year"
          },
          {
            table: "flights",
            column: "origin_name",
            label: "origin_name",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "origin_name"
          },
          {
            table: "flights",
            column: "origin_city",
            label: "origin_city",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "origin_city"
          },
          {
            table: "flights",
            column: "origin_state",
            label: "origin_state",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "origin_state"
          },
          {
            table: "flights",
            column: "origin_country",
            label: "origin_country",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "origin_country"
          },
          {
            table: "flights",
            column: "origin_lat",
            label: "origin_lat",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "origin_lat"
          },
          {
            table: "flights",
            column: "origin_lon",
            label: "origin_lon",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "origin_lon"
          },
          {
            table: "flights",
            column: "dest_name",
            label: "dest_name",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "dest_name"
          },
          {
            table: "flights",
            column: "dest_city",
            label: "dest_city",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "dest_city"
          },
          {
            table: "flights",
            column: "dest_state",
            label: "dest_state",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "dest_state"
          },
          {
            table: "flights",
            column: "dest_country",
            label: "dest_country",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            value: "dest_country"
          },
          {
            table: "flights",
            column: "dest_lat",
            label: "dest_lat",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "dest_lat"
          },
          {
            table: "flights",
            column: "dest_lon",
            label: "dest_lon",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "dest_lon"
          }
        ]
      }
    },
    privileges: {},
    saveLinkState: {
      error: false,
      request: false,
      saveLinkId: null
    },
    loadState: {
      error: false,
      dataAccessError: false,
      complete: true,
      request: false,
      loadLinkId: null
    },
    saveState: {
      error: false,
      request: false,
      lastState: null,
      isLink: false,
      isSaved: false
    },
    copyState: {
      error: false,
      request: false
    },
    streaming: {
      interval: 0,
      request: false
    }
  },
  filters: [],
  filterZones: {
    "-LtRYQUX1aRedJO4d7DW": {
      id: "-LtRYQUX1aRedJO4d7DW",
      name: "Default Filter Set",
      filters: [],
      selected: true,
      dimensions: {}
    }
  }
}

// dashboard with multilayer raster
export const mock_state_6 = {
  charts: {
    "1": {
      autoSize: true,
      areFiltersInverse: false,
      cap: 10000000,
      renderArea: false,
      color: {
        type: "quantitative",
        key: "mapDScale",
        val: [
          "#115f9a",
          "#1984c5",
          "#22a7f0",
          "#48b5c4",
          "#76c68f",
          "#a6d75b",
          "#c9e52f",
          "#d0ee11",
          "#d0f400"
        ]
      },
      colorDomain: null,
      dataSelections: [
        {
          table: null,
          dimensions: {
            xAxis: null,
            color: null
          },
          measures: {
            size: null,
            color: null
          }
        }
      ],
      selectedLayerId: 0,
      dcFlag: 2,
      densityAccumulatorEnabled: true,
      dimensions: [
        {
          inactive: false,
          name: null,
          isBinned: false,
          isBinnable: false,
          isRequired: false,
          isError: false
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: false,
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {},
      sortColumn: null,
      ticks: 3,
      title: "",
      type: "pointmap",
      showOther: false,
      showNullDimensions: true,
      markTypes: [],
      multiSources: {},
      legendCollapsed: false,
      hasError: false,
      polyCap: 150000,
      layers: [
        {
          measures: [
            {
              isRequired: false,
              isError: false,
              inactive: false,
              name: "x",
              table: "flights",
              type: "FLOAT",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "dest_lon",
              value: "dest_lon",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              minMax: [-176.64599609375, -64.79859924316406]
            },
            {
              inactive: false,
              name: "y",
              isRequired: false,
              isError: false,
              table: "flights",
              type: "FLOAT",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "dest_lat",
              value: "dest_lat",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              minMax: [17.701900482177734, 71.285400390625]
            },
            {
              inactive: false,
              name: "size",
              isRequired: false,
              isError: false
            },
            {
              inactive: false,
              name: "color",
              isRequired: false,
              isError: false
            }
          ],
          dimensions: [
            {
              inactive: false,
              name: null,
              isBinned: false,
              isBinnable: false,
              isRequired: false,
              isError: false
            }
          ],
          color: {
            type: "quantitative",
            key: "mapDScale",
            val: [
              "#115f9a",
              "#1984c5",
              "#22a7f0",
              "#48b5c4",
              "#76c68f",
              "#a6d75b",
              "#c9e52f",
              "#d0ee11",
              "#d0f400"
            ]
          },
          dataSource: "flights",
          type: "pointmap",
          densityAccumulatorEnabled: true,
          autoSize: true,
          cap: 10000000,
          hoverSelectedColumns: [],
          geoJoin: {},
          polyCap: 150000,
          postFilters: [
            {
              name: "postFilter",
              required: true,
              operator: null,
              min: "",
              max: "",
              type: {
                int2: true,
                int4: true,
                int8: true,
                SMALLINT: true,
                TINYINT: true,
                INT: true,
                BIGINT: true,
                FLOAT: true,
                DOUBLE: true,
                DECIMAL: true,
                CUSTOM: true
              },
              inactive: false,
              isRequired: true
            }
          ]
        },
        {
          measures: [
            {
              inactive: false,
              name: "x",
              isRequired: false,
              isError: false,
              table: "tweets_small",
              type: "FLOAT",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "lon",
              value: "lon",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              minMax: [-179.9444122314453, 179.8099822998047]
            },
            {
              inactive: false,
              name: "y",
              isRequired: false,
              isError: false,
              table: "tweets_small",
              type: "FLOAT",
              precision: 0,
              is_array: false,
              is_dict: false,
              name_is_ambiguous: false,
              label: "lat",
              value: "lat",
              custom: false,
              axisLabel: null,
              loading: false,
              aggType: "Avg",
              minMax: [-88.56007385253906, 84.23859405517578]
            },
            {
              inactive: false,
              name: "size",
              isRequired: false,
              isError: false
            },
            {
              inactive: false,
              name: "color",
              isRequired: false,
              isError: false
            }
          ],
          dimensions: [
            {
              inactive: false,
              name: null,
              isBinned: false,
              isBinnable: false,
              isRequired: false,
              isError: false
            }
          ],
          color: {
            type: "quantitative",
            key: "mapDScale",
            val: [
              "#115f9a",
              "#1984c5",
              "#22a7f0",
              "#48b5c4",
              "#76c68f",
              "#a6d75b",
              "#c9e52f",
              "#d0ee11",
              "#d0f400"
            ]
          },
          pixelSize: 10,
          mark: "hex",
          dataSource: "tweets_small",
          type: "pointmap",
          densityAccumulatorEnabled: true,
          autoSize: true,
          cap: 10000000,
          hoverSelectedColumns: [],
          geoJoin: {},
          borderWidth: 0,
          postFilters: [
            {
              name: "postFilter",
              required: true,
              operator: null,
              min: "",
              max: "",
              type: {
                int2: true,
                int4: true,
                int8: true,
                SMALLINT: true,
                TINYINT: true,
                INT: true,
                BIGINT: true,
                FLOAT: true,
                DOUBLE: true,
                DECIMAL: true,
                CUSTOM: true
              },
              inactive: false,
              isRequired: true
            }
          ]
        }
      ],
      postFilters: [
        {
          name: "postFilter",
          required: true,
          operator: null,
          min: "",
          max: "",
          type: {
            int2: true,
            int4: true,
            int8: true,
            SMALLINT: true,
            TINYINT: true,
            INT: true,
            BIGINT: true,
            FLOAT: true,
            DOUBLE: true,
            DECIMAL: true,
            CUSTOM: true
          },
          inactive: false,
          isRequired: true
        }
      ],
      dataSource: "tweets_small",
      hoverSelectedColumns: [],
      width: 524,
      height: 742,
      mapZoomCenter: {
        zoom: 2.2689740712643944,
        center: {
          lng: -97.08867921064677,
          lat: 43.76970438195045
        },
        bounds: {
          lonMin: -135.30990193001148,
          lonMax: -58.86745649128123,
          latMin: -5.3373097085349315,
          latMax: 71.15288940283725
        }
      },
      pixelSize: 10,
      currentLayer: "master",
      mark: "hex",
      borderWidth: 0,
      measures: [
        {
          inactive: false,
          name: "x",
          isRequired: false,
          isError: false,
          table: "tweets_small",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "lon",
          value: "lon",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [-179.9444122314453, 179.8099822998047]
        },
        {
          inactive: false,
          name: "y",
          isRequired: false,
          isError: false,
          table: "tweets_small",
          type: "FLOAT",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "lat",
          value: "lat",
          custom: false,
          axisLabel: null,
          loading: false,
          aggType: "Avg",
          minMax: [-88.56007385253906, 84.23859405517578]
        },
        {
          inactive: false,
          name: "size",
          isRequired: false,
          isError: false
        },
        {
          inactive: false,
          name: "color",
          isRequired: false,
          isError: false
        }
      ]
    },
    tweets_small: {
      dcFlag: 3,
      loading: false,
      color: {
        defaultOtherDomain: "Default"
      }
    }
  },
  omnifilters: [
    {
      chartId: "1",
      appliesTo: "CROSSFILTER",
      name: "-LtRZ0iXc7jdzxHqEtiV",
      enabled: true,
      dataSources: ["flights", null],
      filter: {
        filterType: FILTER_TYPE_SQL,
        dataSource: "flights",
        sql: "1=1",
        label:
          "\n              Bounding box centered at (43.76970438195045, -97.08867921064677)\n              Between latitudes : (-52.43804751457837 to 82.90915856832495)\n              and longitudes : (-172.65582947259765 to -21.521528948697892)\n          "
      },
      chartFilters: [],
      chartRangeFilter: [],
      mapZoomCenter: {
        zoom: 2.2689740712643944,
        center: {
          lng: -97.08867921064677,
          lat: 43.76970438195045
        },
        bounds: {
          lonMin: -172.65582947259765,
          lonMax: -21.521528948697892,
          latMin: -52.43804751457837,
          latMax: 82.90915856832495
        }
      },
      isBoundingBox: true,
      isRangeFilter: false,
      label:
        "\n              Bounding box centered at (43.76970438195045, -97.08867921064677)\n              Between latitudes : (-52.43804751457837 to 82.90915856832495)\n              and longitudes : (-172.65582947259765 to -21.521528948697892)\n          ",
      isOldFilter: true
    },
    {
      chartId: "1",
      appliesTo: "CROSSFILTER",
      name: "-LtRZ2pBP7GubTdiavpS",
      enabled: true,
      dataSources: ["flights", "tweets_small"],
      filter: {
        filterType: FILTER_TYPE_SQL,
        dataSource: "tweets_small",
        sql: "1=1",
        label:
          "\n              Bounding box centered at (43.76970438195045, -97.08867921064677)\n              Between latitudes : (-5.3373097085349315 to 71.15288940283725)\n              and longitudes : (-135.30990193001148 to -58.86745649128123)\n          "
      },
      chartFilters: [],
      chartRangeFilter: [],
      mapZoomCenter: {
        zoom: 2.2689740712643944,
        center: {
          lng: -97.08867921064677,
          lat: 43.76970438195045
        },
        bounds: {
          lonMin: -135.30990193001148,
          lonMax: -58.86745649128123,
          latMin: -5.3373097085349315,
          latMax: 71.15288940283725
        }
      },
      isBoundingBox: true,
      isRangeFilter: false,
      label:
        "\n              Bounding box centered at (43.76970438195045, -97.08867921064677)\n              Between latitudes : (-5.3373097085349315 to 71.15288940283725)\n              and longitudes : (-135.30990193001148 to -58.86745649128123)\n          ",
      isOldFilter: true
    }
  ],
  dashboard: {
    id: null,
    title: null,
    columnMetadata: null,
    chartContainers: [
      {
        id: "1"
      }
    ],
    table: null,
    filtersId: [],
    layout: [
      {
        w: 10,
        h: 10,
        x: 0,
        y: 0,
        i: "1",
        moved: false,
        static: false
      }
    ],
    currentDataSource: "tweets_small",
    dataSources: {
      flights: {
        alias: "A",
        columnMetadata: [
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_year",
            value: "flight_year"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_month",
            value: "flight_month"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofmonth",
            value: "flight_dayofmonth"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofweek",
            value: "flight_dayofweek"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "deptime",
            value: "deptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsdeptime",
            value: "crsdeptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrtime",
            value: "arrtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsarrtime",
            value: "crsarrtime"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "uniquecarrier",
            value: "uniquecarrier"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flightnum",
            value: "flightnum"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "tailnum",
            value: "tailnum"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "actualelapsedtime",
            value: "actualelapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crselapsedtime",
            value: "crselapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "airtime",
            value: "airtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrdelay",
            value: "arrdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "depdelay",
            value: "depdelay"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin",
            value: "origin"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest",
            value: "dest"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "distance",
            value: "distance"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiin",
            value: "taxiin"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiout",
            value: "taxiout"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "cancelled",
            value: "cancelled"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "cancellationcode",
            value: "cancellationcode"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "diverted",
            value: "diverted"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "carrierdelay",
            value: "carrierdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "weatherdelay",
            value: "weatherdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "nasdelay",
            value: "nasdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "securitydelay",
            value: "securitydelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lateaircraftdelay",
            value: "lateaircraftdelay"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dep_timestamp",
            value: "dep_timestamp"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arr_timestamp",
            value: "arr_timestamp"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "carrier_name",
            value: "carrier_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_type",
            value: "plane_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_manufacturer",
            value: "plane_manufacturer"
          },
          {
            table: "flights",
            type: "DATE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_issue_date",
            value: "plane_issue_date"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_model",
            value: "plane_model"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_status",
            value: "plane_status"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_aircraft_type",
            value: "plane_aircraft_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_engine_type",
            value: "plane_engine_type"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_year",
            value: "plane_year"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_name",
            value: "origin_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_city",
            value: "origin_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_state",
            value: "origin_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_country",
            value: "origin_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lat",
            value: "origin_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lon",
            value: "origin_lon"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_name",
            value: "dest_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_city",
            value: "dest_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_state",
            value: "dest_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_country",
            value: "dest_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lat",
            value: "dest_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lon",
            value: "dest_lon"
          }
        ]
      },
      tweets_small: {
        alias: "B",
        columnMetadata: [
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "tweet_id",
            value: "tweet_id"
          },
          {
            table: "tweets_small",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "tweet_time",
            value: "tweet_time"
          },
          {
            table: "tweets_small",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lat",
            value: "lat"
          },
          {
            table: "tweets_small",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lon",
            value: "lon"
          },
          {
            table: "tweets_small",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "sender_id",
            value: "sender_id"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "sender_name",
            value: "sender_name"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "location",
            value: "location"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "source",
            value: "source"
          },
          {
            table: "tweets_small",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "reply_to_user_id",
            value: "reply_to_user_id"
          },
          {
            table: "tweets_small",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "reply_to_tweet_id",
            value: "reply_to_tweet_id"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "lang",
            value: "lang"
          },
          {
            table: "tweets_small",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "followers",
            value: "followers"
          },
          {
            table: "tweets_small",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "followees",
            value: "followees"
          },
          {
            table: "tweets_small",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "tweet_count",
            value: "tweet_count"
          },
          {
            table: "tweets_small",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "join_time",
            value: "join_time"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "tweet_text",
            value: "tweet_text"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "country",
            value: "country"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "admin1",
            value: "admin1"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "admin2",
            value: "admin2"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "place_name",
            value: "place_name"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "state_abbr",
            value: "state_abbr"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "county_state",
            value: "county_state"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin",
            value: "origin"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: true,
            is_dict: true,
            name_is_ambiguous: false,
            label: "hashtags",
            value: "hashtags"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: true,
            is_dict: true,
            name_is_ambiguous: false,
            label: "tweet_tokens",
            value: "tweet_tokens"
          },
          {
            table: "tweets_small",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "goog_x",
            value: "goog_x"
          },
          {
            table: "tweets_small",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "goog_y",
            value: "goog_y"
          },
          {
            table: "tweets_small",
            type: "BOOL",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "is_exact",
            value: "is_exact"
          }
        ]
      }
    },
    privileges: {},
    saveLinkState: {
      error: false,
      request: false,
      saveLinkId: null
    },
    loadState: {
      error: false,
      dataAccessError: false,
      complete: true,
      request: false,
      loadLinkId: null
    },
    saveState: {
      error: false,
      request: false,
      lastState: null,
      isLink: false,
      isSaved: false
    },
    copyState: {
      error: false,
      request: false
    },
    streaming: {
      interval: 0,
      request: false
    }
  },
  filters: [],
  filterZones: {
    "-LtRYy17SNp36hss2MDG": {
      id: "-LtRYy17SNp36hss2MDG",
      name: "Default Filter Set",
      filters: ["-LtRZ2pBP7GubTdiavpS"],
      selected: true,
      dimensions: {}
    }
  }
}

// VDF combo
export const mock_state_7 = {
  charts: {
    "1": {
      autoSize: true,
      areFiltersInverse: false,
      cap: 12,
      renderArea: false,
      color: {
        "0": {
          type: "custom",
          key: "blue",
          val: ["#27aeef"],
          column: "Measures",
          customKey: "key1",
          isCustom: true,
          customDomain: ["# Records"],
          customRange: ["#27aeef"],
          lineStyles: ["solid"],
          defaultOtherDomain: "other",
          defaultOtherRange: "#27aeef"
        },
        "1": {
          type: "custom",
          key: "blue",
          val: ["#27aeef"],
          column: "Measures",
          customKey: "key1",
          isCustom: true,
          customDomain: ["# Records"],
          customRange: ["#ea5545"],
          lineStyles: ["solid"],
          defaultOtherDomain: "other",
          defaultOtherRange: "#27aeef"
        }
      },
      colorDomain: null,
      dataSelections: [
        {
          table: null,
          dimensions: {
            xAxis: null,
            color: null
          },
          measures: {
            size: null,
            color: null
          }
        }
      ],
      selectedLayerId: 0,
      dcFlag: null,
      densityAccumulatorEnabled: true,
      dimensions: [
        {
          isRequired: false,
          isError: false,
          inactive: false,
          name: "X Axis",
          table: "flights",
          type: "TIMESTAMP",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "arr_timestamp",
          value: "arr_timestamp",
          custom: false,
          axisLabel: null,
          extract: false,
          loading: false,
          timeBin: "auto",
          autobin: false,
          min_val: "2008-01-01T00:57:00.000Z",
          max_val: "2009-01-01T18:27:00.000Z",
          currentLowValue: "2008-01-01T00:57:00.000Z",
          currentHighValue: "2009-01-01T18:27:00.000Z",
          cardinality: 455902,
          isBinned: true,
          isBinnable: true,
          maxBinSize: 250,
          numOfBins: 1000,
          multiSourceIndex: 0
        },
        {
          inactive: false,
          name: "Color",
          isRequired: false,
          isError: false,
          multiSourceIndex: 0
        },
        {
          isError: false,
          isRequired: false,
          inactive: false,
          name: "X Axis",
          multiSourceIndex: 1,
          table: "tweets_small",
          type: "TIMESTAMP",
          precision: 0,
          is_array: false,
          is_dict: false,
          name_is_ambiguous: false,
          label: "tweet_time",
          value: "tweet_time",
          custom: false,
          axisLabel: null,
          extract: false,
          loading: false,
          timeBin: "auto",
          autobin: true,
          min_val: "2017-05-01T00:00:00.000Z",
          max_val: "2017-05-01T04:49:19.000Z",
          currentLowValue: "2017-05-01T00:00:00.000Z",
          currentHighValue: "2017-05-01T04:49:19.000Z",
          cardinality: 17360,
          isBinned: true,
          isBinnable: true,
          maxBinSize: 250,
          numOfBins: 1000
        },
        {
          inactive: false,
          name: "Color",
          isError: false,
          isRequired: false,
          multiSourceIndex: 1
        }
      ],
      elasticX: true,
      elasticY: true,
      filters: [],
      geoJson: null,
      loading: false,
      measures: [
        {
          inactive: false,
          name: "series_1",
          isRequired: true,
          isError: false,
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          custom: false,
          axisLabel: null,
          categories: null,
          multiSourceIndex: 0,
          colorType: "quantitative",
          aggType: "Count",
          originIndex: 0,
          yAxisOrientation: "left",
          minMax: null
        },
        {
          name: "y axis",
          yAxisOrientation: "left",
          isRequired: false,
          isError: false,
          multiSourceIndex: 0
        },
        {
          inactive: false,
          name: "series_1",
          isError: false,
          isRequired: true,
          multiSourceIndex: 1,
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          custom: false,
          axisLabel: null,
          categories: null,
          colorType: "quantitative",
          aggType: "Count",
          originIndex: 2,
          yAxisOrientation: "right",
          minMax: null
        },
        {
          name: "y axis",
          yAxisOrientation: "left",
          multiSourceIndex: 1,
          isRequired: false,
          isError: false
        }
      ],
      rangeChartEnabled: false,
      rangeFilter: [],
      savedColors: {
        "0": {
          custom_Measures: {
            type: "custom",
            key: "blue",
            val: ["#27aeef"],
            column: "Measures",
            customKey: "key1",
            isCustom: true,
            customDomain: ["# Records"],
            customRange: ["#27aeef"],
            lineStyles: ["solid"],
            defaultOtherDomain: "other",
            defaultOtherRange: "#27aeef"
          }
        },
        "1": {
          custom_Measures: {
            type: "custom",
            key: "blue",
            val: ["#27aeef"],
            column: "Measures",
            customKey: "key1",
            isCustom: true,
            customDomain: ["# Records"],
            customRange: ["#ea5545"],
            lineStyles: ["solid"],
            defaultOtherDomain: "other",
            defaultOtherRange: "#27aeef"
          }
        }
      },
      sortColumn: null,
      ticks: 3,
      title: "",
      type: "line2",
      showOther: false,
      showNullDimensions: true,
      markTypes: ["line", null, "line"],
      multiSources: {
        "0": {
          table: "flights",
          index: 0
        },
        "1": {
          table: "tweets_small",
          index: 1
        }
      },
      legendCollapsed: false,
      hasError: false,
      isNotDc: true,
      dataSource: null,
      hoverSelectedColumns: [],
      yAxisLabel: null,
      y2AxisLabel: null,
      isLoadingData: false,
      filterString: {
        "0": "",
        "1": ""
      },
      percentageViewEnabled: false,
      restrictedDimensionType: "Time"
    },
    flights: {
      dcFlag: 6,
      loading: false,
      color: {
        defaultOtherDomain: "Default"
      }
    },
    tweets_small: {
      dcFlag: 7,
      loading: false,
      color: {
        defaultOtherDomain: "Default"
      }
    }
  },
  omnifilters: [],
  dashboard: {
    id: null,
    title: null,
    columnMetadata: null,
    chartContainers: [
      {
        id: "1"
      }
    ],
    table: null,
    filtersId: [],
    layout: [
      {
        w: 10,
        h: 10,
        x: 0,
        y: 0,
        i: "1",
        moved: false,
        static: false
      }
    ],
    currentDataSource: "tweets_small",
    dataSources: {
      flights: {
        alias: "A",
        columnMetadata: [
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_year",
            value: "flight_year"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_month",
            value: "flight_month"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofmonth",
            value: "flight_dayofmonth"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flight_dayofweek",
            value: "flight_dayofweek"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "deptime",
            value: "deptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsdeptime",
            value: "crsdeptime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrtime",
            value: "arrtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crsarrtime",
            value: "crsarrtime"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "uniquecarrier",
            value: "uniquecarrier"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "flightnum",
            value: "flightnum"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "tailnum",
            value: "tailnum"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "actualelapsedtime",
            value: "actualelapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "crselapsedtime",
            value: "crselapsedtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "airtime",
            value: "airtime"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arrdelay",
            value: "arrdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "depdelay",
            value: "depdelay"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin",
            value: "origin"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest",
            value: "dest"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "distance",
            value: "distance"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiin",
            value: "taxiin"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "taxiout",
            value: "taxiout"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "cancelled",
            value: "cancelled"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "cancellationcode",
            value: "cancellationcode"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "diverted",
            value: "diverted"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "carrierdelay",
            value: "carrierdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "weatherdelay",
            value: "weatherdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "nasdelay",
            value: "nasdelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "securitydelay",
            value: "securitydelay"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lateaircraftdelay",
            value: "lateaircraftdelay"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dep_timestamp",
            value: "dep_timestamp"
          },
          {
            table: "flights",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "arr_timestamp",
            value: "arr_timestamp"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "carrier_name",
            value: "carrier_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_type",
            value: "plane_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_manufacturer",
            value: "plane_manufacturer"
          },
          {
            table: "flights",
            type: "DATE",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_issue_date",
            value: "plane_issue_date"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_model",
            value: "plane_model"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_status",
            value: "plane_status"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_aircraft_type",
            value: "plane_aircraft_type"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "plane_engine_type",
            value: "plane_engine_type"
          },
          {
            table: "flights",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "plane_year",
            value: "plane_year"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_name",
            value: "origin_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_city",
            value: "origin_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_state",
            value: "origin_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin_country",
            value: "origin_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lat",
            value: "origin_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "origin_lon",
            value: "origin_lon"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_name",
            value: "dest_name"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_city",
            value: "dest_city"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_state",
            value: "dest_state"
          },
          {
            table: "flights",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "dest_country",
            value: "dest_country"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lat",
            value: "dest_lat"
          },
          {
            table: "flights",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "dest_lon",
            value: "dest_lon"
          }
        ]
      },
      tweets_small: {
        alias: "B",
        columnMetadata: [
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "tweet_id",
            value: "tweet_id"
          },
          {
            table: "tweets_small",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "tweet_time",
            value: "tweet_time"
          },
          {
            table: "tweets_small",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lat",
            value: "lat"
          },
          {
            table: "tweets_small",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "lon",
            value: "lon"
          },
          {
            table: "tweets_small",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "sender_id",
            value: "sender_id"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "sender_name",
            value: "sender_name"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "location",
            value: "location"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "source",
            value: "source"
          },
          {
            table: "tweets_small",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "reply_to_user_id",
            value: "reply_to_user_id"
          },
          {
            table: "tweets_small",
            type: "BIGINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "reply_to_tweet_id",
            value: "reply_to_tweet_id"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "lang",
            value: "lang"
          },
          {
            table: "tweets_small",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "followers",
            value: "followers"
          },
          {
            table: "tweets_small",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "followees",
            value: "followees"
          },
          {
            table: "tweets_small",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "tweet_count",
            value: "tweet_count"
          },
          {
            table: "tweets_small",
            type: "TIMESTAMP",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "join_time",
            value: "join_time"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "tweet_text",
            value: "tweet_text"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "country",
            value: "country"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "admin1",
            value: "admin1"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "admin2",
            value: "admin2"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "place_name",
            value: "place_name"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "state_abbr",
            value: "state_abbr"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "county_state",
            value: "county_state"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true,
            name_is_ambiguous: false,
            label: "origin",
            value: "origin"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: true,
            is_dict: true,
            name_is_ambiguous: false,
            label: "hashtags",
            value: "hashtags"
          },
          {
            table: "tweets_small",
            type: "STR",
            precision: 0,
            is_array: true,
            is_dict: true,
            name_is_ambiguous: false,
            label: "tweet_tokens",
            value: "tweet_tokens"
          },
          {
            table: "tweets_small",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "goog_x",
            value: "goog_x"
          },
          {
            table: "tweets_small",
            type: "FLOAT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "goog_y",
            value: "goog_y"
          },
          {
            table: "tweets_small",
            type: "BOOL",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            label: "is_exact",
            value: "is_exact"
          }
        ]
      }
    },
    privileges: {},
    saveLinkState: {
      error: false,
      request: false,
      saveLinkId: null
    },
    loadState: {
      error: false,
      dataAccessError: false,
      complete: true,
      request: false,
      loadLinkId: null
    },
    saveState: {
      error: false,
      request: false,
      lastState: null,
      isLink: false,
      isSaved: false
    },
    copyState: {
      error: false,
      request: false
    },
    streaming: {
      interval: 0,
      request: false
    }
  },
  filters: [],
  filterZones: {
    "-LtWcXPvQQ6DCe-6omH9": {
      id: "-LtWcXPvQQ6DCe-6omH9",
      name: "Default Filter Set",
      filters: [],
      selected: true,
      dimensions: {}
    }
  }
}
