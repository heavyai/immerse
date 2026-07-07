// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { BandScale, Spec, TimeScale } from "vega"
import { config as defaultVegaConfig } from "vega-parser"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { MeasureSettings } from "vega/charts/box-plot-chart/types"
const { EXTEND_COMBO_MEASURE_RANGE } = available_feature_flags

import { BaseDimensionAxisSettings } from "vega/constants/presentation-settings-types"

export const VEGA_CONFIG = defaultVegaConfig()

// By default, an axis is made of a "domain" (the line separating the chart
// from the axis ticks and labels), ticks, and labels. The labels begin
// labelPadding pixels after the ticks, which have length tickSize. So, the
// distance from the domain line to the labels are tickSize + labelPadding.
export const AXIS_LABEL_POSITION =
  VEGA_CONFIG.axis.tickSize + VEGA_CONFIG.axis.labelPadding

export const AXIS_TITLE_OFFSET = VEGA_CONFIG.title.offset

// PADDING_OUTER must *not* be smaller than PADDING_INNER/2, otherwise there
// may be an issue with labels when binning is enabled.
const MINIMUM_BAR_BANDWIDTH = 16
const PADDING_INNER = 0.2
const PADDING_OUTER = 0.1

// How long after the last wheel event to wait until we've decided the user has
// stopped zooming
const ZOOM_END_DELAY = 500

// Careful what options you use to build the spec vs options passed in as
// signals - every time the spec changes, vega needs to completely tear down
// the chart and rebuild it from scratch, whereas changing a signal only causes
// vega to rerender. So, options to buildSpec should only be the sort that
// affect _how_ the chart is rendered, not _what_ is rendered.
export type SpecOptions = {
  enableContinuousDimension: boolean
  continuousTimeDimension: boolean
  groupingMode: BaseDimensionAxisSettings["groupingMode"]
  showPrimaryAxis: boolean
  showSecondaryAxis: boolean
  showBarLabels: boolean
  padding: Spec["padding"]
  shiftToZoom: boolean
  showDimensionTitle: boolean
  showPrimaryAxisTitle: boolean
  showSecondaryAxisTitle: boolean
  isRangeChart: boolean
  gridEnabled: boolean
  violinDistributionPrecision: number
  primaryMeasureScaleType?: string
  centerLineType?: string
  baseMeasureSettings?: MeasureSettings
  outliersEnabled?: boolean
}

