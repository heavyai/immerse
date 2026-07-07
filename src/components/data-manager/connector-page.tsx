// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useParams } from "react-router"
import React from "react"
import { ConnectorType } from "./constants"
import { IMPORTERS, GENERIC_ODBC_IMPORTER } from "./importer-component-map"

const ConnectorPage = () => {
  const params = useParams() as {
    [key: string]: string
  }
  const { connectorType } = params

  const selectedConnector =
    IMPORTERS[connectorType as ConnectorType] || GENERIC_ODBC_IMPORTER
  const SelectedConnectorComponent = selectedConnector.component

  return selectedConnector ? (
    <div className="import-table__selected">
      <SelectedConnectorComponent
        {...({
          label: selectedConnector.label,
          icon: selectedConnector.icon
        } || {})}
        key={selectedConnector}
      />
    </div>
  ) : null
}

export default ConnectorPage
