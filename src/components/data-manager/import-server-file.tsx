// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import { useHistory, useParams } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import { Link, Redirect } from "react-router-dom"
import { TSourceType } from "@heavyai/connector/dist/browser-connector"
import { SecondaryButton, PrimaryButton } from "../../widgets/button/Button"
import { submitServerFileConnector } from "../../actions/importer-action-creators"
import { AppState } from "../../../vega/charts/types"
import { noop } from "../../utils/helpers"
import {
  DataManagerRouteParams,
  IMPORT_ACTIONS,
  SOURCE_TYPE_OPTIONS
} from "./constants"
import { MultiSelect } from "../../widgets/multi-select/Multi-select"
import { TextField } from "../../widgets/text-field/TextField"
import { useSourceType } from "./hooks/use-source-type"
import {
  useConnectPreviewPath,
  useImportPreviewPath
} from "./hooks/use-preview-path"
import "./import-form.scss"

const ImportServerFile: FC = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const params = useParams<DataManagerRouteParams>()
  const isAdmin = useSelector<AppState, boolean>(
    ({ connection: { isSuperuser } }) => isSuperuser
  )

  const [path, setPath] = useState("")
  const { sourceType, disableSourceTypeField, setSourceType } = useSourceType(
    path
  )

  const connectDisabled =
    !path.trim() ||
    !sourceType ||
    ![TSourceType.DELIMITED_FILE, TSourceType.PARQUET_FILE].includes(
      sourceType.value
    )

  const importDisabled = !path.trim() || !sourceType
  const importPreviewPath = useImportPreviewPath(params)
  const connectPreviewPath = useConnectPreviewPath(params)

  return !isAdmin ? (
    <Redirect to="/" />
  ) : (
    <div className="import-form">
      <TextField
        label="Path*"
        value={path}
        helpText={{
          persistent: true,
          validationMsg: false,
          children: "Absolute path only"
        }}
        onChange={(e) => {
          const newValue = e.target.value.trim()
          setPath(newValue)
        }}
      />
      <br />
      <MultiSelect
        placeholder="File Type*"
        value={sourceType}
        options={SOURCE_TYPE_OPTIONS}
        onChange={setSourceType}
        isDisabled={disableSourceTypeField}
      />
      <footer>
        <SecondaryButton onClick={history.goBack}>Cancel</SecondaryButton>
        <div>
          <Link
            {...{
              to: importPreviewPath,
              onClick: (e) => {
                if (importDisabled) {
                  e.preventDefault()
                  return false
                }
                dispatch(
                  submitServerFileConnector(path.trim(), sourceType.value)
                )
                return true
              }
            }}
          >
            <PrimaryButton
              {...{
                onClick: noop,
                disabled: importDisabled
              }}
            >
              Import
            </PrimaryButton>
          </Link>
          {params.importAction === IMPORT_ACTIONS.CREATE && (
            <Link
              {...{
                to: {
                  pathname: connectPreviewPath,
                  state: {
                    importerReady: true
                  }
                },
                onClick: (e) => {
                  if (connectDisabled) {
                    e.preventDefault()
                    return false
                  }
                  dispatch(
                    submitServerFileConnector(path.trim(), sourceType.value)
                  )
                  return true
                }
              }}
            >
              <PrimaryButton
                {...{
                  onClick: noop,
                  disabled: connectDisabled
                }}
              >
                Connect
              </PrimaryButton>
            </Link>
          )}
        </div>
      </footer>
    </div>
  )
}

export default ImportServerFile
