// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, KeyboardEventHandler, useEffect, useState } from "react"
import GradientColorLegend from "vega/components/ContinuousLegend/GradientColorLegend"
import Icon from "components/icon/icon"
import "./styles.scss"

type Datum = any

type Props = {
  /** Chart id */
  chartId: string

  /** Color range from the Vega Combo colorMeasure palette */
  selectedColorRange: string[]

  /** Color range reverse order flag */
  isMeasureColorPaletteReversed?: boolean

  /** Dynamic domain calculated from the transformed data, color measures */
  colorDomain: [number, number]

  /* Dynamic flag associated with chart.scales.colorMeasure.domain
    Locked state: 1. User locks the icon, then we save the domain with the current dynamic domain value
                  2. User changes the domain input
    Unlocked state: 1. User selects a color measure
                    2. User unlocks the icon, then we clear the saved domain
   */
  legendLocked: boolean

  /** Action called either by locking the icon or changing the domain input */
  setColorDomain: (chartId: string, colorDomain: [number, number]) => void

  /** Action called by unlocking the lock icon */
  clearColorDomain: (chartId: string) => void
}

const ContinuousLegend: FC<Props> = ({
  chartId,
  legendLocked,
  selectedColorRange,
  isMeasureColorPaletteReversed,
  colorDomain,
  setColorDomain,
  clearColorDomain
}) => {
  const [dynamicColorDomain, setDynamicColorDomain] = useState(colorDomain)

  const onLegendLock = () => {
    if (legendLocked) {
      clearColorDomain(chartId)
    } else {
      setColorDomain(chartId, dynamicColorDomain)
    }
  }

  const setMinDomainIfValid = (v: string) => {
    const value = Number(v)
    if (!isNaN(value) && isFinite(value)) {
      const newDomain: [number, number] = [...dynamicColorDomain]
      newDomain[0] = value
      setColorDomain(chartId, newDomain)
      setDynamicColorDomain(newDomain)
    }
  }

  const setMaxDomainIfValid = (v: string) => {
    const value = Number(v)
    if (!isNaN(value) && isFinite(value)) {
      const newDomain: [number, number] = [...dynamicColorDomain]
      newDomain[1] = value
      setColorDomain(chartId, newDomain)
      setDynamicColorDomain(newDomain)
    }
  }

  useEffect(() => {
    if (colorDomain) {
      setDynamicColorDomain(colorDomain)
    }
  }, [colorDomain])

  // Un-focus the input on Enter
  const onKeyPress: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  return (
    <div
      className="vega-color-measure-legend-container"
      data-ui-config-id="legend-continuous"
    >
      <div className="vega-color-measure-legend-wrapper">
        <GradientColorLegend
          colors={selectedColorRange}
          reverse={isMeasureColorPaletteReversed}
          domain={dynamicColorDomain}
        />
        <div
          className="color-measure-domain-lock"
          data-testid="color-measure-domain-lock"
          onClick={() => onLegendLock()}
        >
          <Icon
            className="color-measure-domain-lock-icon"
            name={legendLocked ? "lock" : "unlock"}
          />
        </div>
      </div>
      <div className="vega-measure-legend-inputs">
        <input
          type="text"
          className="legend-domain-input left"
          value={dynamicColorDomain[0]}
          data-testid="color-measure-domain-min-input"
          onChange={({ currentTarget: { value: v } }) => setMinDomainIfValid(v)}
          onKeyPress={onKeyPress}
        />
        <input
          type="text"
          className="legend-domain-input right"
          value={dynamicColorDomain[1]}
          data-testid="color-measure-domain-max-input"
          onChange={({ currentTarget: { value: v } }) => setMaxDomainIfValid(v)}
          onKeyPress={onKeyPress}
        />
      </div>
    </div>
  )
}

export default React.memo(ContinuousLegend)
