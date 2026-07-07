// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ConnectorType,
  ODBC_CONNECTORS,
  RemoteConnectorConfig,
  TABLE_PREVIEW_DATA
} from "../constants"
import {
  createODBCConnector,
  createS3Connector
} from "../services/data-sources.service"

// TODO: Mock async connector creation based on type of "connector" the backend will create.
//  Replace w/ Redux action chain for performing actual service calls.
export const createConnectorAndImport = async (
  tableName: string,
  connectorType: ConnectorType,
  remoteConnectorConfig: RemoteConnectorConfig,
  rows: number[] // Rows only passed here to update mock table preview data
): Promise<void> => {
  // eslint-disable-next-line no-unused-expressions
  ODBC_CONNECTORS.includes(connectorType)
    ? await createODBCConnector(remoteConnectorConfig, tableName)
    : await createS3Connector(remoteConnectorConfig, tableName)
  TABLE_PREVIEW_DATA[tableName] = {
    rows
  }
}