function buildSignals(opts: SpecOptions): Spec["signals"] {
  const signals: Spec["signals"] = [
    {
      name: "cursor",
      value: "'default'",
      on: [
        {
          events:
            "[@rangeHandleMin:mousedown, window:mouseup] > mousemove, [@rangeHandleMax:mousedown, window:mouseup] > mousemove, @rangeHandleMin:mouseover, @rangeHandleMax:mouseover",
          update: "'ns-resize'"
        },
        {
          events: "@rangeHandleMin:mouseout, @rangeHandleMax:mouseout",
          update: "'default'"
        }
      ]
    },
    {
      name: "selectedValues",
      description: "Selected bars in categorical mode",
      value: []
    },
    {
      name: "negativeSelectedValues",
      description:
        "Values that *aren't* selected if a negative selection was made",
      value: []
    },
    {
      name: "rangeValues",
      description:
        "Selected range in continuous mode, passed in during chart load.",
      value: null
    },
    {
      name: "rangeValuesChangedAt",
      description: "When was the last time rangeValues changed?",
      on: [
        {
          events: { signal: "rangeValues" },
          update: "now()"
        }
      ]
    },
    {
      name: "computedRangeValues",
      update:
        "isValid(rangeValues) ? reverseIf([rangeValues.start, rangeValues.end], continuousDimensionDomainDesc) : rangeValues"
    },
    {
      name: "filter",
      description: "When a user clicks on a bar this signal triggers.",
      value: null,
      on: [
        {
          // use force: true so that even if the value is the same, the signal
          // will still trigger the signal handler
          events: "@bar:click![!event.ctrlKey][!event.metaKey]",
          update: "{ value: datum.dimension }",
          force: true
        },
        {
          // use force: true so that even if the value is the same, the signal
          // will still trigger the signal handler
          events: "@bar:click![event.ctrlKey],@bar:click![event.metaKey]",
          update: "{ value: datum.dimension, negated: true }",
          force: true
        }
      ]
    },
    {
      name: "rangeFilter",
      description: "Filter created by a user who drags across the chart.",
      value: null,
      on: [
        {
          events: { signal: "rangeFilterPosition" },
          update: opts.enableContinuousDimension
            ? "!isValid(rangeFilterPosition) ? rangeFilterPosition : { values: reverseIf([scrollingBandPanelPositionToContinuous('dimension', rangeFilterPosition[0]), scrollingBandPanelPositionToContinuous('dimension', rangeFilterPosition[1])], continuousDimensionDomainDesc) }"
            : "!isValid(rangeFilterPosition) ? rangeFilterPosition : { values: valuesFromExtents(domain('dimension'), [scrollingScalePanelPositionToDomain('dimension', rangeFilterPosition[0]), scrollingScalePanelPositionToDomain('dimension', rangeFilterPosition[1])]) }"
        }
      ]
    },
    {
      name: "editingRangeFilter",
      description:
        "`true` while the user is editing the range filter position.",
      value: false,
      on: [
        {
          events: { signal: "rangeFilterPosition" },
          update: "isValid(rangeFilterPosition) ? true : false"
        },
        {
          events: "window:mouseup",
          update: "false"
        }
      ]
    },
    {
      name: "rangeFilterPosition",
      description:
        "The position of a brush filter, based on the scrollingband scale's internal 'panel'.",
      value: null,
      on: [
        {
          events: "[@chartBrush:mousedown, window:mouseup] > mousemove!",
          update:
            "isValid(originalRangeFilterPosition) ? [originalRangeFilterPosition[0] + scrollingScaleRangeToPanelPosition('dimension', y()) - rangeFilterAnchor, originalRangeFilterPosition[1] + scrollingScaleRangeToPanelPosition('dimension', y()) - rangeFilterAnchor] : originalRangeFilterPosition"
        },
        {
          events: "wheel![event.ctrlKey]",
          update:
            "isValid(prevRangeFilterPosition) ? [prevRangeFilterPosition[0] + event.deltaY, prevRangeFilterPosition[1] + event.deltaY] : prevRangeFilterPosition"
        },
        {
          events:
            "[@chart:mousedown[!event.altKey], window:mouseup] > mousemove!",
          update:
            "[min(rangeFilterAnchor, scrollingScaleRangeToPanelPosition('dimension', y())), max(rangeFilterAnchor, scrollingScaleRangeToPanelPosition('dimension', y()))]"
        },
        {
          events:
            "[@chart:mousedown[event.altKey], window:mouseup] > mousemove!",
          update:
            "(rangeFilterAnchor < scrollingScaleRangeToPanelPosition('dimension', y())) ? [rangeFilterAnchor - abs(scrollingScaleRangeToPanelPosition('dimension', y()) - rangeFilterAnchor), scrollingScaleRangeToPanelPosition('dimension', y())] : [scrollingScaleRangeToPanelPosition('dimension', y()), rangeFilterAnchor + abs(rangeFilterAnchor - scrollingScaleRangeToPanelPosition('dimension', y()))]"
        },
        {
          events: "[@rangeHandleMin:mousedown, window:mouseup] > mousemove!",
          update:
            "[min(scrollingScaleRangeToPanelPosition('dimension', y()), originalRangeFilterPosition[1]), max(scrollingScaleRangeToPanelPosition('dimension', y()), originalRangeFilterPosition[1])]"
        },
        {
          events: "[@rangeHandleMax:mousedown, window:mouseup] > mousemove!",
          update:
            "[min(scrollingScaleRangeToPanelPosition('dimension', y()), originalRangeFilterPosition[0]), max(scrollingScaleRangeToPanelPosition('dimension', y()), originalRangeFilterPosition[0])]"
        }
      ]
    },
    {
      name: "originalRangeFilterPosition",
      description:
        "When moving an existing range filter, this will be the original [min,max]",
      value: null,
      on: [
        {
          events:
            "@chartBrush:mousedown!, @rangeHandleMin:mousedown!, @rangeHandleMax:mousedown!",
          update:
            "isValid(computedRangeValues) ? [scrollingBandContinuousToPanelPosition('dimension', computedRangeValues[0]), scrollingBandContinuousToPanelPosition('dimension', computedRangeValues[1])] : null"
        }
      ]
    },
    {
      name: "rangeFilterAnchor",
      description:
        "Mouse position when the user starts dragging for a range filter.",
      value: 0,
      on: [
        {
          events: "@chart:mousedown!, @chartBrush:mousedown!",
          update: "scrollingScaleRangeToPanelPosition('dimension', y())"
        }
      ]
    },
    {
      name: "editingValidRangeFilter",
      description: "`true` if editing a range filter, and the value is valid.",
      update:
        "editingRangeFilter && isValid(rangeFilter) && length(rangeFilter.values) > 0"
    },
    {
      name: "prevRangeFilterPosition",
      description: "Keeps track of the previous value of rangeFilterPosition",
      on: [
        {
          events: { signal: "rangeFilterPositionChangedAt" },
          update: "rangeFilterPosition"
        }
      ]
    },
    {
      name: "rangeFilterPositionChangedAt",
      description: "The last time the rangeFilterPosition changed",
      on: [
        {
          events: { signal: "rangeFilterPosition" },
          update:
            "!isValid(rangeFilterPosition) || !isValid(prevRangeFilterPosition) || rangeFilterPosition[0] !== prevRangeFilterPosition[0] || rangeFilterPosition[1] !== prevRangeFilterPosition[1] ? now() : rangeFilterPositionChangedAt"
        }
      ]
    }
  ]

  if (opts.enableContinuousDimension) {
    signals.push(
      {
        name: "defaultZoomExtents",
        description: "The extents of the 'zoom' when the chart loads.",
        update: opts.isRangeChart
          ? "isValid(rangeValues) ? [toEpochIfDate(rangeValues.start), toEpochIfDate(rangeValues.end)] : continuousDimensionDomain"
          : "continuousDimensionDomain"
      },
      {
        name: "zoomAnchor",
        description: "Position of the zoom event.",
        on: [
          {
            events: opts.shiftToZoom
              ? "wheel[event.shiftKey]"
              : "wheel[!event.ctrlKey && !event.altKey]",
            update:
              "toEpochIfDate(scrollingBandRangeToContinuous('dimension', y()))"
          }
        ]
      },
      {
        name: "zoomAmount",
        description: "How much to zoom.",
        on: [
          {
            events: opts.shiftToZoom
              ? "wheel![event.shiftKey]"
              : "wheel![!event.ctrlKey && !event.altKey]",
            update: "pow(1.001, event.deltaY * pow(16, event.deltaMode))",
            force: true
          }
        ]
      },
      {
        name: "panZoom",
        description: "Panning the zoom.",
        on: [
          {
            // event.deltaY will be something like 2. We can't just pan the
            // zoom by that amount because if the dimension's domain is large,
            // a change of 2 will be imperceptible. Instead, we convert that
            // 2px of screen movement to dimension domain movement.
            events: "wheel![event.altKey]",
            update:
              "toEpochIfDate(scrollingBandRangeToContinuous('dimension', y() - event.deltaY)) - toEpochIfDate(scrollingBandRangeToContinuous('dimension', y()))",
            force: true
          }
        ]
      },
      {
        name: "zoomAt",
        description: "Last time zoom changed.",
        on: [
          {
            events: [
              { signal: "zoomAmount" },
              { signal: "panZoom" },
              { signal: "incomingZoom" }
            ],
            update: "now()"
          }
        ]
      },
      {
        name: "clearZoomAt",
        description: "Last time an event happened that should clear the zoom.",
        on: [
          {
            events: [
              { signal: "continuousDimensionDomain" },
              { signal: "continuousDimensionDomainDesc" },
              { signal: "fullDimensionDomain" },
              ...(opts.isRangeChart ? [{ signal: "rangeValues" }] : [])
            ],
            update: "now()"
          }
        ]
      },
      {
        name: "zoom",
        description: "Extents of the zoom.",
        on: [
          {
            events: { signal: "zoomAmount" },
            update: `{ start: max(zoomAnchor + (if(isValid(zoom) && zoomAt + ${ZOOM_END_DELAY} > clearZoomAt, zoom.start, defaultZoomExtents[0]) - zoomAnchor) * zoomAmount, fullDimensionDomain[0]), end: min(zoomAnchor + (if(isValid(zoom) && zoomAt + ${ZOOM_END_DELAY} > clearZoomAt, zoom.end, defaultZoomExtents[1]) - zoomAnchor) * zoomAmount, fullDimensionDomain[1]) }`
          },
          {
            events: { signal: "panZoom" },
            update: `{ start: max(if(isValid(zoom) && zoomAt + ${ZOOM_END_DELAY} > clearZoomAt, zoom.start, defaultZoomExtents[0]) - panZoom, fullDimensionDomain[0]), end: min(if(isValid(zoom) && zoomAt + ${ZOOM_END_DELAY} > clearZoomAt, zoom.end, defaultZoomExtents[1]) - panZoom, fullDimensionDomain[1]) }`
          }
        ]
      },
      {
        name: "incomingZoom",
        description: "Zoom from the corresponding focus/range chart."
      },
      {
        name: "outgoingZoom",
        description:
          "Used for setting a crossfilter when zooming on the focus chart.",
        update: "isValid(zoom) ? { values: [zoom.start, zoom.end] } : null"
      },
      {
        name: "zoomRange",
        description: "Range of zoom.",
        on: [
          {
            events: { signal: "zoom" },
            update:
              "isValid(zoom) ? reverseIf([zoom.start, zoom.end], continuousDimensionDomainDesc) : null"
          },
          {
            events: { signal: "incomingZoom" },
            update:
              "isValid(incomingZoom) ? reverseIf([incomingZoom.start, incomingZoom.end], continuousDimensionDomainDesc) : null"
          },
          {
            events: { signal: "clearZoomAt" },
            update: `zoomAt + ${ZOOM_END_DELAY} > clearZoomAt ? zoomRange : null`
          }
        ]
      }
    )
  }

  signals.push({
    name: "visibleBrush",
    description: "Start and end of visible brush",
    on: opts.enableContinuousDimension
      ? [
          {
            events: [
              { signal: "editingRangeFilter" },
              { signal: "rangeFilterPosition" },
              { signal: "computedRangeValues" },
              { scale: "dimension" },
              ...(opts.isRangeChart ? [{ signal: "zoomRange" }] : [])
            ],
            update: `${
              opts.isRangeChart
                ? "isValid(zoomRange) ? [scrollingBandContinuousToRange('dimension', zoomRange[0]), scrollingBandContinuousToRange('dimension', zoomRange[1])] : "
                : ""
            }(editingRangeFilter || rangeFilterPositionChangedAt > rangeValuesChangedAt) && isValid(rangeFilterPosition) ? [scrollingScalePanelPositionToRange('dimension', rangeFilterPosition[0]), scrollingScalePanelPositionToRange('dimension', rangeFilterPosition[1])] : isValid(computedRangeValues) ? [scrollingBandContinuousToRange('dimension', computedRangeValues[0]), scrollingBandContinuousToRange('dimension', computedRangeValues[1])] : null`
          }
        ]
      : [
          {
            events: [
              { signal: "rangeFilter" },
              { signal: "editingRangeFilter" },
              { scale: "dimension" }
            ],
            update:
              "!isValid(rangeFilter) ? visibleBrush : editingRangeFilter && length(rangeFilter.values) > 0 ? [scale('dimension', rangeFilter.values[0]), scale('dimension', peek(rangeFilter.values)) + bandwidth('dimension')] : null"
          }
        ]
  })

  const clearFiltersTriggers = [
    {
      events: "@chart:dblclick!, @chartBrush:dblclick!",
      update: "true",
      force: true
    }
  ]
  if (opts.enableContinuousDimension) {
    // A single click on the chart, with a continuous dimension, should clear
    // the brush filter. Unfortunately, this event will fire after brushing,
    // so, to prevent that, it only returns true if the mouse moved less than 2
    // pixels
    clearFiltersTriggers.push({
      events: "@chart:click!",
      update:
        "abs(y() - scrollingScalePanelPositionToRange('dimension', rangeFilterAnchor)) < 2",
      force: true
    })
  }

  signals.push(
    {
      name: "clearFilters",
      description: "Signal fires on double click to clear all filters",
      value: null,
      on: clearFiltersTriggers
    },
    {
      name: "tooltip",
      description: "On hover, the data under the cursor.",
      value: null
    },
    {
      name: "baseDimensionTitle",
      description: "Title for the base dimension axis",
      value: null
    },
    {
      name: "baseDimensionLabelLimit",
      description: "Length limit for labels in pixels.",
      value: 100
    },
    {
      name: "continuousDimensionDomain",
      description: "The domain of the continuous dimension.",
      value: null
    },
    {
      name: "continuousDimensionDomainDesc",
      description: "True if the continuous dimension domain is descending.",
      value: false
    },
    {
      name: "computedContinuousDimensionDomain",
      update:
        "reverseIf(continuousDimensionDomain, continuousDimensionDomainDesc)"
    },
    {
      name: "dimensionDomain",
      value: []
    },
    {
      name: "maxDimensionTicks",
      description: "Maximum number of ticks on the dimension axis.",
      update: "length(dimensionDomain)"
    },
    {
      name: "formattedDimensions",
      value: {}
    },
    {
      name: "dimensionAxisTickOffset",
      description: "Tick offset on the dimension axis.",
      update: opts.enableContinuousDimension
        ? `-0.5 * bandwidth('dimension') * (1 + ${PADDING_INNER} / (1 - ${PADDING_INNER}))`
        : "0"
    },
    {
      name: "measureColorDomain",
      description:
        "Domain for measure colors - the min/max of the quantitative data.",
      value: []
    },
    {
      name: "measureColorRange",
      description:
        "Range for measure colors - the colors strings defining the output gradient.",
      value: []
    },
    {
      name: "measureColorReversed",
      description: "Whether or not the palette is reversed.",
      value: false
    },
    {
      name: "primaryMeasureTitle",
      description: "Title for the primary measure axis",
      value: ""
    },
    {
      name: "secondaryMeasureTitle",
      description: "Title for the secondary measure axis",
      value: ""
    },
    {
      name: "primaryMeasureDomain",
      description: "Domain for the measure scale on the primary axis.",
      value: [0, 0]
    },
    {
      name: "secondaryMeasureDomain",
      description: "Domain for the measure scale on the secondary axis.",
      value: [0, 0]
    },
    {
      name: "minBandwidth",
      description: "Minimum bandwidth for dimension scale.",
      update: opts.enableContinuousDimension
        ? "0"
        : `length(data('barTable')) === 0 ? 0 : ${
            opts.groupingMode === "grouped"
              ? `length(data('barSettings')) * ${MINIMUM_BAR_BANDWIDTH}`
              : MINIMUM_BAR_BANDWIDTH
          }`
    },
    {
      name: "bandPos",
      update: `{ left: 0 - bandwidth('dimension') * ${
        PADDING_INNER / (1 - PADDING_INNER) / 2.0
      }, center: bandwidth('dimension') * 0.5, right: bandwidth('dimension') * ${
        1 + PADDING_INNER / (1 - PADDING_INNER) / 2.0
      } }`
    }
  )

  if (!opts.enableContinuousDimension) {
    signals.push({
      name: "scrollPercent",
      description: "The scrolling position as a value between 0 and 1.",
      value: 0,
      on: [
        {
          events: "wheel![!event.ctrlKey && !event.altKey]",
          update:
            "clamp(scrollPercent + (event.deltaY * pow(16, event.deltaMode)) / height, 0, 1)"
        }
      ]
    })
  }

  signals.push(
    {
      name: "baseDimensionFormat",
      value: null
    },
    {
      name: "primaryMeasureFormat",
      value: null
    },
    {
      name: "secondaryMeasureFormat",
      value: null
    },
    {
      name: "primaryPercentageDistributionEnabled",
      value: null
    },
    {
      name: "secondaryPercentageDistributionEnabled",
      value: null
    }
  )

  if (opts.enableContinuousDimension && opts.continuousTimeDimension) {
    signals.push({
      name: "binnedTimeDomain",
      description: "",
      value: [Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)],
      on: [
        {
          events: { scale: "dimension" },
          update: "scrollingBandBinnedDomain('dimension')"
        }
      ]
    })
  }

  signals.push(
    {
      name: "hasForcedExtent",
      value: false
    },
    {
      name: "fullDimensionDomain",
      value: null
    },
    {
      name: "verticalAxisTitleLength",
      update: `height - 50`
    },
    {
      name: "horizontalAxisTitleLength",
      update: `width - 50`
    }
  )

  return signals
}

