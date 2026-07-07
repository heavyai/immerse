// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Chip } from "@material-ui/core"
import IconNumber from "components/svg-icons/icon-number"
import IconEnum from "components/svg-icons/icon-enum"
import IconDateTime from "components/svg-icons/icon-date-time"
import IconGeo from "components/svg-icons/icon-geo"
import "./column-type-badge.scss"
import { ROLLUP_COLUMN_TYPES, getRollupType } from "./utils"

export const ColumnTypeBadge = ({ type }: { type: string }) => {
  const getIcon = () => {
    const { NUMERIC, DATETIME, CATEGORICAL, GEOSPATIAL } = ROLLUP_COLUMN_TYPES
    const rollupType = getRollupType(type)
    switch (rollupType) {
      case NUMERIC:
        return <IconNumber />
      case CATEGORICAL:
        return <IconEnum />
      case DATETIME:
        return <IconDateTime />
      case GEOSPATIAL:
        return <IconGeo />
      default:
        return <></>
    }
  }
  return (
    <Chip
      className="column-type-badge"
      label={getRollupType(type)}
      icon={<div className="column-type-badge__icon">{getIcon()}</div>}
      size="small"
      variant="outlined"
    />
  )
}
