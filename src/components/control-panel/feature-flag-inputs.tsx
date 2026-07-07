// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Switch } from "../../widgets/switch/Switch"
import { TextField } from "../../widgets/text-field/TextField"
import CustomSelector from "../custom-selector/custom-selector"
import React from "react"

const RenderBoolean = ({ flag, value, callback, disabled }) => (
  <Switch
    checked={value}
    onChange={(e) => callback(flag, e.target.checked)}
    {...{ disabled }}
  />
)

const RenderNumber = ({ flag, value, callback, disabled }) =>
  disabled ? (
    <span>{value}</span>
  ) : (
    <TextField
      type="number"
      label={flag}
      value={value}
      onChange={(e) => callback(flag, Number(e.target.value))}
      {...{ disabled }}
    />
  )

const RenderString = ({ flag, value, callback, disabled }) =>
  disabled ? (
    <span>{value}</span>
  ) : (
    <TextField
      label={flag}
      value={value}
      onChange={(e) => callback(flag, e.target.value)}
      {...{ disabled }}
    />
  )

const RenderDropDown = ({ flag, value, callback, options, disabled }) => {
  if (disabled) {
    const label = options.find((opt) => opt.value === value)?.label || value
    return <span>{label}</span>
  }
  return (
    <CustomSelector
      currentValue={value}
      onChange={(v) => callback(flag, v)}
      options={options}
      disabled={disabled}
    />
  )
}

const typeDispatch = {
  boolean: RenderBoolean,
  number: RenderNumber,
  string: RenderString,
  dropdown: RenderDropDown
}

export const RenderTypeInput = ({
  def,
  values,
  callback,
  disabled = false
}) => {
  const RenderComponent = typeDispatch[def.type]

  if (!RenderComponent) {
    return <div>`Invalid flag type : ${def.type}`</div>
  }

  return (
    <RenderComponent
      flag={def.key}
      value={values[def.key]}
      callback={callback}
      disabled={disabled}
      {...def}
    />
  )
}
