// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import { AnyAction } from "redux"
import { ThunkDispatch } from "redux-thunk"
import { connect, ConnectedProps } from "react-redux"
import { SimpleDialog } from "widgets/dialog/Dialog"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { Checkbox } from "@rmwc/checkbox"

import { AppState } from "vega/charts/types"

import { hideDashboardMigrationModal } from "components/modals/dashboard-migration-modal/actions"
import { bulkMigrateCharts } from "components/migration/migration-utility"
import { getTypeAlias } from "components/chart-type-button/chart-type-button"

import MigrationMapping from "components/migration/migrator-mapping"

import "./styles.scss"

const MIGRATABLE_CHARTS = new Set(Object.keys(MigrationMapping))

const capitalize = (s: string): string => {
  if (typeof s !== "string") {
    return ""
  }
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

const mapStateToProps = (state: AppState) => {
  const { charts, ui } = state
  let totalMigratableCharts = 0
  const numMigratableChartsByType: Record<string, number> = Object.values(
    charts
  )
    .filter((chart) => MIGRATABLE_CHARTS.has(chart.type))
    .map((chart) => chart.type)
    .reduce((prev, current) => {
      totalMigratableCharts++
      return {
        ...prev,
        [current]: prev[current] ? prev[current] + 1 : 1
      }
    }, {})

  return {
    numMigratableChartsByType,
    totalMigratableCharts,
    migrationInProgress: ui.modal.migrationInProgress
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>
) => {
  return {
    actions: {
      hide() {
        dispatch(hideDashboardMigrationModal())
      },
      startMigration() {
        dispatch({
          type: "BULK_MIGRATE_CHARTS_START"
        })
      },
      bulkMigrateCharts(selectedChartTypes: Record<string, boolean>) {
        // Get a string array of all the chart types that the user has selected
        const chartTypesArray = Object.keys(selectedChartTypes).filter(
          (c) => selectedChartTypes[c]
        )
        dispatch(bulkMigrateCharts(chartTypesArray))
      }
    }
  }
}

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  {},
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector>

const DashboardMigrationModal: FC<Props> = ({
  numMigratableChartsByType,
  totalMigratableCharts,
  migrationInProgress,
  actions
}) => {
  // An object describing which chart types will be migrated. By default, has
  // chart types as keys and each value set to "true" by default, e.g. {
  // "line2": true, "histogram": true}.
  const defaultSelectedChartTypes = Object.keys(
    numMigratableChartsByType
  ).reduce((prev, current) => {
    return {
      ...prev,
      [current]: true
    }
  }, {})

  const [selectedChartTypes, setSelectedChartTypes] = useState<
    Record<string, boolean>
  >(defaultSelectedChartTypes)

  useEffect(() => {
    // Once the component re-renders showing that the migration is in process,
    // dispatch an action to start the migration
    if (migrationInProgress) {
      actions.bulkMigrateCharts(selectedChartTypes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [migrationInProgress, selectedChartTypes])

  const toggleChartType = (chartType: string) => {
    setSelectedChartTypes({
      ...selectedChartTypes,
      [chartType]: !selectedChartTypes[chartType]
    })
  }

  // What gets displayed if there are charts to migrate
  const hasChartsToMigrate = () => (
    <>
      <p>
        <b>
          Are you ready to upgrade the following charts on this dashboard page?
        </b>
      </p>
      <div className="__chart-type-container">
        {Object.keys(numMigratableChartsByType).map((chartType) => (
          <div key={chartType} className="__chart-type-selection">
            <Checkbox
              checked={selectedChartTypes[chartType]}
              onChange={() => toggleChartType(chartType)}
            />
            <div className="__chart-type-label">
              {numMigratableChartsByType[chartType]}{" "}
              {capitalize(getTypeAlias(chartType))}{" "}
              {numMigratableChartsByType[chartType] === 1 ? "chart" : "charts"}
            </div>
          </div>
        ))}
      </div>
      <p>
        {"These charts will be upgraded to the "}
        <a
          href="https://docs.heavy.ai/immerse/immerse-chart-types/new-combo"
          className="docs-link"
        >
          new combo chart
        </a>
        .
      </p>
      <p>
        After upgrading your charts, please verify them and save the dashboard
        to keep changes.
      </p>
    </>
  )

  const hasNoChartTypesSelected = !Object.values(selectedChartTypes).some(
    (v) => v
  )

  return (
    <SimpleDialog
      title="Upgrade Charts on Page"
      footer={
        <>
          {!migrationInProgress && (
            <SecondaryButton onClick={actions.hide}>No, cancel</SecondaryButton>
          )}
          {totalMigratableCharts ? (
            <PrimaryButton
              onClick={actions.startMigration}
              disabled={hasNoChartTypesSelected}
            >
              {migrationInProgress ? "Upgrading..." : "Yes, upgrade"}
            </PrimaryButton>
          ) : null}
        </>
      }
      open
      onClose={actions.hide}
      className="dashboard-migration-modal"
    >
      <div className="__body">
        {totalMigratableCharts
          ? hasChartsToMigrate()
          : "There are no charts on this dashboard that can be upgraded."}
      </div>
    </SimpleDialog>
  )
}

export default connector(DashboardMigrationModal)
