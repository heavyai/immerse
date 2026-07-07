// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ChartFieldAssignment,
  ChartTypes,
  VegaTypeMap
} from "components/sql-notebook/types"

export enum SETTING_KEY {
  POINT_SIZE,
  DATA_LIMIT,
  SCALE_TYPE,
  BORDER,
  CLAMP,
  SIZE_SLIDER
}

export const CHART_SETTINGS_MAP: { [key: string]: Array<SETTING_KEY> } = {
  [ChartTypes.HISTOGRAM]: [SETTING_KEY.DATA_LIMIT],
  [ChartTypes.BAR]: [
    SETTING_KEY.DATA_LIMIT,
    SETTING_KEY.SCALE_TYPE,
    SETTING_KEY.CLAMP
  ],
  [ChartTypes.LAYERED_BAR]: [
    SETTING_KEY.DATA_LIMIT,
    SETTING_KEY.SCALE_TYPE,
    SETTING_KEY.CLAMP
  ],
  [ChartTypes.PIE]: [SETTING_KEY.DATA_LIMIT],
  [ChartTypes.LINE]: [
    SETTING_KEY.DATA_LIMIT,
    SETTING_KEY.SCALE_TYPE,
    SETTING_KEY.CLAMP
  ],
  [ChartTypes.LAYERED_LINE]: [
    SETTING_KEY.DATA_LIMIT,
    SETTING_KEY.SCALE_TYPE,
    SETTING_KEY.CLAMP
  ],
  [ChartTypes.SCATTER]: [
    SETTING_KEY.DATA_LIMIT,
    SETTING_KEY.SIZE_SLIDER,
    SETTING_KEY.SCALE_TYPE,
    SETTING_KEY.CLAMP
  ],
  [ChartTypes.HEATMAP]: [SETTING_KEY.DATA_LIMIT, SETTING_KEY.SCALE_TYPE],
  [ChartTypes.VEGA_CHOROPLETH]: [
    SETTING_KEY.DATA_LIMIT,
    SETTING_KEY.SCALE_TYPE,
    SETTING_KEY.BORDER
  ]
}

/**
 * Given a chart type and field assignment (eg. x axis), returns valid
 * VegaTypeMap types from the results. This allows us to filter
 * the query result fields, per chart and per assigned field
 */