function buildScales(opts: SpecOptions): Spec["scales"] {
  const scales: Spec["scales"] = [
    {
      name: "primaryMeasure",
      type: (opts?.primaryMeasureScaleType || "linear") as ScaleType,
      domain: { signal: "primaryMeasureDomain" },
      clamp: true,
      zero: false,
      nice: Boolean(getFeatureFlag(EXTEND_COMBO_MEASURE_RANGE)),
      range: "width"
    },
    {
      name: "secondaryMeasure",
      type: (opts?.primaryMeasureScaleType || "linear") as ScaleType,
      domain: { signal: "secondaryMeasureDomain" },
      clamp: true,
      zero: false,
      nice: Boolean(getFeatureFlag(EXTEND_COMBO_MEASURE_RANGE)),
      range: "width"
    },
    {
      name: "dimension",
      type: "scrollingband" as any,
      domain: { signal: "dimensionDomain" },
      range: "height",
      minBandwidth: { signal: "minBandwidth" },
      scrollPercent: opts.enableContinuousDimension
        ? 0
        : { signal: "scrollPercent" },
      zoomTo:
        opts.enableContinuousDimension && !opts.isRangeChart
          ? { signal: "zoomRange" }
          : null,
      binnedScaleType:
        opts.enableContinuousDimension && opts.continuousTimeDimension
          ? "utc"
          : "linear",
      maxTicks: { signal: "maxDimensionTicks" },
      binnedDomain: { signal: "computedContinuousDimensionDomain" },
      paddingInner: PADDING_INNER,
      paddingOuter: PADDING_OUTER
    } as BandScale,
    {
      name: "measureColor",
      type: "linear",
      range: { signal: "measureColorRange" },
      domain: { signal: "measureColorDomain" },
      reverse: { signal: "measureColorReversed" },
      clamp: true
    }
  ]

  if (opts.enableContinuousDimension && opts.continuousTimeDimension) {
    scales.push({
      name: "binnedTimeDimension",
      type: "customutc" as "utc",
      domain: { signal: "binnedTimeDomain" },
      range: "height",
      reverse: true,
      maxTicks: { signal: "maxDimensionTicks" }
    } as TimeScale)
  }

  return scales
}

