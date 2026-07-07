// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { uniq } from "lodash"
import {
  ChartDef,
  ChartTypes,
  ChartField,
  VegaTypeMap,
  ChartFieldAssignment,
  ChartTypeState,
  ChartSettings
} from "../../types"
import {
  SCALE_TYPES,
  BIN_LIMIT,
  DEFAULT_VEGA_SCATTER_POINT_SIZE
} from "../chart-settings/constants"
import countries from "charts/geojson/countries-upper.json"
import us10mEnriched from "charts/geojson/enriched-us-10m-upper.json"
import { DEFAULT_POINT_SIZE } from "../vega-map/constants"
import {
  LINE_RENDER_LIMIT_DEFAULT,
  POINT_RENDER_LIMIT_DEFAULT,
  POLYGON_RENDER_LIMIT_DEFAULT
} from "components/sql-notebook/constants"

const UNBINNED = "Unbinned"
const getMinMax = (data: any, column: string, stride: number): number[] => {
  const validNumbers = data
    .map((item) => item[column])
    .filter((value) => typeof value === "number" && !isNaN(value))
    .sort((a, b) => a - b)

  if (validNumbers.length === 0) {
    return [null, null]
  }

  return [validNumbers[0], validNumbers[validNumbers.length - 1] + stride]
}

const calculateStride = (data: any, dimension: string): number | string => {
  // Step 1: Use a Set to get unique values for the specified dimension
  const groupedValues = [...new Set(data.map((item) => item[dimension]))]

  // Step 2: Sort the grouped values
  groupedValues.sort((a, b) => a - b)

  // Step 3: Calculate the difference between successive values from the sorted array
  const differences = []
  for (let i = 1; i < groupedValues.length; i++) {
    differences.push(groupedValues[i] - groupedValues[i - 1])
  }

  // Step 4: Count occurrences of each difference
  const differenceCounts = differences.reduce((acc, diff) => {
    acc[diff] = (acc[diff] || 0) + 1
    return acc
  }, {})

  // Step 5: Find the most common difference
  const differenceKeys = Object.keys(differenceCounts)
  if (!differenceKeys.length) {
    return UNBINNED
  }
  const mostCommonDifference = differenceKeys.reduce((a, b) =>
    differenceCounts[a] > differenceCounts[b] ? a : b
  )

  // Step 6: Check if the most common difference occurs in at least 70% of cases
  const majorityThreshold = 0.1
  const majorityCount = differenceCounts[mostCommonDifference]
  const isConsistentStride =
    majorityCount / differences.length >= majorityThreshold

  // Step 7: Return the stride or indicate unbinned data
  return isConsistentStride ? parseFloat(mostCommonDifference) : UNBINNED
}

const getAvailableScales = (
  data: any,
  column: string,
  quantile = true
): SCALE_TYPES[] => {
  const scales = quantile
    ? [SCALE_TYPES.LINEAR, SCALE_TYPES.QUANTILE]
    : [SCALE_TYPES.LINEAR]
  const minMaxColor = getMinMax(data, column, 0)
  if (minMaxColor[0] > 0) {
    scales.push(SCALE_TYPES.LOG)
  }
  return scales
}

const getFields = (data: any, column: string): string[] => [
  ...new Set(data.map((d) => d[column]))
]

const validYAssignments = [
  ChartFieldAssignment.Y1,
  ChartFieldAssignment.Y2,
  ChartFieldAssignment.Y3,
  ChartFieldAssignment.Y4,
  ChartFieldAssignment.Y5
]
const getYFields = (state: ChartTypeState): ChartField[] =>
  Object.keys(state)
    .filter((key) => validYAssignments.includes(key as ChartFieldAssignment))
    .map((key) => ({
      field: state[key].field,
      type: state[key].type,
      active: true,
      required: true,
      assignedTo: `${key}`
    }))

const makeVegaLiteSpec = (
  mark: any | undefined,
  data: any,
  encoding: any,
  config: any | null = null,
  transform: any | null = null,
  projection: any | null = null,
  layer: any | null = null
): any => ({
  width: "container",
  height: "container",
  mark,
  encoding,
  data,
  ...(config && { config }),
  ...(transform && { transform }),
  ...(projection && { projection }),
  ...(layer && { layer })
})

