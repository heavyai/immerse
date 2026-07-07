// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from "react"
import Services from "../services/immerse"
import {
  getFields,
  enhanceColumnMetadata
} from "services/ImmerseCrossFilter/utils"
import {
  isNumericType,
  isStringType,
  isTimeType
} from "../constants/data-types"
import useDashboardState from "./useDashboardState"
import { useSelector } from "react-redux"

const typesMatch = (metadata1, metadata2) => {
  const types = [metadata1.type, metadata2.type]
  const isExactMatch = types.every((type) => type === types[0])
  const isGeneralizedMatch =
    types.every(isNumericType) ||
    types.every(isTimeType) ||
    types.every(isStringType)

  return (
    (isExactMatch || isGeneralizedMatch) &&
    metadata1.is_dict === metadata2.is_dict &&
    metadata1.is_array === metadata2.is_array
  )
}

const fetchOptions = async (
  source,
  columnMetadata = [],
  joinDataSources,
  { resetValue, includeCustom } = {}
) => {
  let optionsMetadata = columnMetadata.filter(
    (metadata) => metadata.table === source
  )

  // Use our stored metadata for the table if we have it, and fetch fields otherwise.
  if (optionsMetadata.length === 0) {
    try {
      const { columns } = await getFields({
        connector: Services.get("DbCon"),
        tables: [source]
      })
      optionsMetadata = columns.map((col) => ({
        ...col,
        value: col.name
      }))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  const defaultValueMetadata = optionsMetadata.find(
    (col) => col.value === resetValue
  )

  if (defaultValueMetadata) {
    // Only display columns that have the same type as the default value
    optionsMetadata = optionsMetadata.filter((optionMetadata) =>
      typesMatch(optionMetadata, defaultValueMetadata)
    )
  }

  if (includeCustom) {
    optionsMetadata = enhanceColumnMetadata(optionsMetadata, source)
  }

  return optionsMetadata
    .map((col) => ({
      ...col,
      value: col.value,
      label: col.value.toString()
    }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

export const useColumnOptions = (
  source,
  { resetValue, includeCustom } = {}
) => {
  const [options, setOptions] = useState([])
  const { dataSources } = useDashboardState()
  const joinDataSources = useSelector((state) => state.joinDataSources)
  const getOptions = useCallback(async () => {
    const columnMetadata = dataSources?.[source]?.columnMetadata
    if (source) {
      setOptions(
        await fetchOptions(source, columnMetadata, joinDataSources, {
          resetValue,
          includeCustom
        })
      )
    }
  }, [source, dataSources, resetValue, includeCustom, joinDataSources])

  useEffect(() => {
    getOptions()
  }, [source, dataSources, resetValue, getOptions])

  return options
}
