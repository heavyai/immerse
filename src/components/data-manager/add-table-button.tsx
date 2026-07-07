// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { PrimaryButton } from "widgets/button/Button"
import { AppState } from "vega/charts/types"
import { resetPreviewDataSource } from "actions/tables-action-creators"
import { generateImportCreatePath } from "./utils/generate-import-path"

const AddTableButton = () => {
  const dispatch = useDispatch()
  const { dbName, canCreateTable } = useSelector(
    ({
      connection: {
        sessionInfo: { database },
        privileges: { createTable }
      }
    }: AppState) => ({ dbName: database, canCreateTable: createTable })
  )

  return canCreateTable ? (
    <Link
      to={generateImportCreatePath({ dbName })}
      className="table-importer-button"
      id="import-data-button"
      data-testid="import-data-button"
    >
      <PrimaryButton
        label="Add Table"
        onClick={() => dispatch(resetPreviewDataSource())}
      />
    </Link>
  ) : null
}

export default AddTableButton