const makeLayeredVegaLiteSpec = (
  mark: string,
  encoding: any,
  config: any | null,
  repeat: any | null
): any => ({
  width: "container",
  height: "container",
  data: { name: "table" },
  spec: {
    mark,
    encoding
  },
  ...(config && { config }),
  ...(repeat && { repeat })
})

export const histogram = (state: ChartTypeState, data?: any): ChartDef => {
  let xBinning = null
  let xBinned = false
  if (state.x.type === VegaTypeMap.NUMBER) {
    if (state.x.binning) {
      xBinning = { bin: { maxbins: state.x.numBins } }
      xBinned = true
    } else {
      const xStride = calculateStride(data, state.x.field)

      if (typeof xStride === "number") {
        const xMinMax = getMinMax(data, state.x.field, xStride)
        xBinning = {
          bin: { binned: true, step: xStride },
          scale: { domain: xMinMax }
        }
        xBinned = true
      } else {
        xBinning = { bin: true }
      }
    }
  }

  return {
    type: ChartTypes.HISTOGRAM,
    spec: makeVegaLiteSpec(
      "bar",
      { name: "table" },
      {
        x: {
          field: state.x.field,
          type: state.x.type,
          ...(xBinning && xBinning)
        },
        y: { aggregate: "count" },
        tooltip: [{ field: state.x.field, type: state.x.type }]
      }
    ),
    fields: [
      {
        ...state.x,
        required: true,
        active: true,
        assignedTo: ChartFieldAssignment.X
      }
    ],
    settings: {
      ...(xBinning && { binnableFields: [ChartFieldAssignment.X] }),
      ...(xBinning && { binned: xBinned })
    },
    update: histogram
  }
}

export const barChart = (
  state: ChartTypeState,
  data: any,
  settings?: ChartSettings
): ChartDef => {
  const availableScales =
    state.y.type === VegaTypeMap.NUMBER
      ? getAvailableScales(data, state.y.field, false)
      : undefined

  let xBinning = null
  let xBinned = false
  if (state.x.type === VegaTypeMap.NUMBER) {
    if (state.x.binning) {
      xBinning = { bin: { maxbins: state.x.numBins } }
      xBinned = true
    } else {
      const xStride = calculateStride(data, state.x.field)

      if (typeof xStride === "number") {
        // check to ensure we don't exceed bin limit
        let xMinMax = getMinMax(data, state.x.field, 0)
        if ((xMinMax[1] - xMinMax[0]) / xStride <= BIN_LIMIT[ChartTypes.BAR]) {
          xMinMax = getMinMax(data, state.x.field, xStride)
          xBinning = {
            bin: { binned: true, step: xStride },
            scale: { domain: xMinMax, zero: settings?.clamp ?? false }
          }
          xBinned = true
        } else {
          xBinning = { bin: true }
        }
      } else {
        xBinning = { bin: true }
      }
    }
  }

  return state.color?.active
    ? {
        type: ChartTypes.BAR,
        spec: makeVegaLiteSpec(
          "bar",
          { name: "table" },
          {
            x: {
              field: state.x.field,
              type: state.x.type,
              ...(state.x.type === VegaTypeMap.STRING && { sort: null }),
              ...(state.x.type === VegaTypeMap.NUMBER && {
                scale: { zero: settings?.clamp ?? false }
              }),
              ...(xBinning && xBinning)
            },
            y: {
              field: state.y.field,
              type: state.y.type,
              ...(state.y.type === VegaTypeMap.NUMBER && {
                scale: {
                  type: settings?.scaleType ?? SCALE_TYPES.LINEAR,
                  zero: settings?.clamp ?? false
                }
              })
            },
            xOffset: {
              field: state.color.field,
              type: state.color.type
            },
            color: {
              field: state.color.field,
              type: state.color.type,
              scale: {
                scheme:
                  state.color.type === VegaTypeMap.STRING
                    ? "category20"
                    : "viridis"
              }
            },
            tooltip: [
              { field: state.x.field, type: state.x.type },
              { field: state.y.field, type: state.y.type },
              { field: state.color.field, type: state.color.type }
            ]
          }
        ),
        fields: [
          {
            ...state.x,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.X
          },
          {
            ...state.y,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.Y
          },
          {
            ...state.color,
            required: false,
            active: true,
            assignedTo: ChartFieldAssignment.X_OFFSET
          },
          {
            ...state.color,
            required: false,
            active: true,
            assignedTo: ChartFieldAssignment.COLOR
          }
        ],
        settings: {
          ...settings,
          availableScales,
          ...(xBinning && { binnableFields: [ChartFieldAssignment.X] }),
          ...(xBinning && { binned: xBinned })
        },
        update: barChart
      }
    : {
        type: ChartTypes.BAR,
        spec: makeVegaLiteSpec(
          "bar",
          { name: "table" },
          {
            x: {
              field: state.x.field,
              type: state.x.type,
              ...(state.x.type === VegaTypeMap.STRING && { sort: null }),
              ...(state.x.type === VegaTypeMap.NUMBER && {
                scale: { zero: settings?.clamp ?? false }
              }),
              ...(xBinning && xBinning)
            },
            y: {
              field: state.y.field,
              type: state.y.type,
              ...(state.y.type === VegaTypeMap.NUMBER && {
                scale: {
                  type: settings?.scaleType ?? SCALE_TYPES.LINEAR,
                  zero: settings?.clamp ?? false
                }
              })
            },
            tooltip: [
              { field: state.x.field, type: state.x.type },
              { field: state.y.field, type: state.y.type }
            ]
          }
        ),
        fields: [
          {
            ...state.x,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.X
          },
          {
            ...state.y,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.Y
          },
          ...(state.color && !state.color.active
            ? [{ ...state.color, assignedTo: ChartFieldAssignment.COLOR }]
            : [])
        ],
        settings: {
          ...settings,
          availableScales,
          ...(xBinning && { binnableFields: [ChartFieldAssignment.X] }),
          ...(xBinning && { binned: xBinned })
        },
        update: barChart
      }
}

