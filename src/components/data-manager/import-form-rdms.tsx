// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from "react"
import { useDispatch } from "react-redux"
import { useHistory, useParams } from "react-router"

import { submitOdbcConnector } from "actions/importer-action-creators"
import { pushImportPreviewRoute } from "./utils/push-import-preview-route"
import ImportForm from "./import-form"
import useImporterFormState from "./use-importer-form-state"
import ImporterTextField from "./importer-text-field"
import { Field, RdmsImporterProps } from "./field-types"
import {
  ConnectorType,
  DataManagerRouteParams,
  ODBCDriverName
} from "./constants"

const buildPayload = (
  formValues,
  driver: ODBCDriverName,
  connectorType: ConnectorType
) => ({
  ...formValues,
  driver,
  connectorType
})

const RdmsImportForm = ({
  fields,
  driver,
  ...restProps
}: RdmsImporterProps & {
  fields: Field[]
  driver: ODBCDriverName
}) => {
  const params = useParams<DataManagerRouteParams>()
  const history = useHistory()
  const dispatch = useDispatch()

  const { validateFields, formValues, ...rest } = useImporterFormState(fields)
  const commonInputProps = { formValues, fields, ...rest }

  const inputs = (
    <>
      <div>
        {fields.map(({ key }) => (
          <ImporterTextField {...commonInputProps} key={key} fieldKey={key} />
        ))}
      </div>
    </>
  )

  const onConnect = useCallback(() => {
    const isValid = validateFields()

    if (isValid) {
      const payload = buildPayload(formValues, driver, params.connectorType)
      dispatch(submitOdbcConnector(payload))
      pushImportPreviewRoute(history, { ...params, connect: "connect" })
    }
  }, [dispatch, driver, formValues, history, params, validateFields])

  const onImport = useCallback(() => {
    const isValid = validateFields()

    if (isValid) {
      const payload = buildPayload(formValues, driver, params.connectorType)
      dispatch(submitOdbcConnector(payload))
      pushImportPreviewRoute(history, params)
    }
  }, [dispatch, driver, formValues, history, params, validateFields])

  return <ImportForm {...{ ...restProps, inputs, onConnect, onImport }} />
}

export default RdmsImportForm
