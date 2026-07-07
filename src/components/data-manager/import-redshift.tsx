// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { getRequiredTextFieldError } from "./utils"
import { RdmsImporterProps, RedshiftFieldKey } from "./field-types"
import RdmsImportForm from "./import-form-rdms"
import { ODBCDriverName } from "./constants"

const ImportRedshift = (props: RdmsImporterProps) => {
  const fields = [
    {
      key: RedshiftFieldKey.DATABASE,
      label: "Database*",
      getError: getRequiredTextFieldError
    },
    {
      key: RedshiftFieldKey.PORT,
      label: "Port*",
      getError: getRequiredTextFieldError
    },
    {
      key: RedshiftFieldKey.SERVER,
      label: "Server*",
      getError: getRequiredTextFieldError
    },
    {
      key: RedshiftFieldKey.USERNAME,
      label: "Username*",
      getError: getRequiredTextFieldError
    },
    {
      key: RedshiftFieldKey.PASSWORD,
      label: "Password*",
      getError: getRequiredTextFieldError
    },
    {
      key: RedshiftFieldKey.SELECT_QUERY,
      label: "Select Query*",
      getError: getRequiredTextFieldError
    },
    {
      key: RedshiftFieldKey.ORDER_BY,
      label: "Order by Columns*",
      getError: getRequiredTextFieldError
    }
  ]

  return (
    <RdmsImportForm
      {...props}
      driver={ODBCDriverName.Redshift}
      fields={fields}
    />
  )
}

export default ImportRedshift
