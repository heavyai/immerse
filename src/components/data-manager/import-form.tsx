// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactComponentElement } from "react"
import { Icon } from "@rmwc/icon"
import { useHistory, useParams } from "react-router"

import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { DataManagerRouteParams, IMPORT_ACTIONS } from "./constants"

import "./import-form.scss"

const ImportForm = ({
  icon,
  label,
  inputs,
  onImport,
  onConnect
}: {
  icon: ReactComponentElement<any>
  label: string
  inputs: ReactComponentElement<any>
  onImport: () => void
  onConnect: () => void
}) => {
  const history = useHistory()
  const params = useParams<DataManagerRouteParams>()

  const onCancel = () => {
    history.push(".")
  }

  return (
    <div className="import-form">
      <div className="import-form__close-icon" onClick={onCancel}>
        <Icon icon="close" />
      </div>
      <div className="import-form__icon-wrapper">{icon}</div>
      <h3 className="import-table__header">{label}</h3>
      <div>
        {inputs}
        <footer>
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <div>
            <PrimaryButton onClick={onImport}>Import</PrimaryButton>
            {params.importAction === IMPORT_ACTIONS.CREATE && (
              <PrimaryButton onClick={onConnect}>Connect</PrimaryButton>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}

export default ImportForm
