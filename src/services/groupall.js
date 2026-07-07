// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getStore } from "services/ImmerseCrossFilter/utils"
import { setLastFilteredSize } from "@heavyai/charting/src/core/core-async"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { getJoinFilters } from "./ImmerseCrossFilter/ImmerseCrossFilterJoin"

function writeQuery(tableName, filterStrings = []) {
  let query = `SELECT COUNT(*) AS val FROM ${tableName}`

  const filterString = filterStrings.filter(Boolean).join(" AND ")
  if (filterString.length) {
    query = `${query} WHERE ${filterString}`
  }

  return process(query, { trackUsage: false })
}

export default function createGroupAll(connector, crossfilter) {
  const tableName = crossfilter.getDataSource()

  function getCrossfilter() {
    return crossfilter
  }

  function getCrossfilterId() {
    return crossfilter.getId()
  }

  function queryAsync(query, opts) {
    return crossfilter
      .queryAsync(
        query,
        {
          ...opts,
          logValues: {
            chartId: tableName,
            dashboardId: getStore().getState().dashboard.id
          }
        },
        "count"
      )
      .then((res) => {
        setLastFilteredSize(crossfilter.getId(), res[0].val)
        return res[0].val
      })
  }

  function valueAsync(
    opts = {
      columnarResults: true,
      eliminateNullRows: false,
      renderSpec: null,
      queryId: null
    }
  ) {
    const filter = crossfilter.getFilterString()
    const dashboardFilter = crossfilter.getGlobalFilterString()

    // Get the relevant cross-link style filters for our charts tables
    // This picks through omnifilters, and applies a crosslink style filter if
    // the omnifilter uses a join datasource that includes one of our tables
    const tables = crossfilter.getTables()
    const joinFilters = getJoinFilters({
      tables,
      chartId: tableName
    })
    const filterStrings = [filter, dashboardFilter, ...joinFilters]
    const query = writeQuery(tableName, filterStrings)
    return queryAsync(query, opts)
  }

  return {
    getCrossfilter,
    getCrossfilterId,
    valueAsync
  }
}
