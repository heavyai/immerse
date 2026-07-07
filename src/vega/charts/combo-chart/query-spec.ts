// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  VegaComboChartQuerySpec,
  BaseDimensionScaleSettings,
  TimeLagSettings
} from "../types"
import {
  ComboDataSelection,
  SortColumn
} from "vega/constants/data-selection-types"

import {
  ChartFilterMetadata,
  FilterAndCohort,
  getFiltersForDataSources,
  getFiltersAppliedToLayer
} from "vega/constants/filter-metadata-types"

// In general, the QuerySpecs are meant to be all of the properties that
// the query-building functions need to build this query. However, this
// one is not a complete spec - it is missing the top N groups as well as
// the domain (min/max) if the dimension is continuous. Those properties
// will come from the dynamic preflight queries.
export const comboChartToChartQuerySpec = (
  dataSelections: ComboDataSelection[],
  binSettings: BaseDimensionScaleSettings | null,
  timeLagSettings: TimeLagSettings | null,
  sortColumn: SortColumn,
  appliedFilters: FilterAndCohort[],
  numberOfGroups: number,
  nullDimensionsEnabled: boolean,
  rangeFilter: ChartFilterMetadata | undefined,
  joinFilters: { [key: string]: string[] }
): VegaComboChartQuerySpec[] => {
  return dataSelections.map(
    (dataSelection): VegaComboChartQuerySpec => {
      const { layerId, table, dimensions, measures } = dataSelection
      const baseDimensions = dimensions.xAxis
      const groupByDimension = dimensions.color
      const sizeMeasures = measures.size
      const colorMeasure = measures.color
      const layerAppliedFilters = getFiltersAppliedToLayer(
        appliedFilters,
        layerId
      )

      if (table && baseDimensions?.length && sizeMeasures?.length) {
        const filtersForDataSource = getFiltersForDataSources(
          layerAppliedFilters,
          [table.name]
        )
        return {
          type: "vega-combo-chart" as const,
          table: table.name,
          baseDimensions,
          groupByDimension,
          sizeMeasures,
          colorMeasure,
          numberOfGroups,
          nullDimensionsEnabled,
          appliedFilters: filtersForDataSource,
          sortColumn,
          binSettings,
          timeLagSettings,
          rangeFilter,
          joinFilters: joinFilters[layerId]
        }
      } else {
        throw new Error(
          `Invalid data selection: ${JSON.stringify(dataSelection)}`
        )
      }
    }
  )
}
