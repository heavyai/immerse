// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, FC } from "react"
import { connect } from "react-redux"
import { useParams, useHistory } from "react-router"

import {
  DataCatalog,
  DataCatalogItem
} from "components/table-importer/data-catalog/types"

import DataCatalogCard from "components/table-importer/data-catalog/data-catalog-card"
import ImportDataCatalogFilters from "components/data-manager/import-data-catalog-filters"

import "./import-data-catalog.scss"
import { buildPostUrl } from "./utils"
import { submitDataCatalogConnector as submitDataCatalogConnectorAction } from "../../actions/importer-action-creators"
import { pushImportPreviewRoute } from "./utils/push-import-preview-route"

const mapStateToProps = ({
  importer: { dataCatalog },
  connection: { user }
}) => ({
  dataCatalog,
  serverURL: buildPostUrl(user)
})

const mapDispatchToProps = (dispatch) => ({
  submitDataCatalogConnector(item: DataCatalogItem) {
    dispatch(submitDataCatalogConnectorAction(item))
  }
})

type Props = {
  dataCatalog: DataCatalog
  serverURL: string
  submitDataCatalogConnector: (item: DataCatalogItem) => void
}

const ImportDataCatalog: FC<Props> = ({
  dataCatalog,
  serverURL,
  submitDataCatalogConnector
}) => {
  const [search, setSearch] = useState("")
  const [onlyGeo, setOnlyGeo] = useState(false)
  const params = useParams()
  const history = useHistory()

  const onDataCatalogItemImport = (item: DataCatalogItem) => {
    submitDataCatalogConnector(item)
    pushImportPreviewRoute(history, params)
  }

  const onDataCatalogItemConnect = (item: DataCatalogItem) => {
    // TODO: Rewire; display table preview
    // eslint-disable-next-line no-console
    console.log("connect", item)
  }

  const catalogItems = dataCatalog.catalogItems?.filter((catalogItem) =>
    onlyGeo ? catalogItem.hasGeo : true
  )

  return (
    <div className="data-catalog-page-container">
      {dataCatalog.error ? (
        <div className="data-catalog-info-display">
          Error loading data catalog:
          <br />
          {String(dataCatalog.error)}
        </div>
      ) : dataCatalog.pending ? (
        <div className="data-catalog-info-display">Loading data catalog…</div>
      ) : (
        <>
          {catalogItems?.length ? (
            <div className="data-catalog-items">
              <ImportDataCatalogFilters
                {...{
                  search,
                  setSearch,
                  setOnlyGeo,
                  onlyGeo
                }}
              />
              {catalogItems.map((catalogItem, index) => (
                <DataCatalogCard
                  key={index}
                  search={search}
                  catalogItem={catalogItem}
                  onSelect={onDataCatalogItemImport}
                  onConnect={onDataCatalogItemConnect}
                  serverURL={serverURL}
                />
              ))}
            </div>
          ) : (
            <div className="data-catalog-no-items-hint">No Items</div>
          )}
        </>
      )}
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportDataCatalog)
