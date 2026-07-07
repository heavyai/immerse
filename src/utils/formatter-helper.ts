// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DataTypes, isNumericType, isTimeType } from "../constants/data-types"

export const DEFAULT_NUMERIC_FORMAT = "custom-imperial"
export const DEFAULT_TIMESTAMP_FORMAT = "%c"
export const DEFAULT_DATE_FORMAT = "%Y-%m-%d"
export const DEFAULT_TIME_FORMAT = "%H:%M:%S.%L"

export function getDefaultFormat(type: DataTypes) {
  let defaultFormat = ""
  if (isNumericType(type)) {
    defaultFormat = DEFAULT_NUMERIC_FORMAT
  } else if (isTimeType(type)) {
    if (type === "DATE" || type === "date") {
      defaultFormat = DEFAULT_DATE_FORMAT
    } else if (type === "TIME") {
      defaultFormat = DEFAULT_TIME_FORMAT
    } else {
      defaultFormat = DEFAULT_TIMESTAMP_FORMAT
    }
  }
  return defaultFormat
}