export const layeredBarChart = (
  state: ChartTypeState,
  data: any,
  settings?: ChartSettings
): ChartDef => {
  const yFields = getYFields(state)
  const yScales = yFields.map((yField) =>
    getAvailableScales(data, yField.field, false)
  )
  const availableScales = yScales.reduce((intersection, currentScales) =>
    intersection.filter((s) => currentScales.includes(s))
  )

  return {
    type: ChartTypes.LAYERED_BAR,
    spec: makeLayeredVegaLiteSpec(
      "bar",
      {
        x: {
          field: state.x.field,
          type: state.x.type,
          ...(state.x.type === VegaTypeMap.STRING && { sort: null })
        },
        y: {
          aggregate: "sum",
          field: { repeat: "layer" },
          scale: {
            type: settings?.scaleType ?? SCALE_TYPES.LINEAR,
            zero: settings?.clamp ?? false
          },
          type: yFields[0].type,
          title: " "
        },
        xOffset: {
          datum: { repeat: "layer" }
        },
        color: {
          datum: { repeat: "layer" }
        },
        tooltip: [
          { field: state.x.field, type: state.x.type },
          ...yFields.map((yField) => ({
            field: yField.field,
            type: yField.type
          }))
        ]
      },
      null,
      { layer: Array.from(new Set(yFields.map((yField) => yField.field))) }
    ),
    fields: [
      {
        ...state.x,
        required: true,
        active: true,
        assignedTo: ChartFieldAssignment.X
      },
      ...yFields
    ],
    settings: {
      ...settings,
      availableScales
    },
    update: layeredBarChart
  }
}

export const pieChart = (state: ChartTypeState): ChartDef => ({
  type: ChartTypes.PIE,
  spec: makeVegaLiteSpec(
    "arc",
    { name: "table" },
    {
      theta: { field: state.theta.field, type: state.theta.type },
      color: {
        field: state.color.field,
        type: state.color.type,
        scale: {
          scheme:
            state.color.type === VegaTypeMap.STRING ? "category20" : "viridis"
        }
      },
      tooltip: [
        { field: state.theta.field, type: state.theta.type },
        { field: state.color.field, type: state.color.type }
      ]
    }
  ),
  fields: [
    {
      ...state.theta,
      required: true,
      active: true,
      assignedTo: ChartFieldAssignment.THETA
    },
    {
      ...state.color,
      required: true,
      active: true,
      assignedTo: ChartFieldAssignment.COLOR
    }
  ],
  update: pieChart
})

