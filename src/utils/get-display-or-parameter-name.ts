// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { varExtractRegex } from "components/parameters/validation"
import { getParameterDefinitions } from "components/parameters/selectors"
import { importableStore as store } from "store/importableStore"

/**
 * Used in place of `process` when we'd rather show the param name than the SQL
 * as a fallback for displayName e.g. data source labels, since TABLE type parameters
 * have user-friendly param names in place of displayNames
 */
export function getDisplayOrParameterName(value: string) {
  if (typeof value !== "string") {
    return value
  }

  const dataSourceParameterName = value.match(varExtractRegex)?.[1]
  const parameterDefinitions = getParameterDefinitions(store.getState())
  const dataSourceParameter = parameterDefinitions[dataSourceParameterName]

  return dataSourceParameter?.displayName ?? value
}
