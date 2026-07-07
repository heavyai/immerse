// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  makeGetNamedSelectorParametersForTable,
  makeGetParameterValueColumnMetadata
} from "components/parameters/selectors"
import { getStore } from "services/ImmerseCrossFilter/utils"
import { DATA_TYPE_CATEGORY } from "components/data-column-selector/constants"
import { ParameterTypes } from "components/parameters/parameters-types"

export const parameterDefinitionToOldSelectorMetadata = (
  def,
  { name: _, ...columnMetadata }
) => ({
  ...columnMetadata,
  column: def.name,
  label: def.displayName,
  value: `$\{${def.name}}`,
  table: def.source
})
export const parameterDefinitionToSelectorMetadata = (def, columnMetadata) => ({
  column: columnMetadata,
  label: def.displayName,
  value: `$\{${def.name}}`,
  table: def.source,
  type: "custom_sql"
})
export const parameterDefinitionToFilterMetadata = (def, columnMetadata) => ({
  ...columnMetadata,
  label: def.displayName,
  value: `$\{${def.name}}`,
  table: def.source,
  type: DATA_TYPE_CATEGORY.CUSTOM
})
export const getParameterizedCustomSqlMetadata = (
  table,
  parameterType,
  parameterToMetadata = parameterDefinitionToOldSelectorMetadata
) => {
  const metadata = []
  const thisStore = getStore()
  const namedSelectorParameters = makeGetNamedSelectorParametersForTable(
    thisStore.getState()
  )(table, parameterType)
  const getParameterValueColumnMetadata = makeGetParameterValueColumnMetadata(
    thisStore.getState()
  )

  const additionalMetadata = {}
  if (
    [
      ParameterTypes.CUSTOM_MEASURE,
      ParameterTypes.CUSTOM_DIMENSION,
      ParameterTypes.CUSTOM_FILTER
    ].includes(parameterType)
  ) {
    additionalMetadata.sharedCustom = true
  } else if (
    [
      ParameterTypes.GLOBAL_DIMENSION,
      ParameterTypes.GLOBAL_MEASURE,
      ParameterTypes.GLOBAL_FILTER
    ].includes(parameterType)
  ) {
    additionalMetadata.globalCustom = true
  }

  Object.values(namedSelectorParameters).forEach((d) => {
    const columnMetadata = getParameterValueColumnMetadata(d.name)
    metadata.push({
      ...parameterToMetadata(d, columnMetadata),
      ...additionalMetadata
    })
  })

  return metadata.sort((a, b) => a.label.localeCompare(b.label))
}
