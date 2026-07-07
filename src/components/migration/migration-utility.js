// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { newChartIndex } from "utils/add-chart-helpers"
import { createChart, deleteChart } from "actions/charts-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import { hideWarningModal, showWarningModal } from "actions/ui-action-creators"
import { vegaChartHasError } from "vega/utils/data-selection"
import {
  updateLayout,
  addChart
} from "actions/dashboard-layout-action-creators"
import migratorMapping from "./migrator-mapping"
import createMultiSourceMap from "./multi-source-mapping"
import {
  migrateChartBinningInfo,
  migrateChartExtents,
  migrateDataSelections,
  migrateSelectorsFormatting,
  migrateSources,
  migrateChartFilters
} from "./chart-migrations/migration-utils"
import { getLayoutWithDuplicatedChart } from "utils/chart-duplication"
import chartSwitchMigrator from "./chart-migrations/chart-switch-migrator"
import {
  setNullDimensionsEnabled,
  setLegendEnabled
} from "../../vega/actions/data-selection-action-creators"
import { migrateBarChartColorPalette } from "./chart-migrations/bar-migrator"
import { batch } from "react-redux"
import { hideDashboardMigrationModal } from "components/modals/dashboard-migration-modal/actions"

// Utility function used both by migrations and chart switching
const preCopyToOmniChart = async (
  dispatch,
  sourceChart,
  newChartId,
  newChart
) => {
  const multiSourceMap = {
    ...createMultiSourceMap(newChart.dataSelections[0].layerId),
    ...(await dispatch(migrateDataSelections(sourceChart, newChartId)))
  }

  await dispatch(migrateSources(newChartId, sourceChart, multiSourceMap))

  return multiSourceMap
}

// Utility function used both by migrations and chart switching
const postCopyToOmniChart = async (dispatch, sourceChart, newChartId) => {
  await dispatch(
    setNullDimensionsEnabled(
      newChartId,
      Boolean(sourceChart.showNullDimensions)
    )
  )

  await dispatch(migrateChartExtents(sourceChart, newChartId))
  await dispatch(migrateChartBinningInfo(sourceChart, newChartId))
  await dispatch(migrateSelectorsFormatting(sourceChart, newChartId))

  if (sourceChart.type === "line2") {
    await dispatch(setLegendEnabled(newChartId, true))
  }
}

export const chartSwitchToOmniChart = (sourceChart, chartId) => async (
  dispatch,
  getState
) => {
  const multiSourceMap = await preCopyToOmniChart(
    dispatch,
    sourceChart,
    chartId,
    getState().charts[chartId]
  )
  await dispatch(migrateChartFilters(chartId, sourceChart, chartId))
  await dispatch(chartSwitchMigrator(sourceChart, chartId, multiSourceMap))
  await postCopyToOmniChart(dispatch, sourceChart, chartId)
}

export const duplicateAsOmniChart = (
  sourceChartId,
  deleteSourceChart = false
) => async (dispatch, getState) => {
  const state = getState()
  const {
    dashboard: { chartContainers }
  } = state
  const sourceChart = state.charts[sourceChartId]
  const newChartId = String(newChartIndex(chartContainers))

  await dispatch(
    createChart(newChartId, undefined, { isNotDc: true, type: "vega-combo" })
  )

  if (sourceChart.title) {
    await dispatch(updateChart(newChartId, { title: sourceChart.title }))
  }

  const multiSourceMap = await preCopyToOmniChart(
    dispatch,
    sourceChart,
    newChartId,
    getState().charts[newChartId]
  )

  let hasError = false
  let exception = null
  try {
    await dispatch(
      migratorMapping[sourceChart.type]["vega-combo"](
        sourceChartId,
        newChartId,
        multiSourceMap
      )
    )

    postCopyToOmniChart(dispatch, sourceChart, newChartId)
    await dispatch(migrateChartFilters(sourceChartId, sourceChart, newChartId))

    // Bar chart color migrator needs be called after migrateChartExtent, after vega combo binSettings is defined
    if (sourceChart.type === "row") {
      await dispatch(
        migrateBarChartColorPalette(sourceChart, newChartId, multiSourceMap)
      )
    }

    hasError = await vegaChartHasError(getState().charts[newChartId], true)
  } catch (e) {
    exception = e
    hasError = true
  }

  if (hasError === true || hasError.length) {
    await dispatch(deleteChart(newChartId))
    if (hasError.length) {
      // eslint-disable-next-line no-console
      console.error(
        "DataSelections missing dimensions.xAxises or measures.size: ",
        hasError
      )
    }
    if (exception) {
      // eslint-disable-next-line no-console
      console.error(exception)
    }
    await dispatch(
      showWarningModal({
        title: "Could not duplicate as OmniChart",
        message:
          "Something went wrong during duplication. Please migrate manually.",
        primaryAction: {
          action: () => dispatch(hideWarningModal()),
          text: "OK"
        }
      })
    )
  } else if (deleteSourceChart) {
    await dispatch(deleteChart(sourceChartId))
    await dispatch(addChart(newChartId))
  } else {
    await dispatch(addChart(newChartId))
    // Make sure duplicated charts have the same height / width as the original
    // chart
    const updatedLayout = getLayoutWithDuplicatedChart(
      getState().dashboard.layout,
      sourceChartId,
      newChartId
    )
    await dispatch(updateLayout(updatedLayout))
  }

  return newChartId
}

