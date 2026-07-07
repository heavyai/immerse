// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import TextField from "widgets/text-field/TextField"
import React, { ChangeEvent } from "react"
import { Tooltip } from "@rmwc/tooltip"
import { Field, FieldKey } from "./field-types"

const ImporterTextField = ({
  fieldKey,
  fields,
  formValues,
  setValue,
  inputType,
  formErrors
}: {
  fieldKey: FieldKey
  fields: Field[]
  formValues: any
  setValue: (fieldKey: FieldKey, v: string) => void
  inputType?: string
  formErrors: any
}) => {
  const field = fields.find((f) => f.key === fieldKey)
  return field ? (
    <div className="importer__text-field">
      <Tooltip
        showArrow
        content={formErrors[fieldKey]}
        open={Boolean(formErrors[fieldKey])}
      >
        <TextField
          value={formValues[fieldKey]}
          label={field.label}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setValue(fieldKey, e.target.value)
          }}
          invalid={Boolean(formErrors[fieldKey])}
          type={
            inputType || field.label.toLowerCase().includes("password")
              ? "password"
              : undefined
          }
        />
      </Tooltip>
    </div>
  ) : null
}

export default ImporterTextField