export const lineChart = (
  state: ChartTypeState,
  data: any,
  settings?: ChartSettings
): ChartDef => {
  const availableScales =
    state.y.type === VegaTypeMap.NUMBER
      ? getAvailableScales(data, state.y.field, false)
      : undefined

  if (state.color?.active) {
    const colorFields = getFields(data, state.color.field)
    const tooltipFields = [
      { field: state.x.field, type: state.x.type, scale: { type: "utc" } },
      ...colorFields
        .sort()
        .slice(0, 20)
        .map((c) => ({ field: c, type: state.y.type }))
    ]

    return {
      type: ChartTypes.LINE,
      spec: makeVegaLiteSpec(
        undefined,
        { name: "table" },
        {
          x: {
            field: state.x.field,
            type: state.x.type,
            scale: { type: "utc" }
          }
        },
        null,
        null,
        null,
        [
          {
            encoding: {
              y: {
                field: state.y.field,
                type: state.y.type,
                ...(state.y.type === VegaTypeMap.NUMBER && {
                  scale: {
                    type: settings?.scaleType ?? SCALE_TYPES.LINEAR,
                    zero: settings?.clamp ?? false
                  }
                })
              },
              color: { field: state.color.field, type: state.color.type }
            },
            layer: [
              { mark: "line" },
              {
                transform: [{ filter: { param: "hover", empty: false } }],
                mark: "point"
              }
            ]
          },
          {
            transform: [
              {
                pivot: state.color.field,
                value: state.y.field,
                groupby: [state.x.field]
              }
            ],
            mark: "rule",
            encoding: {
              color: { value: "#AAAAAA" },
              opacity: {
                condition: { value: 0.7, param: "hover", empty: false },
                value: 0
              },
              tooltip: tooltipFields
            },
            params: [
              {
                name: "hover",
                select: {
                  type: "point",
                  fields: [state.x.field],
                  nearest: true,
                  on: "mouseover",
                  clear: "mouseout"
                }
              }
            ]
          }
        ]
      ),
      fields: [
        {
          ...state.x,
          required: true,
          active: true,
          assignedTo: ChartFieldAssignment.X
        },
        {
          ...state.y,
          required: true,
          active: true,
          assignedTo: ChartFieldAssignment.Y
        },
        {
          ...state.color,
          required: false,
          active: true,
          assignedTo: ChartFieldAssignment.COLOR
        }
      ],
      settings: {
        ...settings,
        availableScales
      },
      update: lineChart
    }
  } else {
    return {
      type: ChartTypes.LINE,
      spec: makeVegaLiteSpec(
        undefined,
        { name: "table" },
        {
          x: {
            field: state.x.field,
            type: state.x.type,
            scale: { type: "utc" }
          }
        },
        null,
        null,
        null,
        [
          {
            encoding: {
              y: {
                field: state.y.field,
                type: state.y.type,
                ...(state.y.type === VegaTypeMap.NUMBER && {
                  scale: { zero: settings?.clamp ?? false }
                })
              }
            },
            layer: [
              { mark: "line" },
              {
                transform: [{ filter: { param: "hover", empty: false } }],
                mark: "point"
              }
            ]
          },
          {
            mark: "rule",
            encoding: {
              color: { value: "#AAAAAA" },
              opacity: {
                condition: { value: 0.7, param: "hover", empty: false },
                value: 0
              },
              tooltip: [
                {
                  field: state.x.field,
                  type: state.x.type,
                  scale: { type: "utc" }
                },
                { field: state.y.field, type: state.y.type }
              ]
            },
            params: [
              {
                name: "hover",
                select: {
                  type: "point",
                  fields: [state.x.field],
                  nearest: true,
                  on: "mouseover",
                  clear: "mouseout"
                }
              }
            ]
          }
        ]
      ),
      fields: [
        {
          ...state.x,
          required: true,
          active: true,
          assignedTo: ChartFieldAssignment.X
        },
        {
          ...state.y,
          required: true,
          active: true,
          assignedTo: ChartFieldAssignment.Y
        },
        ...(state.color && !state.color.active
          ? [{ ...state.color, assignedTo: ChartFieldAssignment.COLOR }]
          : [])
      ],
      settings: {
        ...settings,
        availableScales
      },
      update: lineChart
    }
  }
}

