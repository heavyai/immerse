// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Services from "services/immerse"
import createGroupAll from "services/groupall"
import createUpdateFunctionForChart from "charts/utils/create-update-function-for-chart"
import dc from "services/dc"
import generalChartUpdate from "charts/utils/general-chart-update"
import promisifyChartCreation from "charts/utils/promisify-chart-creation"
import specificChartUpdates from "charts/utils/specific-chart-updates"
import { getTablesForDataSource } from "components/join-manager/utils"

const getCountChart = (node, chartSpec, crossfilter, connector) => {
  const tables = getTablesForDataSource(chartSpec.dataSource)
  const CountChart = dc.countWidget(node, tables)
  CountChart.countLabel("")
  const dimensions = crossfilter
  const measures = createGroupAll(connector, crossfilter)

  CountChart.dimension(dimensions).group(measures)
  crossfilter.addCountChartGroupAll(chartSpec.dataSource, measures)

  return CountChart
}

export function createCountChart(crossfilter) {
  return (chartSpec, node, callback) => {
    const connector = Services.get("DbCon")
    // If a crossfilter instance doesn't already exist, bootstrap one. This can
    // happen if the user creates a dashboard filter before creating a chart.
    if (crossfilter === null) {
      const cfManager = Services.get("crossfilter")
      const tables = getTablesForDataSource(chartSpec.dataSource)
      let cf = Services.get("CrossFilter").crossfilter(
        connector,
        tables,
        chartSpec.dataSource
      )
      return cf
        .getFieldsAsync()
        .then(() => {
          /* there's a race condition with new omnifilters - if you create a dashboard filter
             before a chart exists, you'd end up adding it to one crossfilter instance for the
             data source, and then when the count chart comes along and is created it'll create
             a new crossfilter instance.

             So we check to see if a crossfilter instance has been created, and if so we use
             that. Otherwise, we go ahead with creating the one that we've got.

             Oh! And you may ask why we don't check for it outside of the callback, right?
             That's because of the race condition - the other crossfilter instance won't exist
             at that point, but it will by the time we reach inside the callback.

             Presumably there's a more efficient way to do it. Have at it, noble engineer! */
          const existingCF = cfManager.getCrossfilter(chartSpec.dataSource)
          if (existingCF === null) {
            cfManager.setCrossfilter(chartSpec.dataSource, cf)
          } else {
            cf = existingCF
          }

          const CountChart = getCountChart(node, chartSpec, cf, connector)
          return callback(null, CountChart)
        })
        .catch((e) => callback(e))
    }

    try {
      const CountChart = getCountChart(node, chartSpec, crossfilter, connector)
      return callback(null, CountChart)
    } catch (e) {
      return callback(e)
    }
  }
}

export const createCountChartAsync = promisifyChartCreation(createCountChart)

const updates = [generalChartUpdate, specificChartUpdates]
export const updateCountChart = createUpdateFunctionForChart(...updates)
