// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { List } from "widgets/list/List"
import { CollapsibleList, SimpleListItem } from "@rmwc/list"

import { BaseDimensionScaleSettings, ComputedMinMax } from "vega/charts/types"
import { getTimeBinOptionsInRange } from "vega/utils/binning"

import TimeExtract from "./TimeExtract"

import "./styles.scss"

type SelectOption = {
  value: string
  label: string
}

type Props = {
  onMouseDown?: () => void
  showExtract?: boolean
  listSizeClass?: string
  isUnbinned?: boolean
  binSettings: BaseDimensionScaleSettings | null
  minmax: ComputedMinMax | null
  maxTimeBins: number | undefined
  updateBinInterval: (o: SelectOption) => void
  updateExtractInterval?: (o: SelectOption) => void
}

const TimeDimBinning: FC<Props> = ({
  onMouseDown,
  binSettings,
  minmax,
  maxTimeBins,
  updateBinInterval,
  updateExtractInterval,
  isUnbinned,
  showExtract,
  listSizeClass
}) => {
  if (binSettings?.dimensionType === "binned_numeric") {
    throw new Error("Unexpected non-time binSettings")
  }

  // The available time bin options are dynamic, based on the min/max range
  // It will always at least have "auto", even if minmax is null
  const binningOptions = [
    { label: "Off", value: "off" },
    ...(isUnbinned ? [] : getTimeBinOptionsInRange(minmax, maxTimeBins))
  ]

  return (
    <div className="time-bin-container">
      <List
        compact={listSizeClass === "compact"}
        extraCompact={listSizeClass === "extraCompact"}
      >
        {binningOptions.map((o, i) => (
          <SimpleListItem
            key={i}
            text={o.label}
            onMouseDown={() => updateBinInterval(o)}
            selected={
              binSettings
                ? binSettings.dimensionType === "binned_time" &&
                  binSettings.timeUnit === o.value
                : o.value === "off"
            }
          />
        ))}
      </List>
      {showExtract && !isUnbinned && (
        <CollapsibleList
          handle={
            <div className="extract-wrapper" onMouseDown={onMouseDown}>
              <List
                compact={listSizeClass === "compact"}
                extraCompact={listSizeClass === "extraCompact"}
              >
                <SimpleListItem text="Extract" metaIcon="chevron_right" />
              </List>
            </div>
          }
        >
          <TimeExtract
            binSettings={binSettings}
            listSizeClass={listSizeClass}
            updateExtractInterval={updateExtractInterval}
          />
        </CollapsibleList>
      )}
      {showExtract &&
      isUnbinned && ( // the case we have more than one base dimensions
          <TimeExtract
            binSettings={binSettings}
            listSizeClass={listSizeClass}
            updateExtractInterval={updateExtractInterval}
          />
        )}
    </div>
  )
}

export default TimeDimBinning
