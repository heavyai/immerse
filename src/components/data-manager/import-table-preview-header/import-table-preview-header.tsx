// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Link } from "react-router-dom"
import { generatePath, useParams } from "react-router"
import { ROUTE_DATA_MANAGEMENT_IMPORT } from "routes/paths"
import Icon from "components/icon/icon"
import React from "react"
import { ConnectorType } from "../constants"

const ImportTablePreviewHeader = ({ cancelText }: { cancelText: string }) => {
  const params = useParams<{
    connect: string
    connectorType: ConnectorType
    dbName: string
  }>()

  return (
    <div className="table-importer-header">
      <div className="table-importer-cancel">
        <Link to={generatePath(ROUTE_DATA_MANAGEMENT_IMPORT, params)}>
          <button className="button icon-btn cancel">
            <Icon name="arrow2" />
            {cancelText}
          </button>
        </Link>
      </div>
    </div>
  )
}

export default ImportTablePreviewHeader