export const layeredLineChart = (
  state: ChartTypeState,
  data: any,
  settings?: ChartSettings
): ChartDef => {
  const yFields = getYFields(state)
  const yScales = yFields.map((yField) =>
    getAvailableScales(data, yField.field, false)
  )
  const availableScales = yScales.reduce((intersection, currentScales) =>
    intersection.filter((s) => currentScales.includes(s))
  )

  return {
    type: ChartTypes.LAYERED_LINE,
    spec: makeVegaLiteSpec(
      undefined,
      { name: "table" },
      {
        x: {
          field: state.x.field,
          type: state.x.type,
          scale: { type: "utc" },
          ...(state.x.type === VegaTypeMap.STRING && { sort: null })
        }
      },
      null,
      null,
      null,
      [
        ...uniq(yFields, "field").map((yField) => ({
          encoding: {
            y: {
              aggregate: "sum",
              field: yField.field,
              type: yField.type,
              scale: {
                type: settings?.scaleType ?? SCALE_TYPES.LINEAR,
                zero: settings?.clamp ?? false
              },
              title: " "
            },
            color: {
              datum: yField.field
            }
          },
          layer: [
            { mark: "line" },
            {
              transform: [{ filter: { param: "hover", empty: false } }],
              mark: "point"
            }
          ]
        })),
        {
          mark: "rule",
          encoding: {
            color: { value: "#AAAAAA" },
            opacity: {
              condition: { value: 0.7, param: "hover", empty: false },
              value: 0
            },
            tooltip: [
              {
                field: state.x.field,
                type: state.x.type,
                scale: { type: "utc" }
              },
              ...yFields.map((yField) => ({
                field: yField.field,
                type: yField.type
              }))
            ]
          },
          params: [
            {
              name: "hover",
              select: {
                type: "point",
                fields: [state.x.field],
                nearest: true,
                on: "mouseover",
                clear: "mouseout"
              }
            }
          ]
        }
      ]
    ),
    fields: [
      {
        ...state.x,
        required: true,
        active: true,
        assignedTo: ChartFieldAssignment.X
      },
      ...yFields
    ],
    settings: {
      ...settings,
      availableScales
    },
    update: layeredLineChart
  }
}

