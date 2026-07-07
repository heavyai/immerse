// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConnectorType, ODBCDriverName } from "../data-manager/constants"
import {
  GENERIC_ODBC_IMPORTER,
  IMPORTERS
} from "../data-manager/importer-component-map"
import { getSupportedDataSources } from "../data-manager/services/data-sources.service"

export type Connector = {
  type: ConnectorType
  label: string
  icon: JSX.Element
  adminRequired?: boolean
  supportedFiles?: any
}

export const BASE_CONNECTORS: ConnectorType[] = [
  ConnectorType.LocalFileImport,
  ConnectorType.S3Import,
  ConnectorType.DataCatalog,
  ConnectorType.ServerFileImport
]

enum SourceType {
  ODBC = "ODBC"
}

type DataSource = {
  sourceType: SourceType
  sourceSubType: ODBCDriverName
}

const getSupportedSources = async () => {
  try {
    const dataSourcesResp = await getSupportedDataSources()
    return dataSourcesResp.ok ? dataSourcesResp.json() : []
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`getSupportedDataSources failed with error: ${e}`)
    return []
  }
}

export const getBaseConnectors = (isAdmin?: boolean) =>
  BASE_CONNECTORS.map((type) => ({
    ...IMPORTERS[type],
    type
  })).filter(({ adminRequired }) => isAdmin || !adminRequired)

const getOdbcConnectors = (enabledSources: DataSource[]) =>
  enabledSources
    .filter(({ sourceType }) => sourceType === SourceType.ODBC)
    .map(({ sourceSubType }) => {
      const importerKey =
        Object.keys(IMPORTERS).find(
          (importer) => IMPORTERS[importer].driver === sourceSubType
        ) || sourceSubType

      return (
        IMPORTERS[importerKey] || {
          ...GENERIC_ODBC_IMPORTER,
          driver: sourceSubType
        }
      )
    })

export const getConnectors = async (isAdmin: boolean) => {
  const enabledSources = await getSupportedSources()
  return [
    ...getBaseConnectors(isAdmin),
    ...getOdbcConnectors(enabledSources)
  ].filter(({ supported }) => supported)
}
