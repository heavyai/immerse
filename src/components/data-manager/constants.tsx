// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  TCopyParams,
  TTableRefreshInfo,
  TColumnType,
  TSourceType
} from "@heavyai/connector/dist/browser-connector"

export type TablePreviewData = {
  rows: number[]
}

export const TABLE_PREVIEW_DATA: { [tableName: string]: TablePreviewData } = {
  foo: {
    rows: [1, 2, 3, 4, 5]
  },
  bar: {
    rows: [6, 7, 8, 9, 10]
  },
  baz: {
    rows: [11, 12, 13, 14, 15]
  },
  import: {
    rows: [16, 17, 18, 19, 20]
  },
  flights: {
    rows: []
  }
}

export enum IMPORT_ACTIONS {
  CREATE = "create",
  APPEND = "append"
}

export const SOURCE_TYPE_OPTIONS = [
  {
    label: "Delimited",
    value: TSourceType.DELIMITED_FILE
  },
  {
    label: "Geospatial",
    value: TSourceType.GEO_FILE
  },
  {
    label: "Raster",
    value: TSourceType.RASTER_FILE
  },
  {
    label: "Parquet",
    value: TSourceType.PARQUET_FILE
  }
]

export enum ConnectorType {
  LocalFileImport = "local-file-import",
  ServerFileImport = "server-file-import",
  S3Import = "s3-import",
  DataCatalog = "data-catalog",
  Redshift = "redshift",
  PostgreSQL = "postgresql",
  Snowflake = "snowflake",
  PostGIS = "postgis"
}

export const ODBC_CONNECTORS = [
  ConnectorType.Redshift,
  ConnectorType.PostgreSQL,
  ConnectorType.Snowflake,
  ConnectorType.PostGIS
]

export enum AwsRegion {
  UsEast1 = "us-east-1",
  UsEast2 = "us-east-2",
  UsWest1 = "us-west-1",
  UsWest2 = "us-west-2",
  CanadaCentral1 = "ca-central-1",
  AsiaPacificSouth1 = "ap-south-1",
  AsiaPacificNortheast1 = "ap-northeast-1",
  AsiaPacificNortheast2 = "ap-northeast-2",
  AsiaPacificNortheast3 = "ap-northeast-3",
  AsiaPacificSoutheast1 = "ap-southeast-1",
  AsiaPacificSoutheast2 = "ap-southeast-2",
  ChinaNorth1 = "cn-north-1",
  ChinaNorthwest1 = "cn-northwest-1",
  EuCentral1 = "eu-central-1",
  EuWest1 = "eu-west-1",
  EuWest2 = "eu-west-2",
  EuWest3 = "eu-west-3",
  SouthAmericaEast1 = "sa-east-1"
}

export const lookupAwsRegion = (lookup: string): AwsRegion =>
  Object.values(AwsRegion).find((region) => region === lookup) as AwsRegion

export type RegionOption = {
  label: string
  value: string
}

export enum S3AccessType {
  Direct = "S3_DIRECT",
  Select = "S3_SELECT"
}

type S3ConnectorConfig = {
  bucket: string
  basePath: string
  awsRegion: AwsRegion
  rowDescriptor: TColumnType[]
  copyParams: TCopyParams
  refreshInfo?: TTableRefreshInfo
  accessId?: string
  secretKey?: string
  accessType?: S3AccessType
  isParquet?: boolean // TODO: remove this, we can determine this based on `TCopyParams.source_type`
}

type ServerFileConnectorConfig = {
  path: string
  rowDescriptor: TColumnType[]
  copyParams: TCopyParams
  refreshInfo?: TTableRefreshInfo
}

export enum ODBCDriverName {
  PostgreSQL = "PostgreSQL",
  Redshift = "Redshift",
  Snowflake = "Snowflake",
  PostGIS = "PostGIS"
}

export type ODBCConnectionConfig = {
  driver: ODBCDriverName
  dbName: string
  dbHost: string
  sqlSelect: string
  sqlOrderBy: string
}

export type ODBCConnectorConfig = ODBCConnectionConfig & {
  rowDescriptor: TColumnType[]
  refreshInfo?: TTableRefreshInfo
  username: string
  password: string
  port: number
  tableName: string
}

export type RemoteConnectorConfig = Partial<
  S3ConnectorConfig & ODBCConnectorConfig & ServerFileConnectorConfig
>

export type DataManagerRouteParams = {
  tableName: string
  connect: string
  connectorType: ConnectorType
  dbName: string
  importAction: IMPORT_ACTIONS
}