function buildAxes(opts: SpecOptions): Spec["axes"] {
  const axes: Spec["axes"] = []

  if (opts.enableContinuousDimension && opts.continuousTimeDimension) {
    axes.push({
      orient: "left",
      scale: "binnedTimeDimension",
      title: opts.showDimensionTitle
        ? { signal: "baseDimensionTitle" }
        : undefined,
      titleLimit: { signal: "verticalAxisTitleLength" },
      format: { signal: "baseDimensionFormat" },
      formatType: "utc",
      labelFontSize: { signal: "axisLabelFontSize" },
      labelLimit: { signal: "baseDimensionLabelLimit" },
      labelOverlap: true,
      labelPadding: 4,
      encode: {
        // Name the axis so it can be selected for positioning the title
        // overlay
        axis: { name: "base-dimension-axis" }
      }
    })
  } else {
    axes.push({
      orient: "left",
      scale: "dimension",
      title: opts.showDimensionTitle
        ? { signal: "baseDimensionTitle" }
        : undefined,
      titleLimit: { signal: "verticalAxisTitleLength" },
      tickOffset: { signal: "dimensionAxisTickOffset" },
      labelFontSize: { signal: "axisLabelFontSize" },
      labelLimit: { signal: "baseDimensionLabelLimit" },
      labelOverlap: true,
      labelPadding: 4,
      encode: {
        // Name the axis so it can be selected for positioning the title
        // overlay
        axis: { name: "base-dimension-axis" },

        labels: {
          update: {
            text: {
              signal: "formattedDimensions[datum.value]"
            }
          }
        }
      }
    })
  }

  if (opts.showPrimaryAxis) {
    axes.push({
      grid: opts.gridEnabled,
      orient: "bottom",
      scale: "primaryMeasure",
      title: opts.showPrimaryAxisTitle
        ? { signal: "primaryMeasureTitle" }
        : undefined,
      titleLimit: { signal: "horizontalAxisTitleLength" },
      formatType: "number",
      labelFlush: true,
      labelOverlap: true,
      encode: {
        // Name the measure axis so it can be selected for positioning the
        // measure domain overlay
        axis: { name: "primary-measure-axis" },
        labels: {
          update: {
            text: {
              signal:
                "autoFormatSpan(datum.value, primaryMeasureDomain, primaryMeasureFormat, datum.label, primaryPercentageDistributionEnabled)"
            }
          }
        }
      }
    })
  }

  if (opts.showSecondaryAxis) {
    axes.push({
      // don't show secondary axis gridlines unless there is no
      // primary axis
      grid: !opts.showPrimaryAxis && opts.gridEnabled,
      orient: "top",
      scale: "secondaryMeasure",
      title: opts.showSecondaryAxisTitle
        ? { signal: "secondaryMeasureTitle" }
        : undefined,
      titleLimit: { signal: "horizontalAxisTitleLength" },
      formatType: "number",
      labelFlush: true,
      labelOverlap: true,
      encode: {
        // Name the measure axis so it can be selected for positioning the
        // measure domain overlay
        axis: { name: "secondary-measure-axis" },
        labels: {
          update: {
            text: {
              signal:
                "autoFormatSpan(datum.value, secondaryMeasureDomain, secondaryMeasureFormat, datum.label, secondaryPercentageDistributionEnabled)"
            }
          }
        }
      }
    })
  }

  return axes
}

