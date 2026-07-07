// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useDispatch, useSelector } from "react-redux"
import { Redirect } from "react-router-dom"
import React, { useEffect } from "react"
import { generatePath, useParams } from "react-router"
import { AppState } from "vega/charts/types"
import { displayImporterError } from "actions/importer-action-creators"
import { ROUTE_DATA_MANAGEMENT } from "routes/paths"
import ImportComplete from "./import-complete"
import ImportTablePreview from "../import-table-preview"

const ImportPage = () => {
  const {
    connection: { isDemo },
    importer
  } = useSelector((state: AppState) => state)
  const params = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    if (importer.error) {
      dispatch(displayImporterError(importer.error, params))
    }
  }, [importer.error, dispatch, params])

  const hasSubmittedConnector = Boolean(importer.connector.type)

  if (isDemo || !hasSubmittedConnector) {
    return <Redirect to={generatePath(ROUTE_DATA_MANAGEMENT, params)} />
  }

  return importer.importComplete ? <ImportComplete /> : <ImportTablePreview />
}
export default ImportPage
