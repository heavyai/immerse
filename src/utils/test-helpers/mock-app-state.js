// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_SQL
} from "vega/constants/filter-type-constants"

export default {
  router: {
    location: {
      pathname: "dashboard/40/chart/7/edit",
      search: "",
      hash: "",
      state: null,
      action: "PUSH",
      key: "vyv4tt",
      query: {},
      $searchBase: {
        search: "",
        searchBase: ""
      }
    }
  },
  annotations: {},
  connection: {
    error: false,
    isConnected: true,
    isMSDEnabled: true,
    isDemo: false,
    isRenderingEnabled: true,
    geoJsonConfig: {
      "countries.json": {
        label: "Countries",
        isTopo: true,
        topoKey: "countries",
        keys: ["name", "iso_a2", "iso_a3"]
      },
      "us-states.json": {
        label: "US State",
        isTopo: false,
        topoKey: "",
        keys: ["name", "abbr"]
      },
      "us-counties.json": {
        label: "US Counties",
        isTopo: true,
        topoKey: "counties",
        keys: ["name", "state", "county", "fips"]
      }
    },
    loading: false,
    privileges: {
      createDashboard: true
    },
    user: {
      database: "mapd",
      url: "http://localhost:8002",
      username: "mapd",
      protocol: "http:",
      host: "localhost",
      port: 9002
    },
    roles: [],
    sessionInfo: {
      database: "mapd"
    }
  },
  dashboard: {
    dataSources: {
      contributions: {
        alias: "A",
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
            column: "political_cycle",
            label: "political_cycle",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "political_cycle"
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
            type: "BIGINT",
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
            type: "INT",
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
            is_dict: true,
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
            is_dict: true,
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
            is_dict: true,
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
            is_dict: true,
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
            is_dict: true,
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
            is_dict: true,
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
            is_dict: true,
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
            is_dict: true,
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
    streaming: {
      interval: 0,
      request: false
    },
    currentDataSource: "contributions",
    title: "Political Donations",
    titleFormatted: "Political Donations",
    privileges: {
      deleteDashboard: true,
      viewDashboard: true,
      editDashboard: true
    },
    chartContainers: [
      {
        id: "4"
      },
      {
        id: "5"
      },
      {
        id: "7"
      },
      {
        id: "8"
      }
    ],
    table: "contributions",
    filtersId: [],
    layout: [
      {
        w: 10,
        h: 8,
        x: 19,
        y: 0,
        i: "4",
        moved: false,
        static: false
      },
      {
        w: 29,
        h: 10,
        x: 0,
        y: 10,
        i: "5",
        moved: false,
        static: false
      },
      {
        w: 8,
        h: 10,
        x: 11,
        y: 0,
        i: "7",
        moved: false,
        static: false
      },
      {
        w: 10,
        h: 10,
        x: 0,
        y: 0,
        i: "8",
        moved: false,
        static: false
      }
    ],
    saveLinkState: {
      request: true,
      error: false
    },
    loadState: {
      request: false,
      error: false
    },
    saveState: {
      request: false,
      error: false
    },
    initialization: {
      done: false,
      pending: false,
      error: false,
      counter: 0
    },
    columnMetadata: []
  },
  charts: {
    "4": {
      autoSize: true,
      type: "pie",
      title: "",
      filters: [],
      measures: [
        {
          isError: false,
          isRequired: false,
          inactive: false,
          name: "val",
          label: "amount",
          value: "amount",
          type: "INT",
          aggType: "Sum",
          custom: false,
          originIndex: 0,
          is_dict: false
        },
        {
          inactive: false,
          name: "color",
          isError: false,
          isRequired: false
        }
      ],
      dimensions: [
        {
          inactive: false,
          name: null,
          isError: false,
          isRequired: false,
          type: "STR",
          is_dict: true,
          label: "recipient_party",
          value: "recipient_party",
          max_val: null,
          min_val: null,
          maxBinSize: null,
          currentHighValue: null,
          currentLowValue: null,
          autobin: false,
          numOfBins: null,
          isBinned: false,
          isBinnable: false
        },
        {
          isError: false,
          isRequired: false
        }
      ],
      binParams: null,
      height: 601,
      width: 415,
      elasticX: true,
      cap: 12,
      othersGrouper: false,
      ticks: 3,
      sortColumn: "val",
      color: null,
      ordering: "desc",
      areFiltersInverse: false,
      hasError: false,
      rangeFilter: []
    },
    "5": {
      autoSize: true,
      type: "line",
      title: "",
      filters: [["1997-03-01T00:00:00.000Z", "1998-01-01T00:00:00.000Z"]],
      measures: [
        {
          isError: false,
          isRequired: false,
          inactive: false,
          name: "series_1",
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          aggType: "Count",
          custom: false,
          originIndex: 0
        }
      ],
      dimensions: [
        {
          isError: false,
          isRequired: false,
          inactive: false,
          name: "X Axis",
          type: "DATE",
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
      ],
      binParams: null,
      height: 601,
      width: 415,
      elasticX: true,
      cap: 12,
      othersGrouper: false,
      ticks: 3,
      sortColumn: null,
      color: null,
      ordering: "desc",
      areFiltersInverse: false,
      hasError: false,
      rangeFilter: []
    },
    "7": {
      autoSize: true,
      type: "row",
      title: "",
      filters: [],
      measures: [
        {
          isError: false,
          isRequired: false,
          inactive: false,
          name: "val",
          type: "INT",
          is_dict: false,
          label: "amount",
          value: "amount",
          aggType: "Avg",
          custom: false,
          originIndex: 0
        },
        {
          inactive: false,
          name: "color",
          isError: false,
          isRequired: false
        }
      ],
      dimensions: [
        {
          inactive: false,
          name: null,
          isError: false,
          isRequired: false,
          type: "STR",
          is_dict: true,
          label: "committee_name",
          value: "committee_name",
          max_val: null,
          min_val: null,
          maxBinSize: null,
          currentHighValue: null,
          currentLowValue: null,
          autobin: false,
          numOfBins: null,
          isBinned: false,
          isBinnable: false
        },
        {
          isError: false,
          isRequired: false
        }
      ],
      binParams: null,
      height: 546,
      width: 415,
      elasticX: true,
      cap: 12,
      othersGrouper: false,
      ticks: 3,
      sortColumn: "val",
      color: {
        type: "solid",
        key: "blue",
        val: ["#27aeef"]
      },
      ordering: "desc",
      areFiltersInverse: false,
      hasError: false,
      rangeFilter: []
    },
    "8": {
      autoSize: true,
      type: "choropleth",
      title: "",
      filters: [],
      measures: [
        {
          isError: false,
          isRequired: false,
          inactive: false,
          name: "val",
          type: "FLOAT",
          is_dict: false,
          label: "merc_y",
          value: "merc_y",
          aggType: "Avg",
          custom: false,
          originIndex: 0
        }
      ],
      dimensions: [
        {
          isError: false,
          isRequired: false,
          inactive: false,
          name: "geo",
          type: "FLOAT",
          is_dict: false,
          label: "merc_x",
          value: "merc_x",
          min_val: -19659010,
          max_val: 16222996,
          currentLowValue: -19659010,
          currentHighValue: 16222996,
          isBinned: true,
          isBinnable: true,
          numOfBins: 12,
          autobin: true,
          maxBinSize: 250
        }
      ],
      binParams: null,
      height: 601,
      width: 415,
      elasticX: true,
      cap: 12,
      othersGrouper: false,
      ticks: 3,
      sortColumn: null,
      color: null,
      ordering: "desc",
      areFiltersInverse: false,
      geoJson: null,
      hasError: false,
      rangeFilter: []
    }
  },
  chartEditor: {
    editId: "1",
    savedCharts: {
      "7": {
        type: "row",
        title: "",
        filters: [],
        measures: [
          {
            isError: false,
            isRequired: false,
            inactive: false,
            name: "val",
            type: "INT",
            is_dict: false,
            label: "amount",
            value: "amount",
            aggType: "Avg",
            custom: false,
            originIndex: 0
          },
          {
            inactive: false,
            name: "color",
            isError: false,
            isRequired: false
          }
        ],
        dimensions: [
          {
            inactive: false,
            name: null,
            isError: false,
            isRequired: false,
            type: "STR",
            is_dict: true,
            label: "committee_name",
            value: "committee_name",
            max_val: null,
            min_val: null,
            maxBinSize: null,
            currentHighValue: null,
            currentLowValue: null,
            autobin: false,
            numOfBins: null,
            isBinned: false,
            isBinnable: false
          },
          {
            isError: false,
            isRequired: false
          }
        ],
        binParams: null,
        height: 252,
        width: 250,
        elasticX: true,
        cap: 12,
        othersGrouper: false,
        ticks: 3,
        sortColumn: "val",
        color: {
          type: "solid",
          key: "blue",
          val: ["#27aeef"]
        },
        ordering: "desc",
        areFiltersInverse: false,
        hasError: false,
        rangeFilter: []
      }
    },
    savedFilters: {
      "7": [
        {
          appliesTo: "CHART",
          chartId: "7",
          name: "-LrFK-ldPB5KvjwK5qIc",
          enabled: true,
          dataSources: ["contributions"],
          filter: {
            filterType: FILTER_TYPE_SIMPLE,
            dataExpression: "committee_name",
            dataSource: "contributions",
            dataType: "STR",
            operator: "=",
            value: "test string"
          }
        }
      ]
    }
  },
  tables: {
    list: [{ name: "table1" }, { name: "table2" }],
    loading: false,
    error: false
  },
  dashboards: {
    list: [],
    loading: false,
    error: false,
    done: false,
    delete: {
      view: "",
      done: false,
      loading: false,
      error: false
    }
  },
  filters: [],
  ui: {
    showClearFiltersDropdown: false,
    modal: {
      open: false,
      content: "",
      header: ""
    },
    selectorPillHover: {
      shouldShowPrompt: false,
      top: 0,
      message: ""
    },
    filters: {
      filterEditing: {},
      newlyCreated: {}
    },
    filterPanel: {
      viewMode: "FILTER_SETS"
    }
  },
  dc: {
    initialRender: {
      done: true,
      pending: false,
      error: false,
      numCharts: 5,
      counter: 5
    },
    render: {
      done: true,
      pending: false,
      error: false
    },
    redraw: {
      done: false,
      pending: false,
      error: false
    },
    redrawAll: {
      done: true,
      pending: false,
      error: false
    },
    renderAll: {
      done: false,
      pending: false,
      error: false
    }
  },
  app: {
    error: false,
    lastChartUpdateAction: {
      type: "UPDATE_CHART",
      chartId: "8",
      payload: {
        height: 601,
        width: 415
      }
    }
  },
  importer: {
    error: false,
    importComplete: null,
    settings: {
      null_str: "",
      delimiter: "",
      quoted: true,
      is_replicated: false
    },
    loading: false,
    data: {
      copy_params: {},
      row_set: {
        changed_columns: [],
        columns: [],
        is_columnar: false,
        row_desc: [
          { col_name: "col1", clean_col_name: "col1", col_type: { type: 0 } },
          { col_name: "col2", clean_col_name: "col2", col_type: { type: 0 } }
        ],
        rows: [
          {
            cols: [
              { is_null: false, val: { str_val: "val1" } },
              { is_null: false, val: { str_val: "val2" } }
            ]
          },
          {
            cols: [
              { is_null: false, val: { str_val: "val3" } },
              { is_null: false, val: { str_val: "val4" } }
            ]
          }
        ]
      }
    }
  },
  tablePreview: {
    loading: false,
    error: false,
    fields: [],
    rowCount: 0
  },
  filterZones: {
    "-LqwtP3FIhrzcqxR75a_": {
      id: "-LqwtP3FIhrzcqxR75a_",
      name: "Default Filter Set",
      filters: ["-Lqx6fHovuxS-63-E8xy", "-LrFK-ldPB5KvjwK5qIb"],
      selected: true,
      dimensions: {}
    }
  },
  omnifilters: [
    {
      appliesTo: "GLOBAL",
      name: "-LrFK-ldPB5KvjwK5qIb",
      enabled: true,
      dataSources: ["contributions"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: "amount",
        dataSource: "contributions",
        dataType: "INT",
        operator: ">",
        value: "1"
      }
    },
    {
      appliesTo: "CROSSFILTER",
      crossfilterId: 2,
      index: 1,
      name: "-LrFK3prrUQH8ZUHcEkw",
      dataSources: ["contributions"],
      enabled: true,
      filter: {
        filterType: FILTER_TYPE_SQL,
        dataSource: "contributions",
        sql: "(contributions.candidacy_status = 'f')"
      }
    },
    {
      appliesTo: "CHART",
      chartId: "7",
      name: "-LrFK-ldPB5KvjwK5qIc",
      enabled: true,
      dataSources: ["contributions"],
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: "committee_name",
        dataSource: "contributions",
        dataType: "STR",
        operator: "=",
        value: "test string"
      }
    }
  ],
  autosuggest: {
    error: false,
    loading: false,
    results: {}
  },
  settings: {
    users: {
      loading: false,
      metadata: []
    },
    roles: {
      loading: false,
      metadata: []
    }
  },
  userConfigurableUI: {
    serversJSONColors: {},
    savedDatabaseStyles: {},
    previewStyles: {}
  },
  joinDataSources: [],
  sharedSettings: {}
}
/* eslint-enable */