function buildCategoricalBGMark(opts: SpecOptions): NonNullable<Spec["marks"]> {
  if (opts.enableContinuousDimension) {
    return []
  }
  return [
    {
      name: "categoricalBG",
      type: "rect",
      clip: { path: { signal: "clip" } },
      interactive: false,
      encode: {
        update: {
          x: { value: 0 },
          x2: { signal: "width" },
          y: {
            signal:
              "isValid(tooltip && tooltip.y) ? tooltip.y - bandPos.center + bandPos.left: 0"
          },
          y2: {
            signal:
              "isValid(tooltip && tooltip.y) ? tooltip.y - bandPos.center + bandPos.right: 0"
          },
          fill: { value: "black" },
          fillOpacity: { signal: "isValid(tooltip && tooltip.y) ? 0.05 : 0" }
        }
      }
    }
  ]
}

function buildBarMark(opts: SpecOptions): NonNullable<Spec["marks"]>[0] {
  const mark: NonNullable<Spec["marks"]>[0] = {
    name: "barChart",
    description: "Group of all bars in the chart.",
    type: "group",
    clip: { path: { signal: "clip" } },
    from: {
      facet: {
        name: "barGrouping",
        data: "barTable",
        groupby: "dimension"
      }
    },
    encode: {
      update: {
        y: { scale: "dimension", field: "dimension" }
      }
    },
    signals: [
      {
        name: "height",
        update: "bandwidth('dimension')"
      }
    ],
    scales: [
      {
        name: "groupBand",
        type: "band",
        range: "height",
        domain: {
          data: "barSettings",
          field: "key",
          sort: { field: "order", op: "max" }
        }
      }
    ],
    marks: [
      {
        name: "bar",
        type: "rect",
        from: { data: "barGrouping" },
        interactive: !opts.enableContinuousDimension,
        encode: {
          update: {
            x: [
              {
                test: "datum.axis === 'primary'",
                scale: "primaryMeasure",
                field: "measureMin"
              },
              { scale: "secondaryMeasure", field: "measureMin" }
            ],
            x2: [
              {
                test: "datum.axis === 'primary'",
                scale: "primaryMeasure",
                field: "measureMax"
              },
              { scale: "secondaryMeasure", field: "measureMax" }
            ],
            y:
              opts.groupingMode === "grouped"
                ? { scale: "groupBand", field: "measureKey" }
                : { value: 0 },
            y2:
              opts.groupingMode === "grouped"
                ? { scale: "groupBand", field: "measureKey", band: 1 }
                : { signal: "height" },
            fill: [
              {
                test:
                  "datum.measureColor !== null && isValid(datum.measureColor)",
                scale: "measureColor",
                field: "measureColor"
              },
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              },
              {
                test: "isValid(datum.color)",
                field: "color"
              },
              { value: "#27aeef" }
            ],
            fillOpacity: [
              {
                test:
                  "(length(selectedValues) > 0 && indexof(selectedValues, datum.dimension) === -1) || (length(negativeSelectedValues) > 0 && indexof(negativeSelectedValues, datum.dimension) >= 0)",
                value: 0.15
              },
              { value: 1.0 }
            ],
            omniAnnotation: { field: "annotationKey" },
            omniAnnotationType: { value: "area" },
            omniAnnotationFormatted: { field: "dimensionFormatted" }
          }
        }
      },
      {
        name: "barAnnotationAnchors",
        type: "symbol",
        from: { data: "bar" },
        interactive: false,
        encode: {
          update: {
            shape: { value: "circle" },
            x: { field: "x2" },
            y: { signal: "(datum.y + datum.y2) / 2" },
            width: { signal: "min(datum.width, datum.height, 6)" },
            height: { signal: "min(datum.width, datum.height, 6)" },
            fill: [
              {
                test:
                  "datum.measureColor !== null && isValid(datum.measureColor)",
                scale: "measureColor",
                field: "datum.measureColor"
              },
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              },
              {
                test: "isValid(datum.datum.color)",
                field: "datum.color"
              },
              { value: "#27aeef" }
            ],
            omniAnnotation: { field: "omniAnnotation" },
            omniAnnotationType: { value: "anchor" },
            omniAnnotationFormatted: { field: "omniAnnotationFormatted" }
          }
        }
      }
    ]
  }

  if (opts.showBarLabels && mark.marks) {
    mark.marks.push({
      name: "barLabel",
      type: "text",
      from: { data: "bar" },
      interactive: false,
      encode: {
        update: {
          align: [
            {
              test:
                "datum.datum.measure < 0 !== datum.width < autoFormatSpan(datum.datum.measure, datum.datum.axis === 'primary' ? primaryMeasureDomain : secondaryMeasureDomain, primaryMeasureFormat).length * 8",
              value: "left"
            },
            { value: "right" }
          ],
          baseline: { value: "middle" },
          x: [
            {
              test:
                "datum.datum.measure < 0 !== datum.width < autoFormatSpan(datum.datum.measure, datum.datum.axis === 'primary' ? primaryMeasureDomain : secondaryMeasureDomain, primaryMeasureFormat).length * 8",
              field: "x",
              offset: 5
            },
            { field: "x2", offset: -5 }
          ],
          y: { signal: "(datum.y + datum.y2) / 2" },
          fontSize: {
            signal: "min(barLabelMaxFontSize, datum.height)"
          },
          text: [
            {
              test:
                opts.groupingMode === "stacked" ||
                opts.groupingMode === "percent"
                  ? "datum.height < barLabelMinFontSize || datum.width < 14"
                  : "datum.height < barLabelMinFontSize",
              value: ""
            },
            (opts.groupingMode === "stacked" ||
              opts.groupingMode === "percent") && {
              test:
                "datum.width < autoFormatSpan(datum.datum.measure, datum.datum.axis === 'primary' ? primaryMeasureDomain : secondaryMeasureDomain, primaryMeasureFormat).length * 9",
              value: "…"
            },
            {
              test: "datum.datum.axis === 'primary'",
              signal:
                "autoFormatSpan(datum.datum.measure, primaryMeasureDomain, primaryMeasureFormat)"
            },
            {
              signal:
                "autoFormatSpan(datum.datum.measure, secondaryMeasureDomain, secondaryMeasureFormat)"
            }
          ].filter(Boolean)
        }
      }
    })
  }

  return mark
}

