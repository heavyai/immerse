// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { getRequiredTextFieldError } from "./utils"
import { RdmsImporterProps, SnowflakeFieldKey } from "./field-types"
import RdmsImportForm from "./import-form-rdms"
import { ODBCDriverName } from "./constants"

const ImportSnowflake = (props: RdmsImporterProps) => {
  const fields = [
    {
      key: SnowflakeFieldKey.SERVER,
      label: "Server*",
      getError: getRequiredTextFieldError
    },
    {
      key: SnowflakeFieldKey.WAREHOUSE,
      label: "Warehouse"
    },
    {
      key: SnowflakeFieldKey.ROLE,
      label: "Role"
    },
    {
      key: SnowflakeFieldKey.PORT,
      label: "Port*",
      getError: getRequiredTextFieldError
    },
    {
      key: SnowflakeFieldKey.DATABASE,
      label: "Database*",
      getError: getRequiredTextFieldError
    },
    {
      key: SnowflakeFieldKey.USERNAME,
      label: "Username*",
      getError: getRequiredTextFieldError
    },
    {
      key: SnowflakeFieldKey.PASSWORD,
      label: "Password*",
      getError: getRequiredTextFieldError
    },
    {
      key: SnowflakeFieldKey.SELECT_QUERY,
      label: "SQL Select Query*",
      getError: getRequiredTextFieldError
    },
    {
      key: SnowflakeFieldKey.ORDER_BY,
      label: "SQL Order By Columns*",
      getError: getRequiredTextFieldError
    }
  ]

  return (
    <RdmsImportForm
      {...props}
      driver={ODBCDriverName.Snowflake}
      fields={fields}
    />
  )
}

export default ImportSnowflake
