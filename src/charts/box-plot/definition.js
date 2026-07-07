// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED, OMNICOMBO } from "constants/chart-types"
import {
  getColors,
  ORDINAL_COLORS,
  CHARTS_DEFAULT_COLORS
} from "services/colors"
import {
  ALL_NUMERICAL_TYPES,
  NUMERICAL_AND_TIME_TYPES,
  TEXT_TYPES
} from "constants/data-types"
import { map, merge } from "ramda"

import VegaComboChartSettings from "./chart-settings"
import getBoxPlotChartData from "./getBoxPlotChartData"

import DataSelectionPanel from "vega/data-selection/data-selection-panel"
import BoxPlotChart from "vega/charts/box-plot-chart/box-plot-chart-parent"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import {
  BoxPlotCenterLineType,
  CUSTOM_SQL_SELECTOR_TYPE
} from "vega/constants/data-selection-types"

const CHART_TYPE = "box-plot"

const BoxPlotChartDefinition = {
  type: CHART_TYPE,
  typeAlias: "BOX PLOT",
  typeConstant: "BOX_PLOT",
  chartDataFormatter: getBoxPlotChartData,
  chartTypeCategories: [OMNICOMBO, NOT_BE_RENDERED],
  labelsIcons: { label: "Box Plot", icon: "chart-box-plot" },
  Component: BoxPlotChart,
  iconId: "icon-chart-box-plot",
  IconComponent: function VegaComboIconComponent() {
    return (
      <svg
        width="48"
        height="46"
        viewBox="0 0 48 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11 25V19H6.5H2V25H11Z" fill="currentColor" />
        <path d="M11 26H2V35H11V26Z" fill="currentColor" />
        <path d="M23 9H14V13H23V9Z" fill="currentColor" />
        <path d="M23 14H14V21H23V14Z" fill="currentColor" />
        <path d="M35 19H26V26H35V19Z" fill="currentColor" />
        <path d="M35 27H26V30H35V27Z" fill="currentColor" />
        <path d="M47 22H38V23V31H47V22Z" fill="currentColor" />
        <path d="M47 15H38V18V21H47V15Z" fill="currentColor" />
        <path d="M0 43.011H48" stroke="currentColor" strokeWidth="5" />
        <path d="M42.5 2.5L42.5 20.5" stroke="currentColor" />
        <line x1="42.5" y1="31" x2="42.5" y2="38" stroke="currentColor" />
        <path d="M30.5 14V23" stroke="currentColor" />
        <path d="M18.5 17L18.5 33" stroke="currentColor" />
        <path d="M18.5 0L18.5 9" stroke="currentColor" />
        <line x1="30.5" y1="30" x2="30.5" y2="37" stroke="currentColor" />
        <line x1="6.5" y1="35" x2="6.5" y2="38" stroke="currentColor" />
        <line x1="6.5" y1="11" x2="6.5" y2="19" stroke="currentColor" />
      </svg>
    )
  },
  initialChartData: {
    isNotDc: true,
    violinDistributionPrecision: 80,
    numberOfGroups: 50,
    centerLineType: BoxPlotCenterLineType.MEDIAN,
    vegaSortColumn: {
      col: { name: "countval" },
      index: 0,
      order: "desc"
    }
  },
  ChartSettingsComponent: VegaComboChartSettings,
  DataSelectionPanel: function VegaDataSelectionPanelWrapper({
    id,
    chart,
    tablePreview
  }) {
    return (
      <DataSelectionPanel
        chartId={id}
        dataSelections={chart.dataSelections}
        selectedLayerId={chart.selectedLayerId}
        tablePreview={tablePreview}
        supportedFeatures={{
          multiLayer: false,
          multiBaseDimension: false,
          multiBaseMeasure: false,
          groupByDimension: false,
          colorByMeasure: false
        }}
      />
    )
  },
  defaultColors: {
    type: "ordinal",
    key: "mapD",
    val: getColors(ORDINAL_COLORS).mapD
  },
  defaultAggregation: "Median",
  dimensionSettings: {
    isNotDc: true,
    minDimensions: 1,
    maxDimensions: 1,
    dimensions: [
      {
        name: null,
        required: true,
        type: merge(TEXT_TYPES, {
          noArrays: true,
          [CUSTOM_SQL_SELECTOR_TYPE]: true
        }),
        typeName: "string"
      }
    ],
    minMeasures: 1,
    maxMeasures: 1,
    measures: [
      {
        name: null,
        required: true,
        type: merge(ALL_NUMERICAL_TYPES, { [CUSTOM_SQL_SELECTOR_TYPE]: true })
      }
    ],
    customColorable: true,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS)["vega-combo"],
    allowedColorTypes: { ordinal: true, solid: true, custom: true },
    colorTypesFromColumnType: map(
      () => "quantitative",
      merge(NUMERICAL_AND_TIME_TYPES, TEXT_TYPES)
    ),
    aliases: { measures: { val: "size" } }
  },
  visible: getFeatureFlag(available_feature_flags.ENABLE_BOX_AND_WHISKER_CHART)
}

export default BoxPlotChartDefinition