function buildAreaMark(): NonNullable<Spec["marks"]>[0] {
  return {
    name: "areaChart",
    description: "Group of all areas in the chart.",
    type: "group",
    clip: { path: { signal: "clip" } },
    from: {
      facet: {
        name: "areaGrouping",
        data: "areaTable",
        groupby: "measureKey"
      }
    },
    marks: [
      {
        name: "area",
        type: "path",
        from: { data: "areaGrouping" },
        sort: { field: "y" },
        interactive: false,
        encode: {
          update: {
            // Instead of drawing a single area, we draw a small segment
            // starting half way between this point and the previous
            // point, and going half way between this point and the next.
            // The reason we do this is because of an SVG limitation: we
            // cannot change the color of a path mid-path. So, in order
            // to support color measures and dimming crossfiltered
            // sections of an area, we need to do this.
            path: [
              {
                // this point doesn't exist, ie, a gap in the data
                test: "datum.gap",
                value: ""
              },
              {
                // primary axis - previous and next points exist
                test:
                  "datum.axis === 'primary' && datum.prevHasValue && datum.nextHasValue",
                signal:
                  "'M' + toString(scale('primaryMeasure', lerp([datum.prevMeasureMax, datum.measureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('primaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('primaryMeasure', lerp([datum.measureMax, datum.nextMeasureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('primaryMeasure', lerp([datum.measureMin, datum.nextMeasureMin], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('primaryMeasure', datum.measureMin)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('primaryMeasure', lerp([datum.prevMeasureMin, datum.measureMin], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'Z'"
              },
              {
                // primary axis - previous point exists but next point
                // does not
                test: "datum.axis === 'primary' && datum.prevHasValue",
                signal:
                  "'M' + toString(scale('primaryMeasure', lerp([datum.prevMeasureMax, datum.measureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('primaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('primaryMeasure', datum.measureMin)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('primaryMeasure', lerp([datum.prevMeasureMin, datum.measureMin], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'Z'"
              },
              {
                // primary axis - next point exists but previous point
                // does not
                test: "datum.axis === 'primary' && datum.nextHasValue",
                signal:
                  "'M' + toString(scale('primaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('primaryMeasure', lerp([datum.measureMax, datum.nextMeasureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('primaryMeasure', lerp([datum.measureMin, datum.nextMeasureMin], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('primaryMeasure', datum.measureMin)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'Z'"
              },
              {
                // primary axis - gaps on both sides
                test: "datum.axis === 'primary'",
                value: ""
              },
              {
                // secondary axis - previous and next points exist
                test:
                  "datum.axis === 'secondary' && datum.prevHasValue && datum.nextHasValue",
                signal:
                  "'M' + toString(scale('secondaryMeasure', lerp([datum.prevMeasureMax, datum.measureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('secondaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('secondaryMeasure', lerp([datum.measureMax, datum.nextMeasureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('secondaryMeasure', lerp([datum.measureMin, datum.nextMeasureMin], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('secondaryMeasure', datum.measureMin)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('secondaryMeasure', lerp([datum.prevMeasureMin, datum.measureMin], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'Z'"
              },
              {
                // secondary axis - previous point exists but next point
                // does not
                test: "datum.axis === 'secondary' && datum.prevHasValue",
                signal:
                  "'M' + toString(scale('secondaryMeasure', lerp([datum.prevMeasureMax, datum.measureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('secondaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('secondaryMeasure', datum.measureMin)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('secondaryMeasure', lerp([datum.prevMeasureMin, datum.measureMin], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'Z'"
              },
              {
                // secondary axis - next point exists but previous point
                // does not
                test: "datum.axis === 'secondary' && datum.nextHasValue",
                signal:
                  "'M' + toString(scale('secondaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('secondaryMeasure', lerp([datum.measureMax, datum.nextMeasureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('secondaryMeasure', lerp([datum.measureMin, datum.nextMeasureMin], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('secondaryMeasure', datum.measureMin)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'Z'"
              },
              {
                // secondary axis - gaps on both sides
                test: "datum.axis === 'secondary'",
                value: ""
              }
            ],
            strokeWidth: { value: 0 },
            fill: [
              {
                test:
                  "datum.measureColor !== null && isValid(datum.measureColor)",
                scale: "measureColor",
                field: "measureColor"
              },
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              },
              {
                test: "isValid(datum.color)",
                field: "color"
              },
              { value: "#27aeef" }
            ],
            opacity: [
              {
                test:
                  "(length(selectedValues) > 0 && indexof(selectedValues, datum.dimension) === -1) || (length(negativeSelectedValues) > 0 && indexof(negativeSelectedValues, datum.dimension) >= 0)",
                value: 0.15
              },
              { value: 0.9 }
            ]
          }
        }
      },
      {
        name: "areaAnnotationAnchors",
        type: "symbol",
        from: { data: "areaGrouping" },
        interactive: false,
        encode: {
          update: {
            shape: { value: "circle" },
            x: [
              {
                test: "datum.axis === 'primary'",
                scale: "primaryMeasure",
                field: "measureMax"
              },
              { scale: "secondaryMeasure", field: "measureMax" }
            ],
            y: {
              signal: "scale('dimension', datum.dimension) + bandPos.center"
            },
            width: { signal: "min(bandwidth('dimension'), 6)" },
            height: { signal: "min(bandwidth('dimension'), 6)" },
            fill: [
              {
                test:
                  "datum.measureColor !== null && isValid(datum.measureColor)",
                scale: "measureColor",
                field: "measureColor"
              },
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              },
              {
                test: "isValid(datum.color)",
                field: "color"
              },
              { value: "#27aeef" }
            ],
            omniAnnotation: { field: "annotationKey" },
            omniAnnotationType: { value: "anchor" },
            omniAnnotationFormatted: { field: "dimensionFormatted" }
          }
        }
      }
    ]
  }
}