export const scatterplot = (
  state: ChartTypeState,
  data: any,
  settings?: ChartSettings
): ChartDef => {
  let availableScales = null
  if (state.color) {
    availableScales =
      state.color.type === VegaTypeMap.NUMBER
        ? getAvailableScales(data, state.color.field)
        : undefined
  }

  return state.color?.active && state.size?.active
    ? {
        type: ChartTypes.SCATTER,
        spec: makeVegaLiteSpec(
          "circle",
          { name: "table" },
          {
            x: {
              field: state.x.field,
              type: state.x.type,
              ...(state.x.type === VegaTypeMap.NUMBER && {
                scale: { zero: settings?.clamp ?? false }
              })
            },
            y: {
              field: state.y.field,
              type: state.y.type,
              ...(state.y.type === VegaTypeMap.NUMBER && {
                scale: { zero: settings?.clamp ?? false }
              })
            },
            color: {
              field: state.color.field,
              type: state.color.type,
              scale: {
                ...(state.color.type === VegaTypeMap.NUMBER && {
                  type: settings?.scaleType ?? SCALE_TYPES.LINEAR
                }),
                scheme:
                  state.color.type === VegaTypeMap.STRING
                    ? "category20"
                    : "viridis"
              }
            },
            size: { field: state.size.field, type: state.size.type },
            tooltip: [
              { field: state.x.field, type: state.x.type },
              { field: state.y.field, type: state.y.type },
              { field: state.color.field, type: state.color.type },
              { field: state.size.field, type: state.size.type }
            ]
          }
        ),
        fields: [
          {
            ...state.x,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.X
          },
          {
            ...state.y,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.Y
          },
          {
            ...state.color,
            required: false,
            active: true,
            assignedTo: ChartFieldAssignment.COLOR
          },
          {
            ...state.size,
            required: false,
            active: true,
            assignedTo: ChartFieldAssignment.SIZE
          }
        ],
        settings: {
          ...settings,
          availableScales
        },
        update: scatterplot
      }
    : state.color?.active && !state.size?.active
    ? {
        type: ChartTypes.SCATTER,
        spec: makeVegaLiteSpec(
          {
            type: "circle",
            size: settings?.pointSize ?? DEFAULT_VEGA_SCATTER_POINT_SIZE
          },
          { name: "table" },
          {
            x: {
              field: state.x.field,
              type: state.x.type,
              ...(state.x.type === VegaTypeMap.NUMBER && {
                scale: { zero: settings?.clamp ?? false }
              })
            },
            y: {
              field: state.y.field,
              type: state.y.type,
              ...(state.y.type === VegaTypeMap.NUMBER && {
                scale: { zero: settings?.clamp ?? false }
              })
            },
            color: {
              field: state.color.field,
              type: state.color.type,
              scale: {
                ...(state.color.type === VegaTypeMap.NUMBER && {
                  type: settings?.scaleType ?? SCALE_TYPES.LINEAR
                }),
                scheme:
                  state.color.type === VegaTypeMap.STRING
                    ? "category20"
                    : "viridis"
              }
            },
            tooltip: [
              { field: state.x.field, type: state.x.type },
              { field: state.y.field, type: state.y.type },
              { field: state.color.field, type: state.color.type }
            ]
          }
        ),
        fields: [
          {
            ...state.x,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.X
          },
          {
            ...state.y,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.Y
          },
          {
            ...state.color,
            required: false,
            active: true,
            assignedTo: ChartFieldAssignment.COLOR
          },
          ...(state.size && !state.size.active
            ? [{ ...state.size, assignedTo: ChartFieldAssignment.SIZE }]
            : [])
        ],
        settings: {
          ...settings,
          availableScales
        },
        update: scatterplot
      }
    : state.size?.active && !state.color?.active
    ? {
        type: ChartTypes.SCATTER,
        spec: makeVegaLiteSpec(
          "circle",
          { name: "table" },
          {
            x: {
              field: state.x.field,
              type: state.x.type,
              ...(state.x.type === VegaTypeMap.NUMBER && {
                scale: { zero: settings?.clamp ?? false }
              })
            },
            y: {
              field: state.y.field,
              type: state.y.type,
              ...(state.y.type === VegaTypeMap.NUMBER && {
                scale: { zero: settings?.clamp ?? false }
              })
            },
            size: { field: state.size.field, type: state.size.type },
            tooltip: [
              { field: state.x.field, type: state.x.type },
              { field: state.y.field, type: state.y.type },
              { field: state.size.field, type: state.size.type }
            ]
          }
        ),
        fields: [
          {
            ...state.x,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.X
          },
          {
            ...state.y,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.Y
          },
          {
            ...state.size,
            required: false,
            active: true,
            assignedTo: ChartFieldAssignment.SIZE
          },
          ...(state.color && !state.color.active
            ? [{ ...state.color, assignedTo: ChartFieldAssignment.COLOR }]
            : [])
        ],
        settings,
        update: scatterplot
      }
    : {
        type: ChartTypes.SCATTER,
        spec: makeVegaLiteSpec(
          {
            type: "circle",
            size: settings?.pointSize ?? DEFAULT_VEGA_SCATTER_POINT_SIZE
          },
          { name: "table" },
          {
            x: {
              field: state.x.field,
              type: state.x.type,
              ...(state.x.type === VegaTypeMap.NUMBER && {
                scale: { zero: settings?.clamp ?? false }
              })
            },
            y: {
              field: state.y.field,
              type: state.y.type,
              ...(state.y.type === VegaTypeMap.NUMBER && {
                scale: { zero: settings?.clamp ?? false }
              })
            },
            tooltip: [
              { field: state.x.field, type: state.x.type },
              { field: state.y.field, type: state.y.type }
            ]
          }
        ),
        fields: [
          {
            ...state.x,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.X
          },
          {
            ...state.y,
            required: true,
            active: true,
            assignedTo: ChartFieldAssignment.Y
          },
          ...(state.color && !state.color.active
            ? [{ ...state.color, assignedTo: ChartFieldAssignment.COLOR }]
            : []),
          ...(state.size && !state.size.active
            ? [{ ...state.size, assignedTo: ChartFieldAssignment.SIZE }]
            : [])
        ],
        settings,
        update: scatterplot
      }
}

