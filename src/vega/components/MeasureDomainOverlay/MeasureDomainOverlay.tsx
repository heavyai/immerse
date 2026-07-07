// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  FC,
  useState,
  useEffect,
  ChangeEventHandler,
  KeyboardEventHandler,
  useRef,
  CSSProperties,
  MouseEventHandler
} from "react"

import Icon from "components/icon/icon"
import { AxisOrientation } from "vega/charts/types"
import { createDomRectFromElements, isDomRectEqual } from "utils/dom-helpers"

import "./styles.scss"

export type MeasureDomain = {
  min: number
  max: number
  minLocked: boolean
  maxLocked: boolean
}

type Props = {
  container: HTMLDivElement | null
  selector: string
  measureDomain?: MeasureDomain | null
  orientation: AxisOrientation
  onMeasureDomainMinChange: (min: number) => void
  onMeasureDomainMaxChange: (max: number) => void
  onMeasureDomainMinClear: () => void
  onMeasureDomainMaxClear: () => void
}

// How many pixels around the container to add as a "grace" zone around the
// scale axis, for showing the measure domain inputs on hover
const HOVER_PADDING = 0

const MeasureDomainOverlay: FC<Props> = ({
  container,
  selector,
  measureDomain,
  orientation,
  onMeasureDomainMinChange,
  onMeasureDomainMaxChange,
  onMeasureDomainMinClear,
  onMeasureDomainMaxClear
}) => {
  const measureMin = measureDomain ? measureDomain.min : null
  const measureMax = measureDomain ? measureDomain.max : null
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const [scaleAxisRect, setScaleAxisRect] = useState<DOMRect | null>(null)
  const [min, setMin] = useState<string | number | null>(measureMin)
  const [max, setMax] = useState<string | number | null>(measureMax)
  const [focused, setFocused] = useState(false)
  const minRef = useRef<HTMLInputElement>(null)
  const maxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!container) {
      return undefined
    }

    const mouseenter = () => {
      setTimeout(() => {
        setContainerRect((rect) => {
          const newRect = container.getBoundingClientRect()
          if (!isDomRectEqual(newRect, rect)) {
            return newRect
          }
          return rect
        })

        setScaleAxisRect((rect) => {
          const axis = container.querySelector(selector)
          if (axis) {
            const newRect = createDomRectFromElements([
              axis.querySelector(".mark-rule.role-axis-tick"),
              axis.querySelector(".mark-text.role-axis-label"),
              axis.querySelector(".mark-rule.role-axis-domain"),
              axis.querySelector(".mark-text.role.axis-title")
            ])
            if (!isDomRectEqual(newRect, rect)) {
              return newRect
            }
          }
          return rect
        })
      }, 0)
    }

    container.addEventListener("mouseenter", mouseenter)

    return () => container.removeEventListener("mouseenter", mouseenter)
  }, [container, selector])

  useEffect(() => {
    setMin(measureMin)
    setMax(measureMax)
  }, [measureMin, measureMax])

  if (
    !containerRect ||
    !scaleAxisRect ||
    !measureDomain ||
    min === null ||
    max === null
  ) {
    return <></>
  }

  const minAsNumber = Number(min)
  const maxAsNumber = Number(max)

  const minAsNumberValid = !isNaN(minAsNumber) && isFinite(minAsNumber)
  const maxAsNumberValid = !isNaN(maxAsNumber) && isFinite(maxAsNumber)
  const orderValid =
    minAsNumberValid && maxAsNumberValid && minAsNumber <= maxAsNumber

  if (minRef && minRef.current) {
    if (minAsNumberValid) {
      if (!orderValid) {
        minRef.current.setCustomValidity("Min must be less than max.")
      } else {
        minRef.current.setCustomValidity("")
      }
    } else {
      minRef.current.setCustomValidity("Invalid number")
    }
  }
  if (maxRef && maxRef.current) {
    if (maxAsNumberValid) {
      if (!orderValid) {
        maxRef.current.setCustomValidity("Min must be less than max.")
      } else {
        maxRef.current.setCustomValidity("")
      }
    } else {
      maxRef.current.setCustomValidity("Invalid number")
    }
  }

  const onMinChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setMin(event.currentTarget.value)
  }

  const onMaxChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setMax(event.currentTarget.value)
  }

  const onBlurMin = () => {
    setFocused(false)
    if (minAsNumberValid && orderValid && minAsNumber !== measureDomain.min) {
      onMeasureDomainMinChange(minAsNumber)
    } else {
      setMin(measureDomain.min)
    }
  }

  const onBlurMax = () => {
    setFocused(false)
    if (maxAsNumberValid && orderValid && maxAsNumber !== measureDomain.max) {
      onMeasureDomainMaxChange(maxAsNumber)
    } else {
      setMax(measureDomain.max)
    }
  }

  const onFocus = () => {
    setFocused(true)
  }

  // Select all text in the input on click
  const onClick: MouseEventHandler<HTMLInputElement> = (event) => {
    event.currentTarget.select()
  }

  // Blur (de-focus) the input on an Enter or Escape key press
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  const onMinLockClick = () => {
    if (measureDomain.minLocked) {
      onMeasureDomainMinClear()
    } else {
      onMeasureDomainMinChange(measureDomain.min)
    }
  }

  const onMaxLockClick = () => {
    if (measureDomain.maxLocked) {
      onMeasureDomainMaxClear()
    } else {
      onMeasureDomainMaxChange(measureDomain.max)
    }
  }

  const inputWidth = scaleAxisRect ? Math.min(scaleAxisRect.width, 84) : 84

  const containerStyle: CSSProperties = {
    left:
      scaleAxisRect && containerRect
        ? scaleAxisRect.left - containerRect.left - HOVER_PADDING
        : 0,
    top:
      scaleAxisRect && containerRect
        ? scaleAxisRect.top - containerRect.top - HOVER_PADDING
        : 0,
    width: scaleAxisRect ? scaleAxisRect.width + HOVER_PADDING * 2 : undefined,
    height: scaleAxisRect ? scaleAxisRect.height + HOVER_PADDING * 2 : undefined
  }

  let minStyle: CSSProperties | undefined = undefined
  let maxStyle: CSSProperties | undefined = undefined

  if (orientation === "top") {
    minStyle = {
      left: HOVER_PADDING,
      bottom: HOVER_PADDING,
      width: inputWidth
    }
    maxStyle = {
      right: HOVER_PADDING,
      bottom: HOVER_PADDING,
      width: inputWidth
    }
  } else if (orientation === "right") {
    minStyle = {
      left: HOVER_PADDING,
      bottom: HOVER_PADDING,
      width: inputWidth
    }
    maxStyle = {
      left: HOVER_PADDING,
      top: HOVER_PADDING,
      width: inputWidth
    }
  } else if (orientation === "bottom") {
    minStyle = {
      left: HOVER_PADDING,
      top: HOVER_PADDING,
      width: inputWidth
    }
    maxStyle = {
      right: HOVER_PADDING,
      top: HOVER_PADDING,
      width: inputWidth
    }
  } else {
    // "left"
    minStyle = {
      right: HOVER_PADDING,
      bottom: HOVER_PADDING,
      width: inputWidth
    }
    maxStyle = {
      right: HOVER_PADDING,
      top: HOVER_PADDING,
      width: inputWidth
    }
  }

  return (
    <div
      className={`vega-measure-domain-container${
        focused ? " vega-measure-domain-focused" : ""
      }`}
      style={containerStyle}
    >
      <div className="vega-measure-domain-input-container" style={minStyle}>
        <div
          className="vega-measure-domain-lock"
          data-testid="vega-measure-domain-min-lock"
          onClick={onMinLockClick}
        >
          <Icon
            className="vega-measure-domain-lock-icon"
            name={measureDomain.minLocked ? "lock" : "unlock"}
          />
        </div>
        <input
          type="text"
          className="domain-input"
          data-ui-config-id="axis-tick-label"
          data-testid="vega-measure-domain-min-input"
          ref={minRef}
          value={min}
          onFocus={onFocus}
          onBlur={onBlurMin}
          onClick={onClick}
          onChange={onMinChange}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="vega-measure-domain-input-container" style={maxStyle}>
        <div
          className="vega-measure-domain-lock"
          data-testid="vega-measure-domain-max-lock"
          onClick={onMaxLockClick}
        >
          <Icon
            className="vega-measure-domain-lock-icon"
            name={measureDomain.maxLocked ? "lock" : "unlock"}
          />
        </div>
        <input
          type="text"
          className="domain-input"
          data-ui-config-id="axis-tick-label"
          data-testid="vega-measure-domain-max-input"
          ref={maxRef}
          value={max}
          onFocus={onFocus}
          onBlur={onBlurMax}
          onClick={onClick}
          onChange={onMaxChange}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  )
}

export default React.memo(MeasureDomainOverlay)
