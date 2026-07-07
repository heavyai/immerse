// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Icon } from "@rmwc/icon"
import React from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { AppState } from "vega/charts/types"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

import ImportTableRouteTitle from "./import-table-route-title"

const ImportTableHeader = () => {
  const { dbName } = useSelector(
    ({
      connection: {
        sessionInfo: { database },
        privileges: { createTable }
      }
    }: AppState) => ({ dbName: database, canCreateTable: createTable })
  )

  return !getFeatureFlag(available_feature_flags.GLOBAL_SIDE_NAV) ? (
    <>
      <Link to={`/${dbName}/data-manager`} className="tables-nav">
        <Icon icon="chevron_left" />
        <span>Tables</span>
      </Link>
      <ImportTableRouteTitle />
    </>
  ) : null
}

export default ImportTableHeader
