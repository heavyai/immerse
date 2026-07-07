// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Spec } from "vega"
import { SpecOptions } from "vega/charts/combo-chart/row-spec"
import {
  BoxPlotCenterLineType,
  VegaMarkTypes
} from "vega/constants/data-selection-types"

const CROSSFILTER_OPACITY_TEST =
  "(length(selectedValues) > 0 && indexof(selectedValues, datum.dimension) === -1) || (length(negativeSelectedValues) > 0 && indexof(negativeSelectedValues, datum.dimension) >= 0)"

export const buildTooltipMark = (): NonNullable<Spec["marks"]>[0] => {
  return {
    name: "tooltipRule",
    type: "rule",
    clip: { path: { signal: "clip" } },
    interactive: false,
    encode: {
      update: {
        x: { value: 0 },
        x2: { signal: "width" },
        y: { signal: "isValid(tooltip && tooltip.y) ? tooltip.y : 0" },
        y2: { signal: "isValid(tooltip && tooltip.y) ? tooltip.y : 0" },
        stroke: { value: "black" },
        strokeOpacity: {
          signal: "isValid(tooltip && tooltip.y) ? 1 : 0"
        },
        strokeWidth: { value: 1 }
      }
    }
  }
}

const buildViolinPlotMark = (
  opts: SpecOptions
): NonNullable<Spec["marks"][0]> => {
  return {
    name: "violinPlot",
    type: "group",
    from: {
      facet: {
        data: "violinPlotTable",
        name: "dimensionColor",
        groupby: "dimensionColor"
      }
    },
    signals: [
      {
        name: "clip",
        update: "'M0,0h' + width + 'v' + height + 'h-' + width + 'Z'"
      },
      {
        name: "width",
        update: "bandwidth('dimension')"
      }
    ],
    clip: { path: { signal: "clip" } },
    encode: {
      enter: {
        xc: { scale: "layout", field: "dimensionColor" },
        width: { signal: "violinWidth" },
        height: { signal: "height" }
      },
      update: {
        x: {
          scale: "dimension",
          field: "dimensionColor"
        }
      }
    },
    data: [
      {
        name: "violin",
        source: "violinPlotTable",
        transform: [
          {
            type: "filter",
            expr: "datum.dimensionColor === parent.dimensionColor"
          },
          {
            type: "formula",
            // Transforms from bucketNumber to yscale value
            expr: "scale('bucketToYScale', datum.bucketNumber)",
            as: "yscaleval"
          }
        ]
      }
    ],
    scales: [
      {
        name: "vxscale",
        type: "linear",
        domain: { data: "violin", field: "bucketCount" },
        range: [0, { signal: "violinWidth" }]
      },
      /* Scale from bucketNumber -> primary measure domain (y axis RN) */
      {
        name: "bucketToYScale",
        type: "linear",
        domain: [0, opts.violinDistributionPrecision],
        range: { signal: "primaryMeasureDomain" },
        zero: false
      }
    ],
    marks: [
      {
        type: "area",
        from: { data: "violin" },
        name: "violinArea",
        interactive: true,
        encode: {
          enter: {
            orient: { value: "horizontal" }
          },
          update: {
            interpolate: { value: "monotone" },
            xc: { signal: "width / 2" },
            width: { signal: "scale('vxscale', datum.bucketCount)" },
            y: {
              field: "yscaleval",
              scale: "yscale"
            },
            fill: [
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              }
            ],
            fillOpacity: [
              {
                test: CROSSFILTER_OPACITY_TEST,
                value: 0.15
              },
              { value: 0.6 }
            ]
          }
        }
      }
    ]
  }
}

const buildOutliersMarks = () => {
  return {
    type: "symbol",
    from: { data: "outliers" },
    encode: {
      enter: {
        shape: { value: "circle" },
        fill: {
          test:
            "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
          field: "categoricalColor"
        },
        fillOpacity: [
          {
            test: CROSSFILTER_OPACITY_TEST,
            value: 0.15
          },
          { value: 1.0 }
        ],
        size: { value: 10 }
      },
      update: {
        xc: { signal: "width / 2" },
        y: { scale: "yscale", field: "measure0" }
      }
    }
  }
}

