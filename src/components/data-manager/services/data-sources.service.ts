// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import { RemoteConnectorConfig } from "../constants"
import {
  BASE_FETCH_CONFIG,
  HTTP_METHOD_DELETE,
  HTTP_METHOD_GET,
  HTTP_METHOD_PATCH,
  HTTP_METHOD_POST,
  JSON_HEADERS
} from "../../../constants/services"
import {
  mapCopyParamsFields,
  mapRefreshInfoFields,
  mapRowDescriptorFields
} from "../utils/thrift-data-type-mappers"
import {
  TColumnType,
  TTableRefreshInfo
} from "@heavyai/connector/dist/browser-connector"

/**
 * Maps thrift enums from numbers to strings--row descriptors returned from detectColumnTypes
 * have numeric thrift types,but webserver create table endpoints currently only accept strings
 */
const getBaseCreateConnectorConfig = (
  remoteConnectorConfig: RemoteConnectorConfig
) => ({
  ...remoteConnectorConfig,
  rowDescriptor: mapRowDescriptorFields(
    remoteConnectorConfig.rowDescriptor as TColumnType[]
  ),
  ...(remoteConnectorConfig.copyParams && {
    copyParams: mapCopyParamsFields(remoteConnectorConfig.copyParams)
  }),
  refreshInfo:
    remoteConnectorConfig.refreshInfo &&
    mapRefreshInfoFields(remoteConnectorConfig.refreshInfo)
})

export const createS3Connector = async (
  remoteConnectorConfig: RemoteConnectorConfig,
  tableName: string
): Promise<Response> => {
  const body = {
    tableName,
    ...getBaseCreateConnectorConfig(remoteConnectorConfig),
    S3_ACCESS_TYPE: remoteConnectorConfig.accessType || "S3_DIRECT"
  }
  return fetch(`${APP_CONFIG.url}/tables/create/connect/s3`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(body)
    }
  })
}

export const createServerFileConnector = async (
  remoteConnectorConfig: RemoteConnectorConfig,
  tableName: string
): Promise<Response> => {
  const body = {
    tableName,
    ...getBaseCreateConnectorConfig(remoteConnectorConfig)
  }
  return fetch(`${APP_CONFIG.url}/tables/create/connect/server-file`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(body)
    }
  })
}

export const createOdbcConnector = async (
  remoteConnectorConfig: RemoteConnectorConfig,
  tableName: string
): Promise<Response> => {
  const body = {
    tableName,
    ...getBaseCreateConnectorConfig(remoteConnectorConfig)
  }

  return fetch(`${APP_CONFIG.url}/tables/create/connect/odbc`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(body)
    }
  })
}

export const dropConnectedTable = async (
  tableName: string
): Promise<Response> =>
  await fetch(`${APP_CONFIG.url}/tables/connected/${tableName}`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_DELETE
    }
  })

export const renameConnectedTable = async (
  tableName: string,
  newTableName: string
): Promise<Response> =>
  await fetch(
    `${APP_CONFIG.url}/tables/connected/${tableName}/rename/${newTableName}`,
    {
      ...(BASE_FETCH_CONFIG as { credentials: "include" }),
      ...{
        method: HTTP_METHOD_PATCH
      }
    }
  )

type ColumnRenameMap = {
  columnName: string
  newColumnName: string
}

export const renameConnectedTableColumns = async (
  tableName: string,
  columnNameMaps: ColumnRenameMap[]
): Promise<Response> =>
  await fetch(
    `${APP_CONFIG.url}/tables/connected/${tableName}/rename-columns`,
    {
      ...(BASE_FETCH_CONFIG as { credentials: "include" }),
      ...{
        method: HTTP_METHOD_PATCH,
        headers: JSON_HEADERS
      },
      body: JSON.stringify(columnNameMaps)
    }
  )

export const updateConnectedTableRefreshSchedule = async (
  tableName: string,
  refreshInfo: TTableRefreshInfo
): Promise<Response> =>
  await fetch(
    `${APP_CONFIG.url}/tables/connected/${tableName}/refresh-schedule`,
    {
      ...(BASE_FETCH_CONFIG as { credentials: "include" }),
      ...{
        method: HTTP_METHOD_PATCH,
        headers: JSON_HEADERS
      },
      body: JSON.stringify(mapRefreshInfoFields(refreshInfo))
    }
  )

export const refreshConnectedTable = async (
  tableName: string
): Promise<Response> =>
  await fetch(`${APP_CONFIG.url}/tables/connected/${tableName}/refresh`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_GET
    }
  })

export const getSupportedDataSources = async (): Promise<Response> =>
  await fetch(`${APP_CONFIG.url}/configuration/supported-data-sources`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_GET
    }
  })

export const detectColumnTypes = async (
  connectionParams: RemoteConnectorConfig
): Promise<Response> =>
  await fetch(`${APP_CONFIG.url}/tables/detect-column-types`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(connectionParams)
    }
  })
