// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Switch } from "@rmwc/switch"
import { Tooltip } from "@rmwc/tooltip"
import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"
import { MeasureDomain } from "vega/components/MeasureDomainOverlay/MeasureDomainOverlay"

export const BaselineToggle = ({
  measureDomain,
  clearManualMeasureDomainMin,
  setManualMeasureDomainMin,
  measureTitle,
  disabled = false
}: {
  measureDomain: MeasureDomain
  clearManualMeasureDomainMin: () => void
  setManualMeasureDomainMin: (min: number) => void
  measureTitle: string
  disabled: boolean
}) => {
  const setBaselineZero = () => {
    const measureMax = measureDomain ? measureDomain.max : null

    if (measureMax > 0) {
      setManualMeasureDomainMin(0)
    }
  }

  const onToggleChecked = () => {
    if (measureDomain?.min === 0 && measureDomain?.minLocked) {
      clearManualMeasureDomainMin()
    } else {
      setBaselineZero()
    }
  }

  return (
    <>
      <Tooltip content={measureTitle}>
        <label onClick={onToggleChecked}>{measureTitle}</label>
      </Tooltip>
      <TooltipIfContent
        content={
          measureDomain.max < 0 &&
          "Max must be greater or equal to 0 in order to set baseline to 0"
        }
      >
        <div>
          <Switch
            onClick={onToggleChecked}
            checked={measureDomain.min === 0 && measureDomain.minLocked}
            disabled={disabled || measureDomain.max < 0}
          />
        </div>
      </TooltipIfContent>
    </>
  )
}
