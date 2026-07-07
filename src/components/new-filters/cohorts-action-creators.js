// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { getStore } from "services/ImmerseCrossFilter/utils"
import { buildFilterSql } from "vega/constants/filter-types"
import connector from "services/connector"

export const ADD_COHORT = "ADD_COHORT"
export const RENAME_COHORT = "RENAME_COHORT"
export const DELETE_COHORT = "DELETE_COHORT"
export const DELETE_ALL_COHORTS = "DELETE_ALL_COHORTS"

export function addCohort({
  id = pushid(),
  dataSource,
  table,
  dimension,
  filter,
  name
}) {
  return async (dispatch) => {
    await dispatch({
      type: ADD_COHORT,
      payload: {
        id,
        dataSource,
        table,
        dimension,
        filter,
        name
      }
    })
    if (getFeatureFlag(available_feature_flags.USE_CACHED_COHORTS)) {
      await window.refreshCohorts(id)
    }
  }
}

export function renameCohort(id, newName) {
  return {
    type: RENAME_COHORT,
    payload: { id, newName }
  }
}

export function deleteCohort(id) {
  return {
    type: DELETE_COHORT,
    payload: { id }
  }
}

export function deleteAllCohorts() {
  return {
    type: DELETE_ALL_COHORTS
  }
}

if (getFeatureFlag(available_feature_flags.USE_CACHED_COHORTS)) {
  window.getCohortTableName = function getCohortTableName(name) {
    const dashboardId = getStore().getState().dashboard.id

    const cohortName = name.replace(/\W/g, "_")
    const table = `_immerse_internal_cohort_${dashboardId}_${cohortName}`
    return table
  }

  window.refreshCohorts = async function refreshCohorts(
    cohortId,
    rebuild = true
  ) {
    const cohorts = getStore().getState().cohorts
    for (const id of Object.keys(cohorts)) {
      if (cohortId !== undefined && id !== cohortId) {
        // eslint-disable-next-line
        continue
      }
      const cohort = cohorts[id]

      const table = window.getCohortTableName(cohort.name)

      if (!rebuild) {
        const checkStmt = `select count(*) from ${table}`
        try {
          await connector.queryAsync(checkStmt)
          // eslint-disable-next-line
          continue
        } catch (e) {
          // console.log("TABLE DOES NOT EXIST. CONTINUE")
        }
      }

      const sql = `SELECT ${cohort.dimension.name} FROM ${
        cohort.dataSource
      } WHERE ${buildFilterSql([cohort.filter])[0]} GROUP BY ${
        cohort.dimension.name
      }`
      const dropStmt = `DROP TABLE IF EXISTS ${table}`
      const createStmt = `CREATE TEMPORARY TABLE ${table} AS ${sql}`

      try {
        await connector.queryAsync(dropStmt)
        await connector.queryAsync(createStmt)
      } catch (e) {
        // eslint-disable-next-line
        console.log("COULD NOT CREATE COHORT TABLE : ", cohort.name, e)
      }
    }
  }
}
