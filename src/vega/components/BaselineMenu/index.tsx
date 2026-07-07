// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useRef, useState } from "react"
import cx from "classnames"
import { Tooltip } from "@rmwc/tooltip"
import { BaselineIcon } from "components/svg-icons/icon-baseline"
import Popover from "components/popover/popover"
import { MeasureDomain } from "vega/components/MeasureDomainOverlay/MeasureDomainOverlay"
import { BaselineToggle } from "./BaselineToggle"
import { ScaleType, SCALE_TYPES } from "constants/scale-types"
import "./styles.scss"

export const BaselineMenu = ({
  setManualPrimaryMeasureDomainMin,
  primaryMeasureDomain,
  primaryMeasureTitle,
  clearManualPrimaryMeasureDomainMin,
  setManualSecondaryMeasureDomainMin,
  secondaryMeasureDomain,
  secondaryMeasureTitle,
  clearManualSecondaryMeasureDomainMin,
  scaleType
}: {
  setManualPrimaryMeasureDomainMin: (min: number) => void
  primaryMeasureDomain: MeasureDomain
  primaryMeasureTitle: string
  clearManualPrimaryMeasureDomainMin: () => void
  setManualSecondaryMeasureDomainMin: (min: number) => void
  secondaryMeasureDomain: MeasureDomain
  secondaryMeasureTitle: string
  clearManualSecondaryMeasureDomainMin: () => void
  scaleType: ScaleType
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const anchorRef = useRef(null)

  return (
    <div
      className={cx("baseline-menu", {
        "baseline-menu--open": menuOpen
      })}
    >
      <div
        className="baseline-menu__anchor"
        onClick={() => setMenuOpen(true)}
        ref={anchorRef}
      >
        <Tooltip content={"Set Baseline"}>
          <BaselineIcon
            active={
              (primaryMeasureDomain?.min === 0 &&
                primaryMeasureDomain.minLocked) ||
              (secondaryMeasureDomain?.min === 0 &&
                secondaryMeasureDomain.minLocked)
            }
          />
        </Tooltip>
      </div>
      {menuOpen && (
        <Popover
          className="baseline-menu__popover"
          isOpened
          onClose={() => setMenuOpen(false)}
        >
          <h6>Start y-axis at 0</h6>
          <div className="baseline-menu__toggles">
            <BaselineToggle
              clearManualMeasureDomainMin={clearManualPrimaryMeasureDomainMin}
              measureDomain={primaryMeasureDomain}
              measureTitle={primaryMeasureTitle}
              setManualMeasureDomainMin={setManualPrimaryMeasureDomainMin}
              disabled={scaleType === SCALE_TYPES.LOG}
            />
            {secondaryMeasureDomain && (
              <BaselineToggle
                clearManualMeasureDomainMin={
                  clearManualSecondaryMeasureDomainMin
                }
                measureDomain={secondaryMeasureDomain}
                measureTitle={secondaryMeasureTitle}
                setManualMeasureDomainMin={setManualSecondaryMeasureDomainMin}
                disabled={scaleType === SCALE_TYPES.LOG}
              />
            )}
          </div>
        </Popover>
      )}
    </div>
  )
}
