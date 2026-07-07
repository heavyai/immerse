// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { OMNICOMBO, NOT_BE_RENDERED } from "constants/chart-types"
import {
  getColors,
  ORDINAL_COLORS,
  CHARTS_DEFAULT_COLORS
} from "services/colors"
import {
  ALL_TYPES,
  NUMERICAL_AND_TIME_TYPES,
  TEXT_TYPES
} from "constants/data-types"
import { CUSTOM_SQL_SELECTOR_TYPE } from "vega/constants/data-selection-types"
import { map, merge } from "ramda"
import JSZip from "jszip"
import { getChartAddonTypes } from "chart-addons/chart-addon-registry"
import "./vega-combo-crossfilter-replay"

import { getLatestBeatData } from "vega/utils/data"
import { prepareBlob } from "components/chart-container-header/export-chart-data"

import VegaComboChart from "vega/charts/combo-chart/combo-chart-parent"
import VegaComboChartSettings from "./chart-settings"
import getVegaComboChartData from "./getVegaComboChartData"

import VegaDataSelectionPanel from "vega/data-selection/data-selection-panel"

const { VEGA_COMBO_CHART_ADDON_CROSSFILTER_REPLAY } = getChartAddonTypes()

const CHART_TYPE = "vega-combo"

const vegaComboChartDefinition = {
  type: CHART_TYPE,
  typeAlias: "COMBO",
  typeConstant: "VEGA_COMBO",
  chartDataFormatter: getVegaComboChartData,
  chartTypeCategories: [OMNICOMBO, NOT_BE_RENDERED],
  labelsIcons: { label: "Combo", icon: "chart-vega-combo" },
  Component: VegaComboChart,
  iconId: "icon-chart-vega-combo",
  exportChartData: {
    exportChartData: (chart, doExport) => {
      const data = chart.data
      // export each layer as its own file
      const zip = new JSZip()

      const getSelectorLabelWithAgg = (selector) => {
        // Count is the only one that won't hav a column
        if (!selector?.column && selector?.type !== "count") {
          return null
        }

        if (selector.type === CUSTOM_SQL_SELECTOR_TYPE) {
          return selector.name
        } else if (selector.type === "count") {
          return "# Records"
        } else {
          const agg = selector.aggregate
          const columnLabel = selector.column.label

          return agg ? `${columnLabel}(${agg})` : columnLabel
        }
      }

      data.focus.forEach((layerBeats, index) => {
        const layerData = getLatestBeatData(layerBeats).table

        const dataSelection = chart.dataSelections[index]

        const dimensionLabelEntries = dataSelection.dimensions.xAxis.map(
          (d, idx) => [
            `dimension${idx}`,
            getSelectorLabelWithAgg(d) ?? `dimension${idx}`
          ]
        )
        const measureLabelEntries = dataSelection.measures.size.map(
          (m, idx) => [
            `measure${idx}`,
            getSelectorLabelWithAgg(m) ?? `measure${idx}`
          ]
        )

        const aliases = Object.fromEntries(
          [
            ...dimensionLabelEntries,
            ...measureLabelEntries,
            // Include color measures/dims and counts if they're there
            layerData?.some((ld) => Object.keys(ld).includes("countval"))
              ? ["countval", "countval"]
              : false,
            dataSelection.measures.color?.column
              ? [
                  "measureColor",
                  getSelectorLabelWithAgg(dataSelection.measures.color)
                ]
              : false,
            dataSelection.dimensions.color?.column
              ? [
                  "dimensionColor",
                  getSelectorLabelWithAgg(dataSelection.dimensions.color)
                ]
              : false
          ].filter(Boolean)
        )

        const { filename, blob } = prepareBlob(
          chart.dataSelections[index].table.name,
          aliases,
          layerData,
          CHART_TYPE
        )
        zip.file(filename, blob)
      })

      zip.generateAsync({ type: "blob" }).then((content) => {
        const timeStamp = new Date(Date.now())
          .toISOString()
          .replace(/[-:.]/gi, "")
        doExport(`immerse-${timeStamp}.zip`, content)
      })
    }
  },
  IconComponent: function VegaComboIconComponent() {
    return (
      <>
        <rect x="2.28" y="37.691" width="7.874" height="3.937" />
        <rect x="2.28" y="31.785" width="7.874" height="3.937" />
        <rect x="2.28" y="25.88" width="7.874" height="3.937" />
        <rect x="14.091" y="25.88" width="7.874" height="9.843" />
        <rect x="14.091" y="19.974" width="7.874" height="3.937" />
        <rect x="14.091" y="37.691" width="7.874" height="3.937" />
        <rect x="25.902" y="39.659" width="7.874" height="1.969" />
        <rect x="25.902" y="35.722" width="7.874" height="1.969" />
        <rect x="25.902" y="27.848" width="7.874" height="5.906" />
        <rect x="37.714" y="19.974" width="7.874" height="15.748" />
        <rect x="37.714" y="16.037" width="7.874" height="1.969" />
        <rect x="37.714" y="37.691" width="7.874" height="3.937" />
        <path
          d="M5.628,16.037l12.4,-12.796l11.811,12.796l11.639,-12.176"
          stroke="currentColor"
          fill="none"
          strokeWidth="3"
        />
        <circle cx="6.217" cy="15.141" r="2.953" />
        <circle cx="29.839" cy="15.651" r="2.953" />
        <circle cx="41.651" cy="3.241" r="2.953" />
        <circle cx="18.028" cy="2.942" r="2.953" />
        <line
          y1="48"
          x2="48"
          y2="48"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
        />
      </>
    )
  },
  initialChartData: { isNotDc: true },
  addons: [VEGA_COMBO_CHART_ADDON_CROSSFILTER_REPLAY],
  ChartSettingsComponent: VegaComboChartSettings,
  DataSelectionPanel: function VegaDataSelectionPanelWrapper({
    id,
    chart,
    tablePreview
  }) {
    return (
      <VegaDataSelectionPanel
        chartId={id}
        dataSelections={chart.dataSelections}
        selectedLayerId={chart.selectedLayerId}
        tablePreview={tablePreview}
        chartBinSettings={chart.binSettings}
      />
    )
  },
  defaultColors: {
    type: "ordinal",
    key: "mapD",
    val: getColors(ORDINAL_COLORS).mapD
  },
  dimensionSettings: {
    isNotDc: true,
    minDimensions: 1,
    maxDimensions: Infinity,
    dimensions: [
      {
        name: null,
        required: true,
        type: merge(ALL_TYPES, {
          noArrays: true,
          [CUSTOM_SQL_SELECTOR_TYPE]: true
        })
      },
      {
        name: "color",
        required: false,
        type: merge(ALL_TYPES, {
          noArrays: true,
          [CUSTOM_SQL_SELECTOR_TYPE]: true
        })
      }
    ],
    minMeasures: 1,
    maxMeasures: Infinity,
    measures: [
      {
        name: null,
        type: merge(ALL_TYPES, {
          noArrays: true,
          [CUSTOM_SQL_SELECTOR_TYPE]: true
        }),
        required: true
      },
      {
        name: "color",
        type: merge(ALL_TYPES, {
          noArrays: true,
          [CUSTOM_SQL_SELECTOR_TYPE]: true
        })
      }
    ],
    customColorable: true,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS)["vega-combo"],
    allowedColorTypes: { ordinal: true, solid: true, custom: true },
    colorTypesFromColumnType: map(
      () => "quantitative",
      merge(NUMERICAL_AND_TIME_TYPES, TEXT_TYPES)
    ),
    aliases: { measures: { val: "size", color: "color" } }
  },
  visible: true
}

export default vegaComboChartDefinition
