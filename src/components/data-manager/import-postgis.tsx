// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { RdmsImporterProps } from "./field-types"
import RdmsImportForm from "./import-form-rdms"
import { ODBCDriverName } from "./constants"
import { POSTGRESQL_FIELDS } from "./import-postgresql"

const ImportPostGIS = (props: RdmsImporterProps) => (
  <RdmsImportForm
    {...props}
    driver={ODBCDriverName.PostGIS}
    fields={POSTGRESQL_FIELDS}
  />
)

export default ImportPostGIS