/**
 * Used keep migrated-in-place charts in the same place and the same size as the
 * old chart.
 *
 * Creates a new state.dashboard.layout array that makes the old chart's
 * layout object to point to the newly migrated chart. Keeps all other charts in
 * the same place.
 *
 * @param oldLayout - should equal the state.dashboard.layout, prior to making
 * any migrations
 * @param sourceChartId - the chartId of the chart to be migrated
 * @param newChartId - the chartId of the migrated source chart
 */
const updateLayoutWithMigratedChart = (
  oldLayout,
  sourceChartId,
  newChartId
) => {
  const newLayout = [...oldLayout]

  const oldLayoutIndex = oldLayout.findIndex(
    (layoutObject) => layoutObject.i === sourceChartId
  )

  return newLayout.map((l, i) => {
    if (i === oldLayoutIndex) {
      return {
        ...l,
        i: newChartId
      }
    }
    return l
  })
}

/**
 * Migrates a chart in place. Uses the duplicateAsOmniChart function with the
 * second argument (deleteSourceChart) set to `true`
 */
export const upgradeToOmniChart = (sourceChartId) => async (
  dispatch,
  getState
) => {
  const { dashboard } = getState()

  // Keep track of the layout of the dashboard prior to migration, so we can
  // reproduce it when migration is complete
  const oldLayout = dashboard.layout

  // Batch forces React to wait until all dispatches are done to do a re-render,
  // which minimizes thrash
  batch(async () => {
    await dispatch(duplicateAsOmniChart(sourceChartId, true)).then(
      async (newChartId) => {
        const newLayout = updateLayoutWithMigratedChart(
          oldLayout,
          sourceChartId,
          newChartId
        )
        return await dispatch(updateLayout(newLayout))
      }
    )
  })
}

export const bulkMigrateCharts = (selectedChartTypes) => async (
  dispatch,
  getState
) => {
  const { charts, dashboard } = getState()

  // Keep track of the layout of the dashboard prior to migration, so we can
  // reproduce it when migration is complete
  const oldLayout = dashboard.layout

  // This will be modified as each chart is migrated to point to the new chart,
  // then will eventually be used to batch-update state.dashboard.layout
  let newLayout = [...oldLayout]

  // 1. `batch` forces React to wait until all dispatches are done to do a
  //    re-render, which minimizes thrash.
  // 2. We then filter through the charts to find the chartIds that we want to
  //    migrate based on the user's selections.
  // 3. Then, we do magic. We reduce through each chartId in a way that makes
  //    each chart migration happen in sequence (rather than in parallel, which
  //    causes lots of issues with conflicting chartIds, etc).
  // 4. in `duplicateAsOmniChart`, each chart is duplicated, and then the
  //    original is removed.
  // 4. Finally, we update the layout of all the charts, adjusting the upgraded
  //    versions of each chart so they are in the same place on the dashboard
  //    and have the same size as the previous version. Also keeps
  //    non-upgraded charts in the same spot
  batch(() => {
    Object.keys(charts)
      .filter((sourceChartId) =>
        selectedChartTypes.includes(charts[sourceChartId].type)
      )
      .reduce((p, sourceChartId) => {
        return p.then(async () => {
          // the duplicateAsOmniChart returns with the newly-created chartId. We
          // use that to make modifications to the dashboard layout
          return await dispatch(duplicateAsOmniChart(sourceChartId, true)).then(
            (newChartId) => {
              newLayout = updateLayoutWithMigratedChart(
                newLayout,
                sourceChartId,
                newChartId
              )
            }
          )
        })
      }, Promise.resolve())
      .then(() => {
        // batch updating all charts' layout finally happens here
        dispatch(updateLayout(newLayout))
        dispatch(hideDashboardMigrationModal())
      })
  })
}

export function isUpgradableChart(chartType) {
  return Object.keys(migratorMapping).find((t) => chartType === t) ?? false
}
