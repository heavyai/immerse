// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { List } from "widgets/list/List"
import { SimpleListItem } from "@rmwc/list"

import { BaseDimensionScaleSettings } from "vega/charts/types"
import { EXTRACT_OPTIONS } from "utils/time-helpers"

import "./styles.scss"

type optionProp = {
  value: string
  label: string
}
type Props = {
  binSettings: BaseDimensionScaleSettings | null
  listSizeClass?: string
  updateExtractInterval: (o: optionProp) => void
}

const TimeExtract: FC<Props> = ({
  binSettings,
  listSizeClass,
  updateExtractInterval
}) => {
  return (
    <div className="extract-list-wrapper">
      <List
        compact={listSizeClass === "compact"}
        extraCompact={listSizeClass === "extraCompact"}
      >
        {EXTRACT_OPTIONS.map((o, i) => (
          <SimpleListItem
            key={i}
            text={o.label}
            onMouseDown={() => updateExtractInterval(o)}
            selected={
              binSettings?.dimensionType === "extract_time" &&
              binSettings.timeUnit === o.value
            }
          />
        ))}
      </List>
    </div>
  )
}

export default TimeExtract