export const heatmap = (
  state: ChartTypeState,
  data: any,
  settings?: ChartSettings
): ChartDef => {
  let xBinning = null
  let xBinned = false
  if (state.x.binning) {
    xBinning = { bin: { maxbins: state.x.numBins } }
    xBinned = true
  } else if (state.x.type === VegaTypeMap.NUMBER) {
    const xStride = calculateStride(data, state.x.field)

    if (typeof xStride === "number") {
      let xMinMax = getMinMax(data, state.x.field, 0)
      if (
        (xMinMax[1] - xMinMax[0]) / xStride <=
        BIN_LIMIT[ChartTypes.HEATMAP]
      ) {
        xMinMax = getMinMax(data, state.x.field, xStride)
        xBinning = {
          bin: { binned: true, step: xStride },
          scale: { domain: xMinMax }
        }
        xBinned = true
      } else {
        xBinning = { bin: true }
      }
    } else {
      xBinning = { bin: true }
    }
  }

  let yBinning = null
  let yBinned = false
  if (state.y.binning) {
    yBinning = { bin: { maxbins: state.y.numBins } }
    yBinned = true
  } else if (state.y.type === VegaTypeMap.NUMBER) {
    const yStride = calculateStride(data, state.y.field)

    if (typeof yStride === "number") {
      let yMinMax = getMinMax(data, state.y.field, 0)
      if (
        (yMinMax[1] - yMinMax[0]) / yStride <=
        BIN_LIMIT[ChartTypes.HEATMAP]
      ) {
        yMinMax = getMinMax(data, state.y.field, yStride)
        yBinning = {
          bin: { binned: true, step: yStride },
          scale: { domain: yMinMax }
        }
        yBinned = true
      } else {
        yBinning = { bin: true }
      }
    } else {
      yBinning = { bin: true }
    }
  }

  if (state.color?.active) {
    const availableScales = getAvailableScales(data, state.color.field)

    return {
      type: ChartTypes.HEATMAP,
      spec: makeVegaLiteSpec(
        "rect",
        { name: "table" },
        {
          x: {
            field: state.x.field,
            type: state.x.type,
            ...xBinning
          },
          y: {
            field: state.y.field,
            type: state.y.type,
            ...yBinning
          },
          color: {
            field: state.color.field,
            type: state.color.type,
            scale: {
              ...(state.color.type === VegaTypeMap.NUMBER && {
                type: settings?.scaleType ?? SCALE_TYPES.LINEAR
              }),
              scheme: "viridis"
            }
          },
          tooltip: [
            { field: state.x.field, type: state.x.type },
            { field: state.y.field, type: state.y.type },
            { field: state.color.field, type: state.color.type }
          ]
        },
        { view: { stroke: "transparent" } },
        [
          {
            filter: {
              and: [
                { field: state.x.field, valid: true },
                { field: state.y.field, valid: true }
              ]
            }
          }
        ]
      ),
      fields: [
        {
          ...state.x,
          required: true,
          active: true,
          assignedTo: ChartFieldAssignment.X
        },
        {
          ...state.y,
          required: true,
          active: true,
          assignedTo: ChartFieldAssignment.Y
        },
        {
          ...state.color,
          required: false,
          active: true,
          assignedTo: ChartFieldAssignment.COLOR
        }
      ],
      settings: {
        ...settings,
        availableScales,
        binnableFields: [ChartFieldAssignment.X, ChartFieldAssignment.Y],
        binned: xBinned && yBinned
      },
      update: heatmap
    }
  } else {
    return {
      type: ChartTypes.HEATMAP,
      spec: makeVegaLiteSpec(
        "rect",
        { name: "table" },
        {
          x: {
            field: state.x.field,
            type: state.x.type,
            ...xBinning
          },
          y: {
            field: state.y.field,
            type: state.y.type,
            ...yBinning
          },
          color: {
            aggregate: "count",
            type: VegaTypeMap.NUMBER,
            scale: {
              scheme: "viridis"
            }
          },
          tooltip: [
            { field: state.x.field, type: state.x.type },
            { field: state.y.field, type: state.y.type }
          ]
        },
        { view: { stroke: "transparent" } },
        [
          {
            filter: {
              and: [
                { field: state.x.field, valid: true },
                { field: state.y.field, valid: true }
              ]
            }
          }
        ]
      ),
      fields: [
        {
          ...state.x,
          required: true,
          active: true,
          assignedTo: ChartFieldAssignment.X
        },
        {
          ...state.y,
          required: true,
          active: true,
          assignedTo: ChartFieldAssignment.Y
        },
        ...(state.color && !state.color.active
          ? [{ ...state.color, assignedTo: ChartFieldAssignment.COLOR }]
          : [])
      ],
      settings: {
        binnableFields: [ChartFieldAssignment.X, ChartFieldAssignment.Y],
        binned: xBinning && yBinning
      },
      update: heatmap
    }
  }
}

