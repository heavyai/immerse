// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react"
import {
  formatJSON,
  formatSQL,
  inputIsValidJSON,
  singleLineSQL
} from "../utils"

export const useSqlFormatMode = (
  input: string,
  storeInputValue: (val: string) => void
) => {
  const [sqlFormatted, setSqlFormatted] = useState(input === formatSQL(input))
  const [singleLineSqlMode, setSingleLineSqlMode] = useState(false)

  const isJsonInput = inputIsValidJSON(input)

  const formatInput = () => {
    storeInputValue(isJsonInput ? formatJSON(input) : formatSQL(input))
    setSqlFormatted(true)
    setSingleLineSqlMode(false)
  }

  const singleLineInput = () => {
    storeInputValue(singleLineSQL(input))
    setSqlFormatted(false)
    setSingleLineSqlMode(true)
  }

  const clearSqlFormatMode = () => {
    setSqlFormatted(false)
    setSingleLineSqlMode(false)
  }

  return {
    formatInput,
    singleLineInput,
    sqlFormatted,
    singleLineSqlMode,
    clearSqlFormatMode
  }
}
