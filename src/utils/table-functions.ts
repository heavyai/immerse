// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Services from "services/immerse"
import { TUserDefinedTableFunction } from "@heavyai/connector/dist/browser-connector"

const stripName = (name: string) => {
  if (name.includes("__cpu")) {
    return name.split("__cpu")[0]
  }
  if (name.includes("__gpu")) {
    return name.split("__gpu")[0]
  }
  return name
}

const cleanNames = (functionNames: string[]) => {
  const uniqueNames = new Set<string>()
  functionNames.forEach((name) => {
    uniqueNames.add(stripName(name))
  })
  return Array.from(uniqueNames)
}

export async function getTableFunctionNames(): Promise<string[]> {
  const connector = Services.get("DbCon")
  return connector.getTableFunctionNames()
}

export async function getTableFunctionDetails(
  functionNames: string | string[]
): Promise<TUserDefinedTableFunction[]> {
  const connector = Services.get("DbCon")
  return connector.getTableFunctionDetailsAsync(
    Array.isArray(functionNames) ? functionNames : [functionNames]
  )
}

export async function getTableFunctions(): Promise<
  TUserDefinedTableFunction[]
> {
  const tableFunctionDetails = await getTableFunctionDetails(
    cleanNames(await getTableFunctionNames())
  )
  return tableFunctionDetails.map(({ name, ...rest }) => ({
    name: stripName(name),
    ...rest
  }))
}
