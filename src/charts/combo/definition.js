// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED, DEPRECATED, MULTISOURCE } from "constants/chart-types"
import { getColors, SOLID_COLORS } from "services/colors"

import {
  prepareBlob,
  defaultGetColumnKey,
  getAliases,
  exportICChartData
} from "components/chart-container-header/export-chart-data"
import JSZip from "jszip"

import Line2Container from "charts/combo/line-chart2/line2-container"
import ComboChartSettings from "./chart-settings"
import dimensionSettings from "./dimension-settings"
import getComboChartData from "./getComboChartData"

const getChartData = (chart) => {
  if (!chart.dataSource && chart.multiSources) {
    return chart.data
  } else {
    // Take the first source (data will be a multi-source hash even in single-source mode)
    return chart.data[0]
  }
}

const comboChartDefinition = {
  type: "line2",
  typeAlias: "COMBO",
  typeConstant: "LINE2",
  chartDataFormatter: getComboChartData,
  chartTypeCategories: [NOT_BE_RENDERED, DEPRECATED, MULTISOURCE],
  labelsIcons: { label: "Combo", icon: "chart-line2" },
  Component: Line2Container,
  iconId: "icon-chart-line2",
  exportChartData: {
    getChartData,
    getColumnKey: (column, columnIndex, groupType) => {
      if (groupType === "measure") {
        return `val${columnIndex === 0 ? "" : columnIndex}`
      } else {
        return defaultGetColumnKey(
          column,
          columnIndex,
          groupType,
          (colName) => colName !== "color"
        )
      }
    },
    exportChartData: (chart, doExport) => {
      if (
        chart.type === "line2" &&
        chart.dataSource &&
        Object.keys(chart.multiSources).length === 0
      ) {
        exportICChartData(chart, doExport)
        return
      }

      const data = getChartData(chart)

      // export each source as its own file
      const zip = new JSZip()
      Object.values(chart.multiSources).forEach(({ table, index }) => {
        const dimensions = chart.dimensions.filter(
          (d) => d.multiSourceIndex === index
        )
        const measures = chart.measures.filter(
          (d) => d.multiSourceIndex === index
        )
        const aliases = getAliases(dimensions, measures, chart.type)
        const { filename, blob } = prepareBlob(
          table,
          aliases,
          data[index],
          chart.type
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
  IconComponent: function ComboIconComponent() {
    return (
      <>
        <rect x="36.24" y="20.86" width="5.65" height="22.6" />
        <rect x="26.26" y="31.03" width="5.65" height="12.33" />
        <rect x="16.69" y="27.13" width="5.65" height="16.22" />
        <rect x="7.12" y="35.73" width="5.65" height="7.62" />
        <path
          d="M37.72,4.54A3.77,3.77,0,0,0,35,10.87L30,17.47a3.75,3.75,0,0,0-4.45,1l-4.89-2.23v0a3.78,3.78,0,1,0-6.41,
      2.7L9.49,25.19a3.78,3.78,0,1,0,1.34.82l4.78-6.28a3.75,3.75,0,0,0,4.73-2l4.49,2a3.78,3.78,0,1,0,6.45-1.42l4.95-6.63a3.77,3.77,0,1,0,1.5-7.24ZM8.22,31a2.21,2.21,0,1,1,
      2.21-2.21A2.22,2.22,0,0,1,8.22,31ZM16.9,18.41a2.21,2.21,0,1,1,2.21-2.21A2.22,2.22,0,0,1,16.9,18.41Zm11.54,4.69a2.21,2.21,0,1,1,2.21-2.21A2.22,2.22,0,0,1,
      28.44,23.11Zm9.28-12.58a2.21,2.21,0,1,1,2.21-2.21A2.22,2.22,0,0,1,37.72,10.53Z"
        />
      </>
    )
  },
  initialChartData: { isNotDc: true },
  ChartSettingsComponent: ComboChartSettings,
  defaultColors: {
    type: "solid",
    key: "blue",
    val: getColors(SOLID_COLORS).blue
  },
  dimensionSettings,
  visible: true
}

export default comboChartDefinition
