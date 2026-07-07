// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  TDatumType,
  TEncodingType
} from "@heavyai/connector/dist/browser-connector"

// The values for precision, scale, encoding, and comp_param are as specified in the backend code
export const TABLE_DATA_TYPES = [
  {
    label: "tiny integer",
    value: {
      type: TDatumType.TINYINT,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  {
    label: "small integer",
    value: {
      type: TDatumType.SMALLINT,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  {
    label: "integer",
    value: {
      type: TDatumType.INT,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  {
    label: "big integer",
    value: {
      type: TDatumType.BIGINT,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  {
    label: "boolean",
    value: {
      type: TDatumType.BOOL,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  {
    label: "date",
    value: {
      type: TDatumType.DATE,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  {
    label: "decimal",
    value: {
      type: TDatumType.DECIMAL,
      encoding: TEncodingType.NONE,
      precision: 14,
      scale: 7,
      comp_param: 0
    }
  },
  {
    label: "float",
    value: {
      type: TDatumType.FLOAT,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  {
    label: "double",
    value: {
      type: TDatumType.DOUBLE,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  // The four GEO types should have precision set to `23` to match the value of the backend
  // `SQLTypes::kGEOMETRY` C++ type enum, per @simoneves.
  {
    label: "point",
    value: {
      type: TDatumType.POINT,
      encoding: TEncodingType.GEOINT,
      precision: 23,
      scale: 4326,
      comp_param: 32
    }
  },
  {
    label: "linestring",
    value: {
      type: TDatumType.LINESTRING,
      encoding: TEncodingType.GEOINT,
      precision: 23,
      scale: 4326,
      comp_param: 32
    }
  },
  {
    label: "multilinestring",
    value: {
      type: TDatumType.MULTILINESTRING,
      encoding: TEncodingType.GEOINT,
      precision: 23,
      scale: 4326,
      comp_param: 32
    }
  },
  {
    label: "polygon",
    value: {
      type: TDatumType.POLYGON,
      encoding: TEncodingType.GEOINT,
      precision: 23,
      scale: 4326,
      comp_param: 32
    }
  },
  {
    label: "multipolygon",
    value: {
      type: TDatumType.MULTIPOLYGON,
      encoding: TEncodingType.GEOINT,
      precision: 23,
      scale: 4326,
      comp_param: 32
    }
  },
  {
    label: "string",
    value: {
      type: TDatumType.STR,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  {
    label: "string [dict. encode]",
    value: {
      type: TDatumType.STR,
      encoding: TEncodingType.DICT,
      precision: 0,
      scale: 0,
      comp_param: 32
    }
  },
  {
    label: "time",
    value: {
      type: TDatumType.TIME,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  {
    label: "timestamp (s)",
    value: {
      type: TDatumType.TIMESTAMP,
      encoding: TEncodingType.NONE,
      precision: 0,
      scale: 0,
      comp_param: 0
    }
  },
  {
    label: "timestamp (ms)",
    value: {
      type: TDatumType.TIMESTAMP,
      precision: 3,
      encoding: TEncodingType.NONE
    }
  },
  {
    label: "timestamp (μs)",
    value: {
      type: TDatumType.TIMESTAMP,
      precision: 6,
      encoding: TEncodingType.NONE
    }
  },
  {
    label: "timestamp (ns)",
    value: {
      type: TDatumType.TIMESTAMP,
      precision: 9,
      encoding: TEncodingType.NONE
    }
  }
]

export const findTypeStringByColumnType = (columnType) =>
  (
    TABLE_DATA_TYPES.find((typeObj) => typeObj.value.type === columnType) || {
      label: ""
    }
  ).label

// Given column type information, find the most appropriate option in DATA_TYPES
export const findColDataType = (backendType) => {
  // Search by type, encoding, then precision until we have exactly one option left
  const byType = TABLE_DATA_TYPES.map((x) => x.value).filter(
    (x) => x.type === backendType.type
  )
  if (byType.length === 1) {
    return byType[0]
  }

  const byEncoding = byType.filter((x) => x.encoding === backendType.encoding)
  if (byEncoding.length === 1) {
    return byEncoding[0]
  }

  const byPrecision = byEncoding.filter(
    (x) => x.precision === backendType.precision
  )
  // If there's more than one viable option, just pick the first
  if (byPrecision.length >= 1) {
    return byPrecision[0]
  }

  throw new Error(
    `Unknown type detected by backend: ${JSON.stringify(backendType)}`
  )
}
