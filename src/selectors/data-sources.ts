// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { findJoinDataSourceForParameter } from "components/join-manager/use-join-from-parameter"
import { defaultMemoize } from "reselect"

type DataSourceGroup = string[]

export const makeSelectGroupedOptions = (
  options: DataSourceGroup[],
  joinDataSources = []
) =>
  options.map((groups) => ({
    options: groups.map((dataSource) => {
      const joinDataSource = findJoinDataSourceForParameter(
        dataSource,
        joinDataSources
      )
      return {
        label: joinDataSource ? joinDataSource.name : dataSource,
        value: dataSource
      }
    })
  }))

// Group active/in-use data sources and sort them to top
export const sortedDataSourcesSelector = defaultMemoize(
  (
    dashboardSources: { [source: string]: any },
    allSources: {
      name: string
    }[]
  ) => {
    const dataSourcesInUse = Object.keys(dashboardSources)
    const sourcesInUseSet = new Set(dataSourcesInUse)

    return [
      dataSourcesInUse.sort((a, b) => a.localeCompare(b)),
      allSources
        .map(({ dataSource, name }) => dataSource ?? name)
        .filter((source) => !sourcesInUseSet.has(source))
        .sort((a, b) => a.localeCompare(b))
    ]
  }
)
