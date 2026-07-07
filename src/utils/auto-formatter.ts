// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { autoFormatter } from "import-shims/heavyai-d3-combo-chart"

export enum CUSTOM_FORMATTER_TYPE {
  BYTES = "BYTES",
  BYTES_COMMON_SUFFIX = "BYTES_COMMON_SUFFIX"
}

type Format = string | CUSTOM_FORMATTER_TYPE
type FormatSpec = { format: Format; key: string }
type FormatSpecs = Array<FormatSpec>

export const bibUnits = ["Bytes", "KiB", "MiB", "GiB", "TiB"]
export const commonSuffixUnits = ["Bytes", "KB", "MB", "GB", "TB"]

const byteFormatter = (units: string[] = commonSuffixUnits) => (
  bytes: number
) => {
  // Not sure if this really make sense, but handles this like
  // it does positive bytes
  const isNegative = bytes < 0
  let absBytes = Math.abs(bytes)
  let i = 0
  while (absBytes >= 1024 && i < units.length - 1) {
    absBytes /= 1024
    i++
  }
  return `${isNegative ? "-" : ""}${absBytes.toFixed(2)} ${units[i]}`
}

const customFormatters = {
  [CUSTOM_FORMATTER_TYPE.BYTES]: byteFormatter(bibUnits),
  [CUSTOM_FORMATTER_TYPE.BYTES_COMMON_SUFFIX]: byteFormatter(commonSuffixUnits)
}

/**
 * Wraps the heavyai-d3/heavyai-combo autoFormat to provide custom formatting via function
 *
 * @param formats - Array of {format: string, key: string} objects, or a single format string
 * @returns - Function that takes a value, and a key (column name) and
 *            returns that number formatted for that column
 */
export const immerseAutoFormatter = (formats: FormatSpecs | string) => {
  const autoFormatFormats = [] as Array<{ key: string; format: string }>
  const customFormats = {} as Record<string, (v: number) => string>

  // We have to handle just getting a single format value
  // for combo/vega charts. Usually this is an array of key/format pairs
  // which maps from measure -> formatter to use
  if (!Array.isArray(formats)) {
    const formatKey = formats as CUSTOM_FORMATTER_TYPE
    if (customFormatters[formatKey]) {
      return customFormatters[formatKey]
    } else {
      return autoFormatter?.(formatKey) ?? null
    }
  }

  // Some charts do not default a format, fall back to null/auto format
  if (formats?.length === 0) {
    return null
  }

  // Put each format into a custom or autoFormatter bucket
  formats.forEach(({ key, format }) => {
    if (
      Object.values(CUSTOM_FORMATTER_TYPE).includes(
        format as CUSTOM_FORMATTER_TYPE
      )
    ) {
      customFormats[key] = customFormatters[format as CUSTOM_FORMATTER_TYPE]
    } else {
      autoFormatFormats.push({ key, format })
    }
  })
  const autoFormatterFormatter = autoFormatter(autoFormatFormats)

  return (v: number, k: string) => {
    if (!k) {
      // Number chart, and maybe others do not pass a measure key (there can only be one)
      // so we will make some assumptions here and just use the only thing available
      // fallback to the autoFormatter, and double fallback to the default auto
      // format (return null)
      if (Object.values(customFormats).length === 1) {
        return Object.values(customFormats)[0](v)
      } else {
        return autoFormatterFormatter?.(v, k) ?? null
      }
    }
    // Otherwise we'll look up the custom format by measure key, or fall through
    // to the autoFormatter, and double fall through to null (default/auto)
    if (customFormats[k]) {
      return customFormats[k](v)
    } else {
      return autoFormatterFormatter?.(v, k) ?? null
    }
  }
}