type ValidFieldAssignments = {
  [key in ChartFieldAssignment]?: Array<VegaTypeMap>
}
export const AllowedVegaTypesPerChartField: {
  [key in ChartTypes]?: ValidFieldAssignments
} = {
  [ChartTypes.HISTOGRAM]: {
    [ChartFieldAssignment.X]: [VegaTypeMap.NUMBER, VegaTypeMap.STRING]
  },
  [ChartTypes.BAR]: {
    [ChartFieldAssignment.X]: [
      VegaTypeMap.NUMBER,
      VegaTypeMap.STRING,
      VegaTypeMap.DATE
    ],
    [ChartFieldAssignment.Y]: [VegaTypeMap.NUMBER, VegaTypeMap.DATE],
    [ChartFieldAssignment.COLOR]: [
      VegaTypeMap.NUMBER,
      VegaTypeMap.STRING,
      VegaTypeMap.DATE
    ]
  },
  [ChartTypes.LAYERED_BAR]: {
    [ChartFieldAssignment.X]: [VegaTypeMap.STRING],
    [ChartFieldAssignment.Y1]: [VegaTypeMap.NUMBER],
    [ChartFieldAssignment.Y2]: [VegaTypeMap.NUMBER],
    [ChartFieldAssignment.Y3]: [VegaTypeMap.NUMBER],
    [ChartFieldAssignment.Y4]: [VegaTypeMap.NUMBER],
    [ChartFieldAssignment.Y5]: [VegaTypeMap.NUMBER]
  },
  [ChartTypes.LINE]: {
    [ChartFieldAssignment.X]: [VegaTypeMap.DATE, VegaTypeMap.NUMBER],
    [ChartFieldAssignment.Y]: [VegaTypeMap.NUMBER, VegaTypeMap.DATE],
    [ChartFieldAssignment.COLOR]: [
      VegaTypeMap.STRING,
      VegaTypeMap.NUMBER,
      VegaTypeMap.DATE
    ]
  },
  [ChartTypes.LAYERED_LINE]: {
    [ChartFieldAssignment.X]: [VegaTypeMap.DATE],
    [ChartFieldAssignment.Y1]: [VegaTypeMap.NUMBER],
    [ChartFieldAssignment.Y2]: [VegaTypeMap.NUMBER],
    [ChartFieldAssignment.Y3]: [VegaTypeMap.NUMBER],
    [ChartFieldAssignment.Y4]: [VegaTypeMap.NUMBER],
    [ChartFieldAssignment.Y5]: [VegaTypeMap.NUMBER]
  },
  [ChartTypes.SCATTER]: {
    [ChartFieldAssignment.X]: [VegaTypeMap.NUMBER, VegaTypeMap.DATE],
    [ChartFieldAssignment.Y]: [VegaTypeMap.NUMBER, VegaTypeMap.DATE],
    [ChartFieldAssignment.COLOR]: [
      VegaTypeMap.STRING,
      VegaTypeMap.NUMBER,
      VegaTypeMap.DATE
    ],
    [ChartFieldAssignment.SIZE]: [
      VegaTypeMap.STRING,
      VegaTypeMap.NUMBER,
      VegaTypeMap.DATE
    ]
  },
  [ChartTypes.HEATMAP]: {
    [ChartFieldAssignment.X]: [VegaTypeMap.NUMBER, VegaTypeMap.DATE],
    [ChartFieldAssignment.Y]: [VegaTypeMap.NUMBER, VegaTypeMap.DATE],
    [ChartFieldAssignment.COLOR]: [VegaTypeMap.NUMBER, VegaTypeMap.DATE]
  },
  [ChartTypes.VEGA_CHOROPLETH]: {
    [ChartFieldAssignment.JOIN]: [VegaTypeMap.NUMBER, VegaTypeMap.STRING],
    [ChartFieldAssignment.COLOR]: [
      VegaTypeMap.NUMBER,
      VegaTypeMap.STRING,
      VegaTypeMap.DATE
    ]
  },
  [ChartTypes.POINT_MAP]: {
    [ChartFieldAssignment.POINT]: [VegaTypeMap.POINT],
    [ChartFieldAssignment.LAT]: [VegaTypeMap.LATITUDE],
    [ChartFieldAssignment.LON]: [VegaTypeMap.LONGITUDE],
    [ChartFieldAssignment.COLOR]: [
      VegaTypeMap.NON_LOCATION_NUMBER,
      VegaTypeMap.NUMBER,
      VegaTypeMap.STRING
    ],
    [ChartFieldAssignment.SIZE]: [
      VegaTypeMap.NON_LOCATION_NUMBER,
      VegaTypeMap.NUMBER
    ]
  },
  [ChartTypes.POLYGON_MAP]: {
    [ChartFieldAssignment.GEOM]: [VegaTypeMap.POLYGON],
    [ChartFieldAssignment.COLOR]: [VegaTypeMap.NUMBER, VegaTypeMap.STRING]
  },
  [ChartTypes.LINE_MAP]: {
    [ChartFieldAssignment.GEOM]: [VegaTypeMap.LINE],
    [ChartFieldAssignment.COLOR]: [VegaTypeMap.NUMBER, VegaTypeMap.STRING],
    [ChartFieldAssignment.SIZE]: [VegaTypeMap.NUMBER]
  }
}

export enum SCALE_TYPES {
  LINEAR = "linear",
  LOG = "log",
  QUANTILE = "quantile"
}

export const BIN_LIMIT = {
  [ChartTypes.BAR]: 2000,
  [ChartTypes.HEATMAP]: 50000
}

export const DEFAULT_VEGA_SCATTER_POINT_SIZE = 30