export const vegaChoropleth = (
  state: ChartTypeState,
  data: any,
  settings: ChartSettings = { border: true }
): ChartDef => {
  const dataBlock =
    state.join.joinDataset === "countries"
      ? { values: countries, format: { property: "features" } }
      : {
          values: us10mEnriched,
          format: { type: "topojson", feature: state.join.joinDataset }
        }

  const availableScales = getAvailableScales(data, state.color.field)

  return {
    type: ChartTypes.VEGA_CHOROPLETH,
    spec: makeVegaLiteSpec(
      settings?.border
        ? {
            type: "geoshape",
            stroke: "white",
            strokeWidth: 0.25
          }
        : "geoshape",
      dataBlock,
      {
        color: {
          field: state.color.field,
          type: state.color.type,
          scale: {
            ...(state.color.type === VegaTypeMap.NUMBER && {
              type: settings?.scaleType ?? SCALE_TYPES.LINEAR
            }),
            scheme:
              state.color.type === VegaTypeMap.STRING ? "category20" : "viridis"
          }
        },
        tooltip: [
          { field: state.color.field, type: state.color.type },
          { field: state.join.field, type: state.join.type }
        ]
      },
      null,
      [
        {
          lookup:
            state.join.joinField !== "id"
              ? `properties.${state.join.joinField}`
              : state.join.joinField,
          from: {
            data: {
              name: "table"
            },
            key: `${state.join.field}_join`,
            fields: [state.color.field, state.join.field]
          }
        }
      ],
      {
        type: state.join.joinDataset === "countries" ? "mercator" : "albersUsa"
      }
    ),
    fields: [
      {
        ...state.color,
        required: true,
        active: true,
        assignedTo: ChartFieldAssignment.COLOR
      },
      {
        ...state.join,
        required: true,
        active: true,
        static: true,
        assignedTo: ChartFieldAssignment.JOIN
      }
    ],
    settings: {
      ...settings,
      availableScales
    },
    update: vegaChoropleth
  }
}

const getMapConfig = (
  state: ChartTypeState,
  data: any,
  type: ChartTypes,
  settings: any
) => {
  const fields = Object.entries(state).map(([assignment, field]) => {
    return {
      ...field,
      assignedTo: assignment
    }
  })
  const { table, query } = data
  return {
    type,
    fields,
    table,
    query,
    settings
  }
}

export const pointMap = (state: ChartTypeState, data: any): ChartDef => {
  const pointMapDefaultSettings = {
    pointSize: DEFAULT_POINT_SIZE,
    dotDensity: true,
    renderLimit: POINT_RENDER_LIMIT_DEFAULT
  }
  return getMapConfig(
    state,
    data,
    ChartTypes.POINT_MAP,
    pointMapDefaultSettings
  )
}

export const polygonMap = (state: ChartTypeState, data: any): ChartDef => {
  const polygonMapDefaultSettings = {
    border: true,
    renderLimit: POLYGON_RENDER_LIMIT_DEFAULT
  }
  return getMapConfig(
    state,
    data,
    ChartTypes.POLYGON_MAP,
    polygonMapDefaultSettings
  )
}

export const lineMap = (state: ChartTypeState, data: any): ChartDef => {
  const lineMapDefaultSettings = {
    strokeWidth: 2,
    dotDensity: true,
    renderLimit: LINE_RENDER_LIMIT_DEFAULT
  }
  return getMapConfig(state, data, ChartTypes.LINE_MAP, lineMapDefaultSettings)
}
