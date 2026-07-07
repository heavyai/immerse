// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect } from "react"
import { connect } from "react-redux"
import { Dispatch } from "redux"
import cx from "classnames"
import { Route, useRouteMatch } from "react-router-dom"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { ROUTE_DATA_MANAGEMENT_IMPORT } from "routes/paths"
import { getDataCatalog, resetImporter } from "actions/importer-action-creators"

import { buildPostUrl } from "./utils"
import ImporterTile from "./importer-tile"
import ConnectorPage from "./connector-page"
import { ConnectorType, IMPORT_ACTIONS } from "./constants"
import ImportTableHeader from "./import-table-header"
import { useConnectors } from "./hooks/use-connectors"

import "./import-table.scss"
import { CircularProgress } from "@material-ui/core"

const { ENABLE_DATA_CATALOG } = available_feature_flags

export type DataManagerImportRouteParams = {
  tableName: string
  importAction: IMPORT_ACTIONS
  connectorType?: ConnectorType
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getDataCatalog: (url: string) => dispatch(getDataCatalog(url)),
  resetImporter: () => dispatch(resetImporter())
})

const mapStateToProps = (
  { connection: { isDataCatalogEnabled, sessionInfo, user } },
  { location: { state: locationState = {} } = {} }
) => ({
  isDataCatalogEnabled,

  database: sessionInfo?.database,
  appendTableName: locationState?.appendTableName,
  postUrl: buildPostUrl(user)
})

type Props = {
  database: string
  isDataCatalogEnabled: boolean
  initializeImporter: () => void
}

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  initializeImporter() {
    dispatchProps.resetImporter()
    if (
      getFeatureFlag(ENABLE_DATA_CATALOG) &&
      stateProps.isDataCatalogEnabled
    ) {
      dispatchProps.getDataCatalog(stateProps.postUrl)
    }
  }
})

const ImportTable: FC<Props> = ({
  isDataCatalogEnabled,
  initializeImporter
}) => {
  useEffect(() => {
    initializeImporter()
  }, [initializeImporter])

  const routeMatch = useRouteMatch()
  const { connectors, loading } = useConnectors()

  return (
    <div
      className={cx("import-table", {
        "has-selected": !routeMatch.isExact
      })}
    >
      <Route path={`${ROUTE_DATA_MANAGEMENT_IMPORT}/:connectorType?`}>
        <ImportTableHeader />
      </Route>
      <ul
        className={cx("import-table__options", {
          "has-selected": !routeMatch.isExact
        })}
      >
        {connectors
          .filter(
            ({ type }) =>
              type !== ConnectorType.DataCatalog ||
              (getFeatureFlag(ENABLE_DATA_CATALOG) && isDataCatalogEnabled)
          )
          .map(({ icon, label, type, supportedFiles }, index) => (
            <ImporterTile
              key={`${type}-${index}`}
              icon={icon}
              label={label}
              supportedFiles={supportedFiles}
              importerKey={type}
            />
          ))}
        {loading && (
          <div className="spinner-container import-table__option">
            <CircularProgress />
          </div>
        )}
      </ul>
      <Route path={`${ROUTE_DATA_MANAGEMENT_IMPORT}/:connectorType`} exact>
        <ConnectorPage />
      </Route>
    </div>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ImportTable)
