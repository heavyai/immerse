// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  FC,
  useState,
  useEffect,
  useRef,
  ChangeEventHandler,
  KeyboardEventHandler,
  CSSProperties,
  MouseEventHandler
} from "react"
import moment from "moment"

import Icon from "components/icon/icon"

import { AxisOrientation } from "vega/charts/types"

import "./styles.scss"
import { isDomRectEqual } from "utils/dom-helpers"

export type EditableDomain = {
  min: number | Date
  max: number | Date
  minLocked: boolean
  maxLocked: boolean
}

type Props = {
  container: HTMLDivElement | null
  selector: string
  domain?: EditableDomain | null
  isDateDomain: boolean
  orientation: AxisOrientation
  onDomainMinChange: (min: number | Date) => void
  onDomainMaxChange: (max: number | Date) => void
  onDomainMinClear: () => void
  onDomainMaxClear: () => void
}

// How many pixels around the container to add as a "grace" zone around the
// scale axis, for showing the measure domain inputs on hover
const HOVER_PADDING = 0

const DimensionDomainOverlay: FC<Props> = ({
  container,
  selector,
  domain,
  isDateDomain,
  orientation,
  onDomainMinChange,
  onDomainMaxChange,
  onDomainMinClear,
  onDomainMaxClear
}) => {
  const domainMin = domain
    ? domain.min instanceof Date || isDateDomain
      ? moment.utc(domain.min).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
      : domain.min
    : null
  const domainMax = domain
    ? domain.max instanceof Date || isDateDomain
      ? moment.utc(domain.max).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
      : domain.max
    : null

  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const [axisRect, setAxisRect] = useState<DOMRect | null>(null)
  const [min, setMin] = useState<number | string | null>(domainMin)
  const [max, setMax] = useState<number | string | null>(domainMax)
  const minRef = useRef<HTMLInputElement>(null)
  const maxRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

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

        setAxisRect((rect) => {
          const axis = container.querySelector(selector)
          if (axis) {
            const newRect = axis.getBoundingClientRect()
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
    setMin(domainMin)
  }, [domainMin])

  useEffect(() => {
    setMax(domainMax)
  }, [domainMax])

  if (
    !domain ||
    domainMin === null ||
    domainMax === null ||
    min === null ||
    max === null
  ) {
    return null
  }

  const minIsEmptyString = typeof min === "string" && min.trim() === ""
  const maxIsEmptyString = typeof max === "string" && max.trim() === ""

  const minAsNumber = Number(min)
  const maxAsNumber = Number(max)

  const minAsNumberValid =
    !isDateDomain &&
    !isNaN(minAsNumber) &&
    isFinite(minAsNumber) &&
    !minIsEmptyString
  const maxAsNumberValid =
    !isDateDomain &&
    !isNaN(maxAsNumber) &&
    isFinite(maxAsNumber) &&
    !maxIsEmptyString
  const numberOrderValid =
    minAsNumberValid && maxAsNumberValid && minAsNumber <= maxAsNumber

  const minAsMoment = moment(min)
  const maxAsMoment = moment(max)

  const minAsDateValid = isDateDomain && minAsMoment.isValid()
  const maxAsDateValid = isDateDomain && maxAsMoment.isValid()
  const dateOrderValid =
    minAsDateValid && maxAsDateValid && minAsMoment.isSameOrBefore(maxAsMoment)

  if (minRef && minRef.current) {
    if (minAsNumberValid || minAsDateValid) {
      if (numberOrderValid || dateOrderValid) {
        minRef.current.setCustomValidity("")
      } else {
        minRef.current.setCustomValidity("Min must be less than max.")
      }
    } else {
      minRef.current.setCustomValidity("Invalid number")
    }
  }
  if (maxRef && maxRef.current) {
    if (maxAsNumberValid || maxAsDateValid) {
      if (numberOrderValid || dateOrderValid) {
        maxRef.current.setCustomValidity("")
      } else {
        maxRef.current.setCustomValidity("Min must be less than max.")
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
    if (minAsNumberValid && minAsNumber !== domain.min && numberOrderValid) {
      onDomainMinChange(minAsNumber)
    } else if (
      minAsDateValid &&
      !minAsMoment.isSame(domain.min) &&
      !minIsEmptyString &&
      dateOrderValid
    ) {
      onDomainMinChange(minAsMoment.toDate().getTime())
    } else {
      setMin(domainMin)
    }
  }

  const onBlurMax = () => {
    setFocused(false)
    if (maxAsNumberValid && maxAsNumber !== domain.max && numberOrderValid) {
      onDomainMaxChange(maxAsNumber)
    } else if (
      maxAsDateValid &&
      !maxAsMoment.isSame(domain.max) &&
      !maxIsEmptyString &&
      dateOrderValid
    ) {
      onDomainMaxChange(maxAsMoment.toDate().getTime())
    } else {
      setMax(domainMax)
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
    if (domain.minLocked) {
      onDomainMinClear()
    } else {
      onDomainMinChange(domain.min)
    }
  }

  const onMaxLockClick = () => {
    if (domain.maxLocked) {
      onDomainMaxClear()
    } else {
      onDomainMaxChange(domain.max)
    }
  }

  const inputWidth = axisRect ? Math.min(axisRect.width, 84) : 84

  const containerStyle: CSSProperties = {
    left:
      axisRect && containerRect
        ? axisRect.left - containerRect.left - HOVER_PADDING
        : 0,
    top:
      axisRect && containerRect
        ? axisRect.top - containerRect.top - HOVER_PADDING
        : 0,
    width: axisRect ? axisRect.width + HOVER_PADDING * 2 : undefined,
    height: axisRect ? axisRect.height + HOVER_PADDING * 2 : undefined
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
      className={`vega-dimension-domain-container${
        focused ? " vega-dimension-domain-focused" : ""
      }`}
      style={containerStyle}
    >
      <div className="vega-dimension-domain-input-container" style={minStyle}>
        <div
          className="vega-dimension-domain-lock"
          data-testid="vega-dimension-domain-min-lock"
          onClick={onMinLockClick}
        >
          <Icon
            className="vega-dimension-domain-lock-icon"
            name={domain.minLocked ? "lock" : "unlock"}
          />
        </div>
        <input
          type="text"
          className="domain-input"
          data-ui-config-id="axis-tick-label"
          data-testid="vega-dimension-domain-min-input"
          ref={minRef}
          value={min}
          onFocus={onFocus}
          onBlur={onBlurMin}
          onClick={onClick}
          onChange={onMinChange}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="vega-dimension-domain-input-container" style={maxStyle}>
        <div
          className="vega-dimension-domain-lock"
          data-testid="vega-dimension-domain-max-lock"
          onClick={onMaxLockClick}
        >
          <Icon
            className="vega-dimension-domain-lock-icon"
            name={domain.maxLocked ? "lock" : "unlock"}
          />
        </div>
        <input
          type="text"
          className="domain-input"
          data-ui-config-id="axis-tick-label"
          data-testid="vega-dimension-domain-max-input"
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

export default React.memo(DimensionDomainOverlay)
