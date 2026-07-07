// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo } from "react"
import { TExtArgumentType } from "@heavyai/connector/dist/browser-connector"
import { invert } from "lodash"
import { TextField } from "widgets/text-field/TextField"
import { Radio } from "@rmwc/radio"
import { TableFunctionArgumentFieldCursor } from "./table-function-argument-field-cursor"

export type TableFunctionArgumentFieldProps = {
  inputTypes: TExtArgumentType[]
  onChange: (fieldName: string, newVal: any) => void
  name: string
  fields: string[]
  value: any
  formFields: Record<string, any>
  sourceSelectOptions: [{ options: [{ label: string; value: string }] }]
}

const TableFunctionArgumentField: FC<TableFunctionArgumentFieldProps> = ({
  inputTypes,
  onChange,
  value,
  name,
  fields,
  sourceSelectOptions,
  formFields
}) => {
  const fieldType = useMemo(() => {
    if (inputTypes.length === 1 && inputTypes[0] === TExtArgumentType.Cursor) {
      return "CURSOR"
    }
    if (inputTypes.length === 1 && inputTypes[0] === TExtArgumentType.Bool) {
      return "BOOLEAN"
    }
    return "TEXT"
  }, [inputTypes])

  const label = useMemo(() => {
    if (fieldType === "CURSOR") {
      return `${name} (Cursor)`
    }
    if (fieldType === "BOOLEAN") {
      return name
    }
    return `${name} (${inputTypes
      .map((type) => invert(TExtArgumentType)[type])
      .join("/")})`
  }, [name, inputTypes, fieldType])

  if (fieldType === "BOOLEAN") {
    return (
      <>
        <span>{label}</span>
        <br />
        <Radio
          value="true"
          checked={value === "true"}
          onChange={(evt) => onChange(name, String(evt.currentTarget.value))}
        >
          True
        </Radio>
        <Radio
          value="false"
          checked={value === "false"}
          onChange={(evt) => onChange(name, String(evt.currentTarget.value))}
        >
          False
        </Radio>
      </>
    )
  }

  if (fieldType === "TEXT") {
    return (
      <TextField
        style={{ width: "100%" }}
        value={value}
        onChange={(evt) => onChange(name, evt.target.value)}
        label={label}
      />
    )
  }
  return (
    <TableFunctionArgumentFieldCursor
      label={label}
      sourceSelectOptions={sourceSelectOptions}
      onChange={onChange}
      name={name}
      fields={fields}
      value={value}
      crossfilterChecked={formFields[`${name}_apply_crossfilter_token`]}
    />
  )
}

export default TableFunctionArgumentField
