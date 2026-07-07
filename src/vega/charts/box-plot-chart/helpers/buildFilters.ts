// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  andFilter,
  Filter,
  multiSourceFilter,
  notNullFilter,
  nullFilter,
  orFilter,
  simpleFilter
} from "vega/constants/filter-types"
import {
  ValueWithOp,
  TransformedDatum
} from "vega/charts/combo-chart/combo-chart"
import { BoxPlotDataSelection } from "vega/constants/data-selection-types"
import {
  clearFilterByName,
  setCrossFilter
} from "vega/actions/filter-action-creators"

/**
 * Build crossfilters
 * @param id The chart ID
 * @param crossfilterName Name of the crossfilter to create/edit
 * @param dimensionColumnsByTable Map of table to dimension columns
 * @param values The values to filter by
 * @param extract The timeBin to extract, if enabled; undefined otherwise
 */
export const buildFilters = (
  store: any,
  id: string,
  crossfilterName: string,
  data: TransformedDatum[],
  dataSelections: BoxPlotDataSelection[],
  values: ValueWithOp[],
  extract: string | undefined = undefined
) => {
  // Each filter value may correspond to multiple data rows from the data if we
  // have multiple layers. Additionally, if a layer has multiple base
  // dimensions, the filter value will be something like "dim1 / dim2 / ..."
  // and we need to match those dimensions to the corresponding columns.
  const filtersByDataSource = {} as Record<
    string,
    {
      positiveFilters: Filter[]
      negativeFilters: Filter[]
    }
  >

  values.forEach((value) => {
    ;["boxPlotTable", "violinPlotTable", "outliersTable"].forEach(
      (tableName) => {
        const tableData = data[tableName]
        // find all data matching this dimension and build corresponding filters
        const matchingData = tableData.filter(
          (datum) => datum.dimension === value.value
        )
        matchingData.forEach((datum) => {
          // TODO: when we implement layers, will need to store dataSelectionIndex on each val and reference here
          const {
            dimensions: { xAxis: baseDimensions }
          } = dataSelections[0]
          // Confusing that this property is table in the dim, but this is
          // the datasource, which can be a param ${stuff}. The column within the baseDimension
          // has the columns source table
          const dataSource = baseDimensions[0].table
          let filtersForDataSource = filtersByDataSource[dataSource]
          if (!filtersForDataSource) {
            filtersForDataSource = {
              positiveFilters: [],
              negativeFilters: []
            }
            filtersByDataSource[dataSource] = filtersForDataSource
          }

          // create a filter for each base dimension
          const filters = baseDimensions.flatMap((dim) => {
            const [columnExpression, columnType, dataTypeIsArray, table] =
              dim.type === "column"
                ? [
                    dim.column.value,
                    dim.column.type,
                    dim.column.is_array,
                    dim.column.table
                  ]
                : // Custom SQL dimensions
                  [dim.sql, dim.column?.type, false, dim.table]
            if (!columnType) {
              return [] as Filter[]
            }

            if (datum.dimension0 === null) {
              if (value.op === "=") {
                return [
                  nullFilter(table, dataSource, columnExpression, columnType, {
                    extract,
                    dataTypeIsArray
                  })
                ]
              } else {
                return [
                  notNullFilter(
                    table,
                    dataSource,
                    columnExpression,
                    columnType,
                    {
                      extract,
                      dataTypeIsArray
                    }
                  )
                ]
              }
            }

            return [
              simpleFilter(
                table,
                dataSource,
                columnExpression,
                columnType,
                value.op,
                datum.dimension0,
                { extract, dataTypeIsArray }
              )
            ]
          })

          // Positive filters will end up being something like:
          //   (col1 = dim1 AND col2 = dim2) OR ...
          // Negative filters will be the boolean opposite:
          //   (col1 <> dim1 OR col2 <> dim2) AND ...
          if (value.op === "=") {
            filtersForDataSource.positiveFilters.push(andFilter(filters))
          } else {
            filtersForDataSource.negativeFilters.push(orFilter(filters))
          }
        })
      }
    )
  })

  // finally, for each datasource, we need to AND all the filters together
  const finalFiltersByDataSource = Object.fromEntries(
    Object.entries(filtersByDataSource).flatMap(
      ([ds, { positiveFilters, negativeFilters }]) => {
        const combinedFilters = []
        if (positiveFilters.length > 0) {
          combinedFilters.push(orFilter(positiveFilters))
        }
        if (negativeFilters.length > 0) {
          combinedFilters.push(andFilter(negativeFilters))
        }
        if (combinedFilters.length > 0) {
          return [[ds, andFilter(combinedFilters)]]
        } else {
          return []
        }
      }
    )
  )

  if (Object.keys(finalFiltersByDataSource).length === 0) {
    store.dispatch(clearFilterByName(crossfilterName))
  } else {
    const filter = multiSourceFilter(finalFiltersByDataSource)
    store.dispatch(setCrossFilter(filter, id, undefined, crossfilterName))
  }
}
