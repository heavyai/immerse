// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { getRequiredNumberError, getRequiredTextFieldError } from "./utils"
import { RdmsImporterProps, PostgreSqlFieldKey } from "./field-types"
import RdmsImportForm from "./import-form-rdms"
import { ODBCDriverName } from "./constants"

export const POSTGRESQL_FIELDS = [
  {
    key: PostgreSqlFieldKey.SERVERNAME,
    label: "Server Name*",
    getError: getRequiredTextFieldError
  },
  {
    key: PostgreSqlFieldKey.PORT,
    label: "Port*",
    getError: getRequiredNumberError
  },
  {
    key: PostgreSqlFieldKey.DATABASE,
    label: "Database*",
    getError: getRequiredTextFieldError
  },
  {
    key: PostgreSqlFieldKey.USERNAME,
    label: "Username*",
    getError: getRequiredTextFieldError
  },
  {
    key: PostgreSqlFieldKey.PASSWORD,
    label: "Password*",
    getError: getRequiredTextFieldError
  },
  {
    key: PostgreSqlFieldKey.SELECT_QUERY,
    label: "Select Query*",
    getError: getRequiredTextFieldError
  },
  {
    key: PostgreSqlFieldKey.ORDER_BY,
    label: "Order by Columns*",
    getError: getRequiredTextFieldError
  }
]

const ImportPostgreSql = (props: RdmsImporterProps) => (
  <RdmsImportForm
    {...props}
    driver={ODBCDriverName.PostgreSQL}
    fields={POSTGRESQL_FIELDS}
  />
)

export default ImportPostgreSql