function buildLineMark(): NonNullable<Spec["marks"]>[0] {
  return {
    name: "lineChart",
    description: "Group of all lines in the chart.",
    type: "group",
    clip: { path: { signal: "clip" } },
    from: {
      facet: {
        name: "lineGrouping",
        data: "lineTable",
        groupby: "measureKey"
      }
    },
    marks: [
      {
        name: "line",
        type: "path",
        from: { data: "lineGrouping" },
        sort: { field: "y" },
        interactive: false,
        encode: {
          update: {
            // Instead of drawing a single line, we draw a small segment
            // starting half way between this point and the previous
            // point, and going half way between this point and the next.
            // The reason we do this is because of an SVG limitation: we
            // cannot change the color of a path mid-path. So, in order
            // to support color measures and dimming crossfiltered
            // sections of a line, we need to do this.
            path: [
              {
                // this point doesn't exist, ie, a gap in the data
                test: "datum.gap",
                value: ""
              },
              {
                // primary axis - previous and next points exist
                test:
                  "datum.axis === 'primary' && datum.prevHasValue && datum.nextHasValue",
                signal:
                  "'M' + toString(scale('primaryMeasure', lerp([datum.prevMeasureMax, datum.measureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('primaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('primaryMeasure', lerp([datum.measureMax, datum.nextMeasureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center)"
              },
              {
                // primary axis - previous point exists but next point
                // does not
                test: "datum.axis === 'primary' && datum.prevHasValue",
                signal:
                  "'M' + toString(scale('primaryMeasure', lerp([datum.prevMeasureMax, datum.measureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('primaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center)"
              },
              {
                // primary axis - next point exists but previous point
                // does not
                test: "datum.axis === 'primary' && datum.nextHasValue",
                signal:
                  "'M' + toString(scale('primaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('primaryMeasure', lerp([datum.measureMax, datum.nextMeasureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center)"
              },
              {
                // primary axis - gaps on both sides
                test: "datum.axis === 'primary'",
                signal:
                  "'M' + toString(scale('primaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'Z'"
              },
              {
                // secondary axis - previous and next points exist
                test:
                  "datum.axis === 'secondary' && datum.prevHasValue && datum.nextHasValue",
                signal:
                  "'M' + toString(scale('secondaryMeasure', lerp([datum.prevMeasureMax, datum.measureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('secondaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('secondaryMeasure', lerp([datum.measureMax, datum.nextMeasureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center)"
              },
              {
                // secondary axis - previous point exists but next point
                // does not
                test: "datum.axis === 'secondary' && datum.prevHasValue",
                signal:
                  "'M' + toString(scale('secondaryMeasure', lerp([datum.prevMeasureMax, datum.measureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.prevDimension)) * 0.5 + bandPos.center) + 'L' + toString(scale('secondaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center)"
              },
              {
                // secondary axis - next point exists but previous point
                // does not
                test: "datum.axis === 'secondary' && datum.nextHasValue",
                signal:
                  "'M' + toString(scale('secondaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'L' + toString(scale('secondaryMeasure', lerp([datum.measureMax, datum.nextMeasureMax], 0.5))) + ',' + toString((scale('dimension', datum.dimension) + scale('dimension', datum.nextDimension)) * 0.5 + bandPos.center)"
              },
              {
                // secondary axis - gaps on both sides
                test: "datum.axis === 'secondary'",
                signal:
                  "'M' + toString(scale('secondaryMeasure', datum.measureMax)) + ',' + toString(scale('dimension', datum.dimension) + bandPos.center) + 'Z'"
              }
            ],
            strokeWidth: { field: "lineThickness" },
            strokeCap: { value: "round" },
            strokeDash: [
              {
                test: "datum.lineStyle === 'dashed'",
                value: [4, 3]
              },
              {
                test: "datum.lineStyle === 'dotted'",
                value: [1, 4]
              },
              { value: null }
            ],
            stroke: [
              {
                test:
                  "datum.measureColor !== null && isValid(datum.measureColor)",
                scale: "measureColor",
                field: "measureColor"
              },
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              },
              {
                test: "isValid(datum.color)",
                field: "color"
              },
              { value: "#27aeef" }
            ],
            strokeOpacity: [
              {
                test:
                  "(length(selectedValues) > 0 && indexof(selectedValues, datum.dimension) === -1) || (length(negativeSelectedValues) > 0 && indexof(negativeSelectedValues, datum.dimension) >= 0)",
                value: 0.15
              },
              { value: 1.0 }
            ]
          }
        }
      },
      {
        name: "lineAnnotationAnchors",
        type: "symbol",
        from: { data: "lineGrouping" },
        interactive: false,
        encode: {
          update: {
            shape: { value: "circle" },
            x: [
              {
                test: "datum.axis === 'primary'",
                scale: "primaryMeasure",
                field: "measureMax"
              },
              { scale: "secondaryMeasure", field: "measureMax" }
            ],
            y: {
              signal: "scale('dimension', datum.dimension) + bandPos.center"
            },
            width: { signal: "min(bandwidth('dimension'), 6)" },
            height: { signal: "min(bandwidth('dimension'), 6)" },
            fill: [
              {
                test:
                  "datum.measureColor !== null && isValid(datum.measureColor)",
                scale: "measureColor",
                field: "measureColor"
              },
              {
                test:
                  "datum.categoricalColor !== null && isValid(datum.categoricalColor)",
                field: "categoricalColor"
              },
              {
                test: "isValid(datum.color)",
                field: "color"
              },
              { value: "#27aeef" }
            ],
            omniAnnotation: { field: "annotationKey" },
            omniAnnotationType: { value: "anchor" },
            omniAnnotationFormatted: { field: "dimensionFormatted" }
          }
        }
      }
    ]
  }
}

