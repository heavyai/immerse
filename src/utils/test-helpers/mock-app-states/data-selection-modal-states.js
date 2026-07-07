// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CUSTOM_SQL_MANAGER } from "constants/modal-types"

export const EMPTY_DASHBOARD_STATE = {
  charts: {},
  omnifilters: [],
  dashboard: {
    dataSources: {}
  },
  tables: {
    list: [
      {
        name: "flights_donotmodify",
        label: "obs"
      },
      {
        name: "contributions_donotmodify",
        label: "obs"
      }
    ]
  },
  ui: {
    modal: {
      type: CUSTOM_SQL_MANAGER,
      open: true,
      content: "",
      header: "",
      primaryAction: {
        text: "OK"
      },
      secondaryAction: {
        text: "CANCEL"
      }
    },
    filters: {
      filterEditing: {},
      newlyCreated: {}
    },
    filterPanel: {
      viewMode: "FILTER_SETS"
    },
    customSQLManagerProps: {},
    customSQLFilterError: ""
  },
  cohorts: {}
}

// State with one chart using dataSource `flights_donotmodify`, which has one row
export const ONE_CHART_ONE_DATASOURCE_STATE = {
  omnifilters: [],
  dashboard: {
    dataSources: {
      flights_donotmodify: {
        alias: "A",
        columnMetadata: [
          {
            table: "flights_donotmodify",
            column: "flight_year",
            label: "flight_year",
            type: "SMALLINT",
            precision: 0,
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false,
            value: "flight_year"
          }
        ]
      }
    }
  },
  tables: {
    list: [
      {
        name: "flights_donotmodify",
        label: "obs"
      },
      {
        name: "contributions_donotmodify",
        label: "obs"
      }
    ]
  },
  ui: {
    modal: {
      type: null,
      open: false,
      content: "",
      header: "",
      primaryAction: {
        text: "OK"
      },
      secondaryAction: {
        text: "CANCEL"
      }
    },
    filters: {
      filterEditing: {},
      newlyCreated: {}
    },
    filterPanel: {
      viewMode: "FILTER_SETS"
    },
    customSQLManagerProps: {
      customSQLType: "SUBMIT_CUSTOM_SQL_FILTER"
    },
    customSQLFilterError: ""
  },
  cohorts: {}
}

// state where user has clicked "add custom SQL filter"
export const ADD_CUSTOM_SQL_STATE = {
  charts: {},
  omnifilters: [],
  dashboard: {
    dataSources: {}
  },
  tables: {
    list: [
      {
        name: "flights_donotmodify",
        label: "obs"
      },
      {
        name: "contributions_donotmodify",
        label: "obs"
      }
    ]
  },
  ui: {
    modal: {
      type: CUSTOM_SQL_MANAGER,
      open: true,
      content: "",
      header: "",
      primaryAction: {
        text: "OK"
      },
      secondaryAction: {
        text: "CANCEL"
      }
    },
    filters: {
      filterEditing: {},
      newlyCreated: {}
    },
    filterPanel: {
      viewMode: "FILTER_SETS"
    },
    customSQLManagerProps: {
      customSQLDataSource: "",
      customSQLType: "SUBMIT_CUSTOM_SQL_FILTER"
    },
    customSQLFilterError: ""
  },
  cohorts: {}
}
