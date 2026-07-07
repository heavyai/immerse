// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo } from "react"
import { MultiSelect } from "../../widgets/multi-select/Multi-select"
import { useColumnOptions } from "hooks/use-column-options"
import { Radio } from "@rmwc/radio"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { useSelector } from "react-redux"

const { PARSE_CROSSFILTER_TOKENS } = available_feature_flags

export type TableFunctionArgumentFieldCursorProps = {
  label: string
  sourceSelectOptions: [{ options: [{ label: string; value: string }] }]
  onChange: (fieldName: string, newVal: any) => void
  name: string
  fields: string[]
  value: any
  crossfilterChecked?: boolean
}

export const TableFunctionArgumentFieldCursor: FC<TableFunctionArgumentFieldCursorProps> = ({
  label,
  name,
  fields,
  value,
  onChange,
  sourceSelectOptions,
  crossfilterChecked
}) => {
  const columnOptions = useColumnOptions(value, { includeCustom: true })
  const customSQLDefinitions = useSelector(({ parameters }) =>
    Object.values(parameters.definitions).filter(({ type }: { type: string }) =>
      [
        "CUSTOM_DIMENSION",
        "GLOBAL_DIMENSION",
        "CUSTOM_MEASURE",
        "GLOBAL_DIMENSION"
      ].includes(type)
    )
  )
  const customSQLOptions = useMemo(
    () =>
      customSQLDefinitions
        .filter(({ source }: { source: string }) => source === value)
        .map(({ displayName, name: n }) => ({
          label: displayName,
          value: `\${${n}}`
        })),
    [customSQLDefinitions, value]
  )
  const allOptions = useMemo(() => {
    const opts = []
    if (customSQLOptions.length) {
      opts.push({ options: customSQLOptions })
    }
    opts.push({ options: columnOptions })
    return opts
  }, [customSQLOptions, columnOptions])

  return (
    <>
      <MultiSelect
        blurInputOnSelect
        placeholder={label}
        options={sourceSelectOptions}
        value={
          value
            ? {
                label: value,
                value
              }
            : label
        }
        onChange={(option) => {
          onChange(name, option.value)
          fields.forEach((cursorFieldName: string) => {
            onChange(`${name}_${cursorFieldName}`, "")
          })
        }}
      />
      {columnOptions.length
        ? fields.map((cursorFieldName) => (
            <MultiSelect
              key={cursorFieldName}
              blurInputOnSelect
              placeholder={cursorFieldName}
              options={allOptions}
              onChange={(option) =>
                onChange(`${name}_${cursorFieldName}`, option?.value || "")
              }
            />
          ))
        : null}
      {getFeatureFlag(PARSE_CROSSFILTER_TOKENS) && (
        <>
          <span>Apply Crossfilter</span>
          <br />
          <Radio
            checked={crossfilterChecked === true}
            onChange={() => onChange(`${name}_apply_crossfilter_token`, true)}
          >
            Yes
          </Radio>
          <Radio
            value="false"
            checked={!crossfilterChecked}
            onChange={() => onChange(`${name}_apply_crossfilter_token`, false)}
          >
            No
          </Radio>
        </>
      )}
    </>
  )
}