function buildBrushMarks(): NonNullable<Spec["marks"]> {
  return [
    {
      name: "chartBrush",
      type: "rect",
      clip: { path: { signal: "clip" } },
      encode: {
        update: {
          x: { value: 0 },
          x2: { signal: "width" },
          y: [
            {
              test: "isValid(visibleBrush)",
              signal: "visibleBrush[0]"
            },
            { value: 0 }
          ],
          y2: [
            {
              test: "isValid(visibleBrush)",
              signal: "visibleBrush[1]"
            },
            { value: 0 }
          ],
          fill: [
            {
              test: "isValid(visibleBrush)",
              value: "rgb(34, 167, 240, 0.3)"
            },
            { value: "transparent" }
          ]
        }
      }
    },
    {
      name: "rangeHandleMin",
      type: "rect",
      clip: { path: { signal: "clip" } },
      encode: {
        update: {
          x: { value: 0 },
          x2: { signal: "width" },
          y: [
            {
              test: "isValid(visibleBrush)",
              signal: "visibleBrush[0] - 2"
            },
            { value: 0 }
          ],
          y2: [
            {
              test: "isValid(visibleBrush)",
              signal: "visibleBrush[0] + 1"
            },
            { value: 0 }
          ],
          fill: [
            {
              test: "isValid(visibleBrush)",
              value: "#aaa"
            },
            { value: "transparent" }
          ]
        }
      }
    },
    {
      name: "rangeHandleMax",
      type: "rect",
      clip: { path: { signal: "clip" } },
      encode: {
        update: {
          x: { value: 0 },
          x2: { signal: "width" },
          y: [
            {
              test: "isValid(visibleBrush)",
              signal: "visibleBrush[1] - 1"
            },
            { value: 0 }
          ],
          y2: [
            {
              test: "isValid(visibleBrush)",
              signal: "visibleBrush[1] + 2"
            },
            { value: 0 }
          ],
          fill: [
            {
              test: "isValid(visibleBrush)",
              value: "#aaa"
            },
            { value: "transparent" }
          ]
        }
      }
    }
  ]
}

function buildTooltipMark(): NonNullable<Spec["marks"]>[0] {
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

function buildMarks(opts: SpecOptions): Spec["marks"] {
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
              update:
                "editingValidRangeFilter ? null : invert('dimension', y())"
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
              update:
                "isValid(tooltipKey) ? { y: scale('dimension', tooltipKey) + bandPos.center, data: findindata('tooltipTable', { key: tooltipKey }) } : null"
            }
          ]
        }
      ],
      marks: [
        ...buildCategoricalBGMark(opts),
        buildBarMark(opts),
        buildAreaMark(),
        buildLineMark(),
        ...buildBrushMarks(),
        buildTooltipMark()
      ]
    }
  ]
}

export function buildSpec(opts: SpecOptions): Spec {
  return {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    autosize: { type: "fit", contains: "padding", resize: true },
    padding: opts.padding,

    data: [
      {
        name: "measureSettings",
        values: [],
        transform: [
          {
            type: "filter",
            expr: "!datum.disabled"
          }
        ]
      },
      {
        name: "barSettings",
        source: "measureSettings",
        transform: [
          {
            type: "filter",
            expr: "datum.visualizeAs === 'bar'"
          }
        ]
      },
      {
        name: "barTable",
        values: [],
        transform: [
          {
            type: "lookup",
            from: "measureSettings",
            key: "key",
            fields: ["measureKey"],
            values: ["color"],
            as: ["color"]
          }
        ]
      },
      {
        name: "lineTable",
        values: [],
        transform: [
          {
            type: "formula",
            expr: "!datum.gap",
            as: "hasValue",
            initonly: true
          },
          {
            type: "lookup",
            from: "measureSettings",
            key: "key",
            fields: ["measureKey"],
            values: ["color", "lineThickness", "lineStyle"],
            as: ["color", "lineThickness", "lineStyle"]
          },
          {
            type: "window",
            sort: { field: "sortableVal", order: "ascending" },
            groupby: ["measureKey"],
            ops: ["lag", "lag", "lag", "lead", "lead", "lead"],
            fields: [
              "hasValue",
              "measureMax",
              "dimension",
              "hasValue",
              "measureMax",
              "dimension"
            ],
            as: [
              "prevHasValue",
              "prevMeasureMax",
              "prevDimension",
              "nextHasValue",
              "nextMeasureMax",
              "nextDimension"
            ],
            frame: [-1, 1]
          }
        ]
      },
      {
        name: "areaTable",
        values: [],
        transform: [
          {
            type: "formula",
            expr: "!datum.gap",
            as: "hasValue",
            initonly: true
          },
          {
            type: "lookup",
            from: "measureSettings",
            key: "key",
            fields: ["measureKey"],
            values: ["color"],
            as: ["color"]
          },
          {
            type: "window",
            sort: { field: "sortableVal", order: "ascending" },
            groupby: ["measureKey"],
            ops: [
              "lag",
              "lag",
              "lag",
              "lag",
              "lead",
              "lead",
              "lead",
              "lead"
            ],
            fields: [
              "hasValue",
              "measureMin",
              "measureMax",
              "dimension",
              "hasValue",
              "measureMin",
              "measureMax",
              "dimension"
            ],
            as: [
              "prevHasValue",
              "prevMeasureMin",
              "prevMeasureMax",
              "prevDimension",
              "nextHasValue",
              "nextMeasureMin",
              "nextMeasureMax",
              "nextDimension"
            ],
            frame: [-1, 1]
          }
        ]
      },
      {
        name: "tooltipTable",
        values: []
      }
    ],

    signals: buildSignals(opts),
    scales: buildScales(opts),
    axes: buildAxes(opts),
    marks: buildMarks(opts)
  }
}
