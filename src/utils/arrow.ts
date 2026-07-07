// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DataType, Field, Table } from "apache-arrow"

// Arrow has a valueOf() function on its big numbers, but it has a bug that
// fails on negative numbers. This is a replacement. I've submitted this fix as
// a PR to the Arrow project and it has been merged in early April 2022, so,
// theoretically, it should be in the next version.
function bignumToNumber(bn) {
  if (!bn) {
    // BN fields may have nulls
    return bn
  }

  /* eslint-disable no-bitwise */
  const { buffer, byteOffset, length, signed: signed } = bn
  const words = new Uint32Array(buffer, byteOffset, length)
  const n = words.length
  const negative = signed && words[n - 1] & 0x80000000
  let number = negative ? 1 : 0
  let v = 0
  for (let i = 0; i < n; i++) {
    v = words[i]
    number += (negative ? ~v : v) * Math.pow(2, 32 * i)
  }
  if (negative) {
    number *= -1
  }
  return number
  /* eslint-enable no-bitwise */
}

type ValueMapper = (v: any) => any
function buildConversionFunction(field: Field<any>["type"]): ValueMapper {
  if (DataType.isTimestamp(field)) {
    return (v) => (v === null ? v : new Date(v))
  } else if (DataType.isTime(field)) {
    return (v) => (v === null ? v : new Date(v * 1000))
  } else if (DataType.isInt(field) && field.bitWidth === 64) {
    return (v) => (v === null ? v : Number(v))
  } else if (DataType.isDecimal(field)) {
    const scale = Math.pow(10, -field.scale)
    return (v) => (v === null ? v : bignumToNumber(v) * scale)
  }
  return (v) => v
}

/**
 * @param table The Arrow Table
 * @returns an array of plain javascript objects
 */
export function tableToJson(table: Table): any[] {
  performance.mark("tableToJson-start")

  const valueMappers: Record<string, ValueMapper> = {}
  for (const columnSchema of table.schema.fields) {
    valueMappers[columnSchema.name] = buildConversionFunction(columnSchema.type)
  }

  const props = Object.keys(valueMappers)
  const len = table.numRows
  const data = new Array(len)
  let i = 0
  for (const row of table) {
    const datum: Record<string, any> = {}
    for (const prop of props) {
      const v = row?.[prop]
      datum[prop] = valueMappers[prop](v)
    }
    data[i] = datum
    i++
  }
  performance.mark("tableToJson-end")

  const measure = performance.measure(
    "tableToJson",
    "tableToJson-start",
    "tableToJson-end"
  )
  // eslint-disable-next-line no-console
  console.log("Time to convert Arrow table to json:", measure.duration, "ms")
  return data
}

/**
 * @param t An Arrow Type
 * @returns the corresponding SQL type. Note: there is NOT a 1-to-1
 * correspondence between the Arrow types and SQL types, so this isn't
 * completely accurate.
 */
function arrowTypeToSQL(t) {
  if (DataType.isInt(t)) {
    if (t.bitWidth === 8) {
      return "TINYINT"
    } else if (t.bitWidth === 16) {
      return "SMALLINT"
    } else if (t.bitWidth === 64) {
      return "BIGINT"
    }
    return "INT"
  } else if (DataType.isFloat(t)) {
    if (t.precision === 2) {
      return "DOUBLE"
    }
    return "FLOAT"
  } else if (
    DataType.isBinary(t) ||
    DataType.isUtf8(t) ||
    DataType.isDictionary(t) ||
    DataType.isFixedSizeBinary(t)
  ) {
    return "STR"
  } else if (DataType.isBool(t)) {
    return "BOOL"
  } else if (DataType.isDecimal(t)) {
    return "DECIMAL"
  } else if (DataType.isDate(t)) {
    return "DATE"
  } else if (DataType.isTime(t)) {
    return "TIME"
  } else if (DataType.isTimestamp(t)) {
    return "TIMESTAMP"
  } else if (DataType.isInterval(t)) {
    return "INT"
  }
  return "NULL"
}

/**
 * queryAsync returns an object that contains the results and an array of
 * fields, describing the schema of the results. This function will attempt to
 * build those same fields given an Arrow table.
 * @param table An Arrow table
 * @returns an array of fields
 */
export function tableToFields(table) {
  return table.schema.fields.map((field) => ({
    name: field.name,
    type: arrowTypeToSQL(field.type),
    is_array: false
  }))
}
