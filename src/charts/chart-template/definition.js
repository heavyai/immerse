// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED } from "constants/chart-types"
import { getColors, ORDINAL_COLORS } from "services/colors"
import { ALL_NUMERICAL_TYPES } from "constants/data-types"

import ChartTemplate from "./chart"
import ChartTemplateSettings from "./chart-settings"

const chartTemplateDefinition = {
  type: "chart-template",
  typeAlias: "CHART_TEMPLATE",
  typeConstant: "CHART_TEMPLATE",
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "Template", icon: "chart-template" },
  Component: ChartTemplate,
  iconId: "icon-chart-chart-template",
  exportChartData: {
    // this function should return the data that was loaded into your chart. The typical pattern
    // is to stick it into the chart's redux data under a `data` key.
    getChartData: (chart) => chart.data
    // you almost assuredly do not need to construct a blob of your data yourself, but if you need to,
    // here's the function signature
    /* getChartBlob: ({
      dataSource,
      chartType,
      timeStamp,
      outputData,
      fields
    }) => {
      const filename = `immerse-${dataSource}-${chartType}-${timeStamp}.csv`
      const csvData = json2csv({ data: outputData, fields })
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" })
      return { filename, blob }
    } */

    // these functions have handy defaults that return the dataSource/dimensions/measures, assuming
    // that they are structured the same way as the old immerse-charting charts.

    // do something to get the chart's data source.
    /* getChartDataSource : (chart) => ... */

    // do something to get the chart's dimensions.
    /* getChartDimensions : (chart) => ... */

    // do something to get the chart's measures.
    /* getChartMeasures : (chart) => ... */

    // when you call getAliases to get a map of column ID -> column alias label, this is the function
    // that maps the column object to a lookup key to get the object from.
    /* getColumnKey(column, columnIndex, groupType,excludeColumn = () => false => {
      groupType will either be 'dimension' or 'measure'.
      return back whatever the key should be when you build the aliases for the column headers.
      Something like `key0`, which would be dimension at index 0, and will eventually get mapped to
      a label like "Foo"
    } */

    // you can completely override the export process and manually handle everything. This is good for
    // new style charts that don't conform to any of the immerse-chartng conventions. You can still import
    // functions from components/chart-container-header/export-chart-data to get at immerse-charting behavior
    // and other functions to populate defaults, but you'll need to do everything yourself.
    /* exportChartData : (chart, doExport) => {
      // do what you need to do to export the chart's data. You're completely on your own
      // at tihs point.
      doExport(filename, content)
    } */
  },
  IconComponent: function ChartTemplateIconComponent() {
    return (
      <g transform="scale(0.05 0.05)">
        <path d="M79.5,11.1V10c32.3,49.1,62.3,100.6,92.4,152.1c61.3,22.3,124,43.3,183.7,67.4c6.1,33,13,65.2,18.4,98.9c-58.4-21.8-117.4-42.7-176.1-64c0.7,8.3,2.5,15.5,4.4,22.7c61,21.5,121.2,44,181.4,66.3c3.3,21.8,11.1,44.7,13.1,64.2c-65.1-24.4-130.3-48.6-195.6-72.8c-0.1,7.7-0.1,15.3,1.1,21.7c50.6,18.4,100.1,37.9,148.8,56.4c17,6.4,36.7,9.8,51.1,18.4c8.7,5.2,15.8,17,24,25.1c25.8,25.8,49,52,74.9,74.9c24.4-24.3,47.8-51,72.7-76.1c8.2-8.1,16.8-20.4,25-25c14.4-8,33.4-11.2,50-17.4c50-19.1,98.4-38.1,148.8-56.4c0.7-6.7,1.6-13,1.1-20.7c-65.7,23.1-132.5,50.9-196.7,71.7c5.5-21.3,9.5-44.1,15.2-65.2c60.9-21,119.5-44.3,180.3-65.3c0.8-6.8,1.5-13.7,1.1-21.8c-59,20.5-119.6,44.9-177.1,63.1c8.6-33,14.6-68.6,23.9-101c61.9-20.8,121.1-44.1,182.6-65.2c30-51.5,60-102.8,92.3-152.1v1.1c-17.1,126-34,253.1-49.9,383.5c-2.2,17.8-2.9,38.8-7.7,53.2c-3,9.6-14.1,23.6-21.7,34.8C728,651.6,612.2,821.3,501.1,990C387,824,273.9,653.5,159.9,482.6c-7.5-11.4-19.3-23.8-22.8-33.7c-4.7-13.8-5.3-35.5-7.6-54.3C113.6,268.6,96.5,132.3,79.5,11.1 M409.8,664.1c3.6,3.8,9.2,10.3,11.9,8.8c16.6-35.9,32-73.2,47.9-109.8c-81.3-28.7-158.6-61.6-240.2-90.1C287.5,536.4,351.1,602,409.8,664.1 M770.5,472.9c-81.2,29.2-160.3,60.5-240.1,91.3c16.4,36.1,31.8,73.2,47.9,109.7C641.8,610.7,708.3,540.9,770.5,472.9" />
        <path d="M353.4,17.7l1-1.1C392,76,426.6,138.4,465.2,196.9H500c10,0,24.5,3,33.7,0c8.2-2.8,24.3-36.6,29.3-44.6c27.9-45,56.7-96.1,83.7-135.9c-19.8,112.8-41.1,239.3-61.9,357.5c-3.1,17.4-2.9,36.5-8.7,51c-5.9,14.7-26.3,29.8-38,42.4c-13.8,14.7-25.6,28.7-39.2,40.2c-17.4-20.4-37.5-40-57.6-61.9c-6.6-7.2-15.9-13.9-18.5-20.7c-2.5-6.7-2.7-17.3-4.3-26.1C397.1,276.3,375.3,135.1,353.4,17.7 M502.2,381.6c7.9-35.9,18.7-69.1,27.1-104.3h-55.4C482.3,313.1,491.3,348.2,502.2,381.6" />
        <path d="M864,501.1c-11.4,111.3-29.6,225.4-43.4,337.9c-95,49.2-188.3,100-283.6,148.9C645.3,824.9,755.4,663.7,864,501.1" />
        <path d="M181.7,841.1c-14.3-112.5-29.3-224.2-44.6-335.7c4.3-2.2,6.5,6.9,9.8,11.9c49.9,74.6,103.5,151.1,154.3,227.1c55,82,109.7,164.4,164,244.5l1.1,1.1C372.6,943.6,276.3,890.3,181.7,841.1" />
        <path d="M79.5,11.1V10c32.3,49.1,62.3,100.6,92.4,152.1c61.3,22.3,124,43.3,183.7,67.4c6.1,33,13,65.2,18.4,98.9c-58.4-21.8-117.4-42.7-176.1-64c0.7,8.3,2.5,15.5,4.4,22.7c61,21.5,121.2,44,181.4,66.3c3.3,21.8,11.1,44.7,13.1,64.2c-65.1-24.4-130.3-48.6-195.6-72.8c-0.1,7.7-0.1,15.3,1.1,21.7c50.6,18.4,100.1,37.9,148.8,56.4c17,6.4,36.7,9.8,51.1,18.4c8.7,5.2,15.8,17,24,25.1c25.8,25.8,49,52,74.9,74.9c24.4-24.3,47.8-51,72.7-76.1c8.2-8.1,16.8-20.4,25-25c14.4-8,33.4-11.2,50-17.4c50-19.1,98.4-38.1,148.8-56.4c0.7-6.7,1.6-13,1.1-20.7c-65.7,23.1-132.5,50.9-196.7,71.7c5.5-21.3,9.5-44.1,15.2-65.2c60.9-21,119.5-44.3,180.3-65.3c0.8-6.8,1.5-13.7,1.1-21.8c-59,20.5-119.6,44.9-177.1,63.1c8.6-33,14.6-68.6,23.9-101c61.9-20.8,121.1-44.1,182.6-65.2c30-51.5,60-102.8,92.3-152.1v1.1c-17.1,126-34,253.1-49.9,383.5c-2.2,17.8-2.9,38.8-7.7,53.2c-3,9.6-14.1,23.6-21.7,34.8C728,651.6,612.2,821.3,501.1,990C387,824,273.9,653.5,159.9,482.6c-7.5-11.4-19.3-23.8-22.8-33.7c-4.7-13.8-5.3-35.5-7.6-54.3C113.6,268.6,96.5,132.3,79.5,11.1 M409.8,664.1c3.6,3.8,9.2,10.3,11.9,8.8c16.6-35.9,32-73.2,47.9-109.8c-81.3-28.7-158.6-61.6-240.2-90.1C287.5,536.4,351.1,602,409.8,664.1 M770.5,472.9c-81.2,29.2-160.3,60.5-240.1,91.3c16.4,36.1,31.8,73.2,47.9,109.7C641.8,610.7,708.3,540.9,770.5,472.9" />
        <path d="M353.4,17.7l1-1.1C392,76,426.6,138.4,465.2,196.9H500c10,0,24.5,3,33.7,0c8.2-2.8,24.3-36.6,29.3-44.6c27.9-45,56.7-96.1,83.7-135.9c-19.8,112.8-41.1,239.3-61.9,357.5c-3.1,17.4-2.9,36.5-8.7,51c-5.9,14.7-26.3,29.8-38,42.4c-13.8,14.7-25.6,28.7-39.2,40.2c-17.4-20.4-37.5-40-57.6-61.9c-6.6-7.2-15.9-13.9-18.5-20.7c-2.5-6.7-2.7-17.3-4.3-26.1C397.1,276.3,375.3,135.1,353.4,17.7 M502.2,381.6c7.9-35.9,18.7-69.1,27.1-104.3h-55.4C482.3,313.1,491.3,348.2,502.2,381.6" />
        <path d="M864,501.1c-11.4,111.3-29.6,225.4-43.4,337.9c-95,49.2-188.3,100-283.6,148.9C645.3,824.9,755.4,663.7,864,501.1" />
        <path d="M181.7,841.1c-14.3-112.5-29.3-224.2-44.6-335.7c4.3-2.2,6.5,6.9,9.8,11.9c49.9,74.6,103.5,151.1,154.3,227.1c55,82,109.7,164.4,164,244.5l1.1,1.1C372.6,943.6,276.3,890.3,181.7,841.1" />
      </g>
    )
  },
  // if you're creating a new chart via reducers/charts/helpers/initialChart.initialChart, add on extra data here upon init.
  // most new charts should set isNotDc here.
  initialChartData: { isNotDc: true },
  ChartSettingsComponent: ChartTemplateSettings,

  defaultColors: {
    type: "ordinal",
    key: "blueRed",
    val: getColors(ORDINAL_COLORS).blueRed
  },
  dimensionSettings: {
    isNotDc: true,
    minDimensions: 1,
    maxDimensions: 1,
    dimensions: [{ name: "base", required: true }],
    minMeasures: 1,
    maxMeasures: 1,
    measures: [
      {
        name: "base",
        required: true,
        type: ALL_NUMERICAL_TYPES,
        aggType: "Avg"
      }
    ],
    customColorable: false,
    allowedColorTypes: { none: true },
    aliases: {
      measures: {
        base: "Base"
      }
    }
  },

  // charts can be versioned. It's good to explicitly start them at 1.0. Legacy charts
  // may have no version stored, in which case an undefined should be thought of as 1.0.
  version: 1.0,
  // the upgrader is given a chart object out of redux, which you can then do as you please with.
  // Here's a boilerplate you can follow, but there are any number of ways to implement this.
  // PLEASE NOTE - as new chart data is added with a version bump, you should provide it to
  // initialChartData to ensure it gets added. If you don't, you may create an inconsistent chart.
  // you can possibly make use of addInitialDataToChart from charts/utils/initialze-new-chart to blindly
  // add all new data to a chart, just be warned that that function will only add values which were previously
  // undefined
  /* versionUpgrader: (chart) => {
    let newChart = { ...chart }
    if (newChart.version === undefined || newChart.version === 1.0) {
      newChart = {
        ...newChart,
        version: 1.1,
        somethingGaugely: true,
        otherthing: "huh"
      }
    }

    if (newChart.version === 1.1) {
      newChart = {
        ...newChart,
        version: 1.2,
        otherthing: "no",
        extraStuff: "yes"
      }
    }

    newChart = addInitialDataToChart(chart)

    return chart === newChart ? chart : newChart
  }, */

  visible: false
}

export default chartTemplateDefinition