const buildBoxPlotMark = (opts: SpecOptions): NonNullable<Spec["marks"][0]> => {
  return {
    name: "boxPlot",
    type: "group",
    from: {
      facet: {
        data: "boxPlotTable",
        name: "boxGrouping",
        groupby: "dimension0"
      }
    },
    clip: {
      path: {
        signal: "clip"
      }
    },

    encode: {
      enter: {
        xc: { scale: "dimension", field: "dimension0" },
        width: { signal: "plotWidth" },
        height: { signal: "height" }
      },
      update: {
        x: {
          scale: "dimension",
          field: "dimension0"
        }
      }
    },
    signals: [
      {
        name: "width",
        update: "bandwidth('dimension')"
      },
      {
        name: "clip",
        update: "'M0,0h' + width + 'v' + height + 'h-' + width + 'Z'"
      }
    ],

    data: [
      {
        name: "summary",
        source: "stats",
        transform: [
          {
            type: "filter",
            expr: "datum.dimension0 === parent.dimension0"
          }
        ]
      },
      {
        name: "outliers",
        source: "outliersTable",
        transform: [
          {
            type: "filter",
            expr: "datum.dimension0 === parent.dimension0"
          }
        ]
      }
    ],
    marks: [
      {
        type: "rect",
        from: { data: "summary" },
        encode: {
          enter: {
            width: { value: 2 }
          },
          update: {
            xc: { signal: "width / 2" },
            y: { scale: "yscale", field: "measure0_q3" },
            y2: { scale: "yscale", field: "upperWhisker" },
            fill: [
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              }
            ],
            fillOpacity: [
              {
                test: CROSSFILTER_OPACITY_TEST,
                value: 0.15
              },
              { value: 1.0 }
            ]
          }
        }
      },
      {
        type: "rect",
        from: { data: "summary" },
        encode: {
          enter: {
            width: { value: 2 }
          },
          update: {
            xc: { signal: "width / 2" },
            y: { scale: "yscale", field: "measure0_q1" },
            y2: { scale: "yscale", field: "lowerWhisker" },
            fill: [
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              }
            ],
            fillOpacity: [
              {
                test: CROSSFILTER_OPACITY_TEST,
                value: 0.15
              },
              { value: 1.0 }
            ]
          }
        }
      },
      {
        type: "rect",
        from: { data: "summary" },
        name: "boxPlotArea",
        interactive: true,
        encode: {
          enter: {
            cornerRadius: { value: 2 }
          },
          update: {
            xc: { signal: "width / 2" },
            width: {
              signal:
                opts.baseMeasureSettings?.visualizeAs === VegaMarkTypes.VIOLIN
                  ? "boxWidth / 2"
                  : "boxWidth"
            },
            y: { scale: "yscale", field: "measure0_q1" },
            y2: { scale: "yscale", field: "measure0_q3" },
            fill: [
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              }
            ],
            fillOpacity: [
              {
                test: CROSSFILTER_OPACITY_TEST,
                value: 0.15
              },
              { value: 0.6 }
            ],
            stroke: [
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              }
            ],
            strokeWidth: { value: 2 },
            strokeOpacity: [
              {
                test: CROSSFILTER_OPACITY_TEST,
                value: 0.15
              },
              { value: 1 }
            ]
          }
        }
      },
      {
        type: "rect",
        from: { data: "summary" },
        encode: {
          enter: {
            fill: { value: "white" },
            height: { value: 2 }
          },
          update: {
            xc: { signal: "width / 2" },
            width: {
              signal:
                opts.baseMeasureSettings?.visualizeAs === VegaMarkTypes.VIOLIN
                  ? "boxWidth / 2"
                  : "boxWidth"
            },
            y: {
              scale: "yscale",
              field:
                opts.centerLineType === BoxPlotCenterLineType.MEAN
                  ? "measure0_avg"
                  : "measure0_median"
            },
            fillOpacity: [
              {
                test: CROSSFILTER_OPACITY_TEST,
                value: 0.15
              },
              { value: 1.0 }
            ]
          }
        }
      },
      ...(opts.outliersEnabled ? [buildOutliersMarks()] : [])
    ]
  }
}

export const buildMarks = (opts: SpecOptions) => {
  return [
    {
      name: "chart",
      type: "group",
      encode: {
        update: {
          width: { signal: "width" },
          height: { signal: "height" },
          fill: { value: "transparent" }
        }
      },
      signals: [
        {
          name: "clip",
          update: "'M0,0h' + width + 'v' + height + 'h-' + width + 'Z'"
        },
        {
          name: "tooltipKey",
          description: "On hover, the 'key' to search for in the tooltip data.",
          on: [
            {
              events: "mousemove",
              // TODO[C]: When we fix the spec and use the column/row spec to invert, change this x back to y
              update: "invert('dimension', x())"
            },
            {
              // Vega doesn't support mouseleave, and a mouseout by itself will
              // trigger every time the mouse leaves any descendant of the
              // chart group. So, we need to figure out when the mouse has
              // actually left the chart...
              events: "mouseout",
              update:
                "x() <= 0 || x() >= width || y() <= 0 || y() >= height ? null : tooltipKey"
            }
          ]
        },
        {
          name: "tooltip",
          description: "On hover, the data under the cursor.",
          push: "outer",
          on: [
            {
              events: { signal: "tooltipKey" },
              // TODO[C]: When we fix the spec and use the column/row spec to invert, change this x back to y
              update:
                "isValid(tooltipKey) ? { x: scale('dimension', tooltipKey) + bandPos.center, data: findindata('tooltipTable', { key: tooltipKey }) } : null"
            }
          ]
        }
      ],
      marks: [
        buildViolinPlotMark(opts),
        buildBoxPlotMark(opts),
        buildTooltipMark()
      ]
    }
  ]
}
