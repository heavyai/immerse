// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ParameterType, ParameterTypes } from "../parameters/parameters-types"
import IconColumn from "../svg-icons/icon-column"
import IconColumnValue from "../svg-icons/icon-column-value"
import NumberIcon from "../svg-icons/icon-number"
import CodeIcon from "../svg-icons/icon-code"
import React from "react"

const ParameterTypeIcon = ({ type }: { type: ParameterType }) => {
  switch (type) {
    case ParameterTypes.COLUMN:
      return <IconColumn />
    case ParameterTypes.COLUMN_VALUE:
      return <IconColumnValue />
    case ParameterTypes.NUMBER:
      return <NumberIcon />
    case ParameterTypes.TEXT:
    default:
      return <CodeIcon />
  }
}

export default ParameterTypeIcon
