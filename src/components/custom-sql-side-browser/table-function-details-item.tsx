// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo, useState } from "react"
import {
  TUserDefinedTableFunction,
  TExtArgumentType
} from "@heavyai/connector/dist/browser-connector"
import { SimpleListItem } from "@rmwc/list"
import TableFunctionArgumentField from "./table-function-argument-field"
import { PrimaryButton } from "../../widgets/button/Button"
import groupBy from "lodash/groupBy"

export type TableFunctionDetailsItemProps = {
  functionName: string
  functionSignatures: TUserDefinedTableFunction[]
  onSelectFunction: (func: string) => void
  sourceSelectOptions: [{ options: [{ label: string; value: string }] }]
  goBack: () => void
}

const TableFunctionDetailsItem: FC<TableFunctionDetailsItemProps> = ({
  functionName,
  functionSignatures,
  onSelectFunction,
  sourceSelectOptions,
  goBack
}) => {
  const [formFields, setFormFields] = useState<Record<string, any>>({})
  // if same number of inputs with same names, then we treat them as similar variants of the same method
  const variants = useMemo(
    () =>
      Object.values(
        groupBy(
          functionSignatures,
          ({ annotations, sqlArgTypes }) =>
            `${annotations
              .slice(0, sqlArgTypes.length)
              .map(({ name }: { name: string }) => name)
              .join("-")}`
        )
      ),
    [functionSignatures]
  )
  const [selectedVariantIdx, _setSelectedVariantIdx] = useState(0) // allow selecting variant later on
  const functionInputs = useMemo<
    { name: string; require: string; types: Set<number>; fields: string[] }[]
  >(() => {
    const selectedVariantFunctionSignatures = variants[selectedVariantIdx]
    const inputs: {
      name: string
      require: string
      types: Set<number>
      fields: string[]
    }[] = []
    const newFormFields: Record<string, string> = {}
    selectedVariantFunctionSignatures.forEach(
      ({ annotations, sqlArgTypes }) => {
        sqlArgTypes.forEach((type: number, index: number) => {
          const {
            name = `arg${index}`,
            require = "",
            fields = ""
          } = annotations[index]
          if (inputs[index]) {
            inputs[index].types.add(type)
          } else {
            inputs[index] = {
              name,
              require,
              fields: fields
                ? fields.slice(1, fields.length - 1).split(", ")
                : [],
              types: new Set<number>().add(type)
            }
            inputs[index].fields.forEach((cursorFieldName: string) => {
              newFormFields[`${name}_${cursorFieldName}`] = ""
            })
            newFormFields[name] =
              annotations[index].default?.toLowerCase() ?? ""
          }
        })
      }
    )
    setFormFields(newFormFields)
    return inputs
  }, [variants, selectedVariantIdx])

  const isAddDisabled = functionInputs.some(({ name }) => !formFields[name])

  const selectFunction = () => {
    const functionSignature = variants[
      selectedVariantIdx
    ][0] as TUserDefinedTableFunction
    const outputs = functionSignature.annotations
      .slice(functionInputs.length, functionSignature.annotations.length - 1)
      .map(({ name }: { name: string }) => name)
    const methodCallString = `SELECT ${outputs.join(", ")} FROM TABLE(
  ${functionName}(
    ${functionInputs
      .map(({ name, types, fields }) => {
        if (types.has(TExtArgumentType.Cursor)) {
          let ret = `${name} => CURSOR(
      SELECT ${fields.map((f) => `${formFields[`${name}_${f}`]}`).join(", ")}
      FROM ${formFields[name]}`
          if (formFields[`${name}_apply_crossfilter_token`]) {
            ret += `
      WHERE \${crossfilter.${formFields[name]} ?? true})`
          } else {
            ret += ")"
          }
          return ret
        }
        if (types.has(TExtArgumentType.TextEncodingNone)) {
          return `${name} => '${formFields[name]}'`
        }
        return `${name} => ${formFields[name]}`
      })
      .join(",\n    ")}
  )
)
`
    onSelectFunction(methodCallString)
  }

  return (
    <>
      <SimpleListItem
        text={functionName}
        graphic={"chevron_left"}
        onClick={goBack}
      />
      <div className="function-browser-details-item">
        {functionInputs.map(({ name, types, require, fields }) => (
          <>
            <TableFunctionArgumentField
              key={name}
              name={name}
              value={formFields[name]}
              inputTypes={Array.from(types)}
              helpText={require}
              fields={fields}
              sourceSelectOptions={sourceSelectOptions}
              onChange={(fieldName, newVal) =>
                setFormFields((prev) => ({ ...prev, [fieldName]: newVal }))
              }
              formFields={formFields}
            />
            <hr />
          </>
        ))}
        <PrimaryButton onClick={selectFunction} disabled={isAddDisabled}>
          Add Function
        </PrimaryButton>
        <br />
        <br />
      </div>
    </>
  )
}

export default TableFunctionDetailsItem
