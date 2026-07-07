// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  CSSProperties,
  ChangeEventHandler,
  FC,
  FocusEventHandler,
  MouseEventHandler,
  useEffect,
  useState
} from "react"
import { connect } from "react-redux"
import cx from "classnames"

import { AxisOrientation } from "vega/charts/types"
import ParameterSelectorInput from "components/parameter-selector-input"
import { PopoverOrientation } from "components/parameter-selector-input/constants"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"

import "./styles.scss"
import { isDomRectEqual } from "utils/dom-helpers"

const HOVER_PADDING_VERTICAL = 4
const HOVER_PADDING_HORIZONTAL = 10

type Props = {
  container: HTMLDivElement | null
  selector: string
  title: string
  orientation?: AxisOrientation
  parameterSelectorOrientation?: PopoverOrientation
  onChange(title: string): void
}

const TitleOverlay: FC<Props> = ({
  layout,
  container,
  selector,
  title: currentTitle,
  orientation,
  parameterSelectorOrientation,
  onChange,
  markDashboardUnsaved
}) => {
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const [titleRect, setTitleRect] = useState<DOMRect | null>(null)
  const [title, setTitle] = useState<string>(currentTitle)
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

        setTitleRect((rect) => {
          const elem = container.querySelector(selector)
          if (elem) {
            const newRect = elem.getBoundingClientRect()
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
    setTitle(currentTitle)
  }, [currentTitle])

  const onTitleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setTitle(event.currentTarget.value)
  }

  const onTitleBlur: FocusEventHandler<HTMLInputElement> = () => {
    if (title !== currentTitle && title) {
      onChange(title)
    } else {
      setTitle(currentTitle)
    }
    setFocused(false)
    markDashboardUnsaved()
  }

  const onFocus = () => {
    setFocused(true)
  }

  const onTitleClick: MouseEventHandler<HTMLInputElement> = (event) => {
    // select all of the text on click
    event.currentTarget.select()
  }

  orientation = orientation || "bottom"
  const isVerticalTitle = orientation === "left" || orientation === "right"

  const titleStyle: CSSProperties = {
    left:
      titleRect && containerRect
        ? titleRect.left -
          containerRect.left -
          (isVerticalTitle
            ? orientation === "left"
              ? HOVER_PADDING_VERTICAL + 1
              : HOVER_PADDING_HORIZONTAL + HOVER_PADDING_VERTICAL + 1
            : HOVER_PADDING_HORIZONTAL)
        : 0,
    top:
      titleRect && containerRect
        ? titleRect.top -
          containerRect.top -
          (isVerticalTitle ? HOVER_PADDING_HORIZONTAL : HOVER_PADDING_VERTICAL)
        : 0,
    width: titleRect
      ? titleRect.width + HOVER_PADDING_HORIZONTAL * 2
      : undefined,
    height: titleRect
      ? titleRect.height + HOVER_PADDING_HORIZONTAL * 2
      : undefined
  }

  if (isVerticalTitle) {
    const tempWidth = titleStyle.width
    titleStyle.width = titleStyle.height
    titleStyle.height = tempWidth
  }

  const dashboardElement = document.getElementById("dashboard-container")

  return (
    <div
      className={cx("vega-title-container", `${orientation}-oriented`, {
        "vega-title-focused": focused
      })}
      style={titleStyle}
    >
      <ParameterSelectorInput
        onSelectParameter={onChange}
        portalProps={{
          layout,
          popoverOrientation:
            // Only pass parameterSelectorOrientation for right and left orientations.
            // ParameterSelectorInput auto-positions the popover above or below the input
            // depending on viewport which parameterSelectorOrientation will override.
            (parameterSelectorOrientation === PopoverOrientation.RIGHT ||
              parameterSelectorOrientation === PopoverOrientation.LEFT) &&
            parameterSelectorOrientation,
          scrollingElements: [dashboardElement]
        }}
        inputProps={{
          value: title,
          className: "domain-input",
          "data-testid": `vega-${orientation}-title-input`,
          "data-ui-config-id": "axis-title",
          onFocus,
          onBlur: onTitleBlur,
          onClick: onTitleClick,
          onChange: onTitleChange
        }}
      />
    </div>
  )
}

const mapStateToProps = ({ dashboard: { layout } }) => ({
  layout
})

const mapDispatchToProps = (dispatch) => ({
  markDashboardUnsaved: () => dispatch(updateDashboardSaveState())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(TitleOverlay))
