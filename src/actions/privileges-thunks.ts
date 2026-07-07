// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { map, zipWith } from "ramda"

import Services from "services/immerse"
import { setDashboardPrivileges } from "actions/dashboard-action-creators"
import { getPrivileges, getTablePrivileges } from "services/session"
import { SET_USER_PRIVILEGES } from "constants/action-types"

// The constants in this file, and mapping of privilege arrays to named privileges, are taken from
// heavydb, in the file `ThriftHandler/HeavyDBHandler.cpp`, in the function `serialize_db_object()`.

type DbObjectPrivileges = {
  privs: boolean[]
}

// Collapse to a single privileges list where each privilege
// is true if it was true anywhere in the original list
const collapsePrivileges = (
  dbObjectPrivilegesList: DbObjectPrivileges[]
): boolean[] => {
  if (
    Array.isArray(dbObjectPrivilegesList) &&
    dbObjectPrivilegesList.length > 0
  ) {
    const privilegesList: boolean[][] = map(
      ({ privs }) => privs,
      dbObjectPrivilegesList
    )

    // Reduce the list by a 'zipping' function (just '||' here) that runs on each element of the list:
    // [a1, a2], [b1, b2] => [z(a1, b1), z(a2, b2)]
    return privilegesList.reduce((accum, privileges) =>
      zipWith((a, b) => a || b, accum, privileges)
    )
  }
  return []
}

// TODO: this mapping should most def come from somewhere that genetically
// originates somehow from the heavy.thrift file in Core.
// All of this privileges code is subject to being brittle and breaking due of
// a number of single-points-of-failure along the build process that eventually
// generates this code for Immerse
const TABLE_PRIVS_NAME_MAP = {
  0: "create",
  1: "drop",
  2: "select",
  3: "insert",
  4: "update",
  5: "delete",
  6: "truncate",
  7: "alter"
}

export const createPrivsMapFromBoolArray = (boolArray) =>
  boolArray.reduce(
    (privSet, val, index) => ({
      ...privSet,
      [TABLE_PRIVS_NAME_MAP[index]]: val
    }),
    {}
  )

type TablePrivileges = {
  create: boolean
  drop: boolean
  select: boolean
  insert: boolean
  update: boolean
  delete: boolean
  truncate: boolean
  alter: boolean
}

const modifyDataSourcePrivileges = (tablePrivileges) =>
  createPrivsMapFromBoolArray(collapsePrivileges(tablePrivileges))

export const getDataSourcePrivileges = async (
  tableName: string
): Promise<TablePrivileges> => {
  const privsResp = await getTablePrivileges(tableName)
  return privsResp.ok
    ? modifyDataSourcePrivileges(await privsResp.json())
    : privsResp.text().then((error) => Promise.reject(error))
}

function setUserPrivileges(privileges) {
  return {
    type: SET_USER_PRIVILEGES,
    payload: privileges,
    fetchComplete: true
  }
}

export const getUserPrivileges = (dbName: string) => async (dispatch) => {
  const getPrivilegesResp = await getPrivileges(dbName)
  const {
    dashboard: dashboardDbObjects,
    viewSQLEditor: viewSqlEditor,
    dataSource: dataSourcePrivileges
  } = await getPrivilegesResp.json()
  const [createDashboard] = collapsePrivileges(dashboardDbObjects)
  const createTable = modifyDataSourcePrivileges(dataSourcePrivileges).create
  dispatch(setUserPrivileges({ createDashboard, createTable, viewSqlEditor }))
}

export const handleGetDashboardPrivileges = (id) => async (dispatch) => {
  const connector = Services.get("DbCon")

  const dashboardPrivs = await connector.getDbObjectPrivsAsync(
    id.toString(),
    "DashboardDBObjectType"
  )

  // Fist index in returned array is the createDashboard permission. It's ignored here
  //  since it makes no sense to have create privilege on a dashboard that already
  //  exists.
  const [, deleteDashboard, viewDashboard, editDashboard] = collapsePrivileges(
    dashboardPrivs
  )

  return dispatch(
    setDashboardPrivileges({ deleteDashboard, viewDashboard, editDashboard })
  )
}
