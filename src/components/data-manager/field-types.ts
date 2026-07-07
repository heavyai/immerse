// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ReactComponentElement } from "react"

export type FieldKey = SnowflakeFieldKey | PostgreSqlFieldKey | RedshiftFieldKey

export type Field = {
  key: FieldKey
  label: string
  getError: (fieldKey: FieldKey, values: any, fieldLabel: string) => string
}

export enum SnowflakeFieldKey {
  SERVER = "server",
  WAREHOUSE = "warehouse",
  ROLE = "role",
  PORT = "port",
  DATABASE = "database",
  USERNAME = "username",
  PASSWORD = "password",
  SELECT_QUERY = "selectQuery",
  ORDER_BY = "orderBy"
}

export enum RedshiftFieldKey {
  DATABASE = "database",
  PORT = "port",
  SERVER = "server",
  USERNAME = "username",
  PASSWORD = "password",
  SELECT_QUERY = "selectQuery",
  ORDER_BY = "orderBy"
}

export enum PostgreSqlFieldKey {
  SERVERNAME = "serverName",
  PORT = "port",
  DATABASE = "database",
  USERNAME = "username",
  PASSWORD = "password",
  SELECT_QUERY = "selectQuery",
  ORDER_BY = "orderBy"
}

export type RdmsImporterProps = {
  icon: ReactComponentElement<any>
  label: string
}
