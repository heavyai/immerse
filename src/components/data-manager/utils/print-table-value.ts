// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import moment from "moment"
import "moment-duration-format"

export const printFormattedTableValue = (value, meta) => {
  if (value === null) {
    return "NULL"
  }
  switch (meta.type) {
    case "MULTIPOLYGON":
      return "<<MULTIPOLYGON VALUE>>"
    case "DATE":
      return moment(value).utc().format("MM/DD/YYYY")
    case "TIMESTAMP":
      return moment(value).format("MM/DD/YYYY hh:mm:ss")
    default:
      return value.toString()
  }
}
