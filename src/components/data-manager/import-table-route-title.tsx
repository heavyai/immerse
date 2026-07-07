// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useParams } from "react-router"

import { IMPORTERS } from "./importer-component-map"

const ImportTableRouteTitle = () => {
  const { connectorType } = useParams()

  const connectorsHeader = `Connectors${
    connectorType ? ` - ${IMPORTERS[connectorType]?.label}` : ""
  }`

  return <h2 className="import-table__title">{connectorsHeader}</h2>
}

export default ImportTableRouteTitle
