// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import cx from "classnames"
import { onEditPath } from "utils/routerPath"
import { process as processParameters } from "utils/ImmerseSQLPlusPlus/parser"
import ParameterSelectorInput from "components/parameter-selector-input"
import { PopoverOrientation } from "components/parameter-selector-input/constants"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"

import "./styles.scss"

type Props = {
  chartId: string
  yAxisLabel: string
  xAxisLabel: string
  updateYAxisLabel(value: string): void
  updateXAxisLabel(value: string): void
}

// This is an overlay for charts that render their axes in heavyai-charting and heavyai-d3.
// It recreates the axis label editing feature and provides new parameters
// functionality that would be too cumbersome to port to heavyai-charting and heavyai-d3,
// and hides the existing axes using CSS (see chart-axis-overlay/styles.scss)
const MapDCChartAxisOverlay: FC<Props> = ({
  chartId,
  isEdit,
  layout,
  hasContinuousLegend,
  xAxisLabel,
  yAxisLabel,
  y2AxisLabel,
  updateXAxisLabel,
  updateYAxisLabel,
  updateY2AxisLabel,
  markDashboardUnsaved
}) => {
  const [xAxisValue, setXAxisValue] = useState<string>(xAxisLabel || "")
  const [yAxisValue, setYAxisValue] = useState<string>(yAxisLabel || "")
  const [y2AxisValue, setY2AxisValue] = useState<string>(y2AxisLabel || "")
  const [containerHeight, setContainerHeight] = useState<number>(0)
  const [isXFocused, setIsXFocused] = useState<boolean>(false)
  const [isYFocused, setIsYFocused] = useState<boolean>(false)
  const [isY2Focused, setIsY2Focused] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const xAxisDisplayRef = useRef<HTMLDivElement | null>(null)
  const y2AxisDisplayRef = useRef<HTMLDivElement | null>(null)
  const yAxisDisplayRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setXAxisValue(xAxisLabel || "")
  }, [xAxisLabel])

  useEffect(() => {
    setYAxisValue(yAxisLabel || "")

    if (containerRef.current) {
      setContainerHeight(
        containerRef.current.getBoundingClientRect().height - 55
      )
    }
  }, [layout, yAxisLabel])

  useEffect(() => {
    setY2AxisValue(y2AxisLabel || "")

    if (containerRef.current) {
      setContainerHeight(
        containerRef.current.getBoundingClientRect().height - 55
      )
    }
  }, [layout, y2AxisLabel])

  useEffect(() => {
    // Sigh. When in doubt...
    //
    // The height of the chart changes when switching between chart editor and
    // dashboard, but containerRef doesn't seem to have the correct value until
    // the rest of the dashboard is done rendering
    setTimeout(() => {
      if (containerRef.current) {
        setContainerHeight(
          containerRef.current.getBoundingClientRect().height - 55
        )
      }
    }, 0)
  }, [isEdit])

  const dashboardElement = document.getElementById("dashboard-container")

  return (
    <div
      className={cx("chart-axis-overlay", {
        "has-continuous-legend": hasContinuousLegend
      })}
      ref={containerRef}
    >
      {yAxisLabel && (
        <div className={cx("y-axis", { "is-focused": isYFocused })}>
          <ParameterSelectorInput
            onSelectParameter={updateYAxisLabel}
            portalProps={{
              layout,
              popoverOrientation: PopoverOrientation.RIGHT,
              scrollingElements: [dashboardElement]
            }}
            inputProps={{
              value: yAxisValue,
              className: "axis-input",
              "data-testid": "chart-axis-overlay-y-input",
              "data-ui-config-id": "axis-title",
              onBlur: () => {
                markDashboardUnsaved()
                updateYAxisLabel(yAxisValue)
                setIsYFocused(false)
              },
              onFocus: () => setIsYFocused(true),
              onClick: (e) => e.currentTarget.focus(),
              onChange: (e) => setYAxisValue(e.currentTarget.value)
            }}
          />
          <span
            className="axis-display"
            data-ui-config-id="axis-title"
            ref={yAxisDisplayRef}
            style={{ maxWidth: containerHeight }}
          >
            {processParameters(yAxisValue, {
              chartId,
              token: "chartAxisY",
              useDisplayName: true,
              trackUsage: true
            })}
          </span>
        </div>
      )}

      {y2AxisLabel && (
        <div className={cx("y2-axis", { "is-focused": isY2Focused })}>
          <ParameterSelectorInput
            onSelectParameter={updateY2AxisLabel}
            portalProps={{
              layout,
              popoverOrientation: PopoverOrientation.RIGHT,
              scrollingElements: [dashboardElement]
            }}
            inputProps={{
              value: y2AxisValue,
              className: "axis-input",
              "data-testid": "chart-axis-overlay-y-input",
              "data-ui-config-id": "axis-title",
              onBlur: () => {
                markDashboardUnsaved()
                updateY2AxisLabel(y2AxisValue)
                setIsY2Focused(false)
              },
              onFocus: () => setIsY2Focused(true),
              onClick: (e) => e.currentTarget.focus(),
              onChange: (e) => setY2AxisValue(e.currentTarget.value)
            }}
          />
          <span
            className="axis-display"
            data-ui-config-id="axis-title"
            ref={y2AxisDisplayRef}
            style={{ maxWidth: containerHeight }}
          >
            {processParameters(y2AxisValue, {
              chartId,
              token: "chartAxisY2"
            })}
          </span>
        </div>
      )}

      <div className={cx("x-axis", { "is-focused": isXFocused })}>
        <ParameterSelectorInput
          onSelectParameter={updateXAxisLabel}
          portalProps={{
            layout,
            scrollingElements: [dashboardElement]
          }}
          inputProps={{
            value: xAxisValue,
            className: "axis-input",
            "data-testid": "chart-axis-overlay-x-input",
            "data-ui-config-id": "axis-title",
            onBlur: () => {
              markDashboardUnsaved()
              updateXAxisLabel(xAxisValue)
              setIsXFocused(false)
            },
            onFocus: () => setIsXFocused(true),
            onClick: (e) => e.currentTarget.focus(),
            onChange: (e) => setXAxisValue(e.currentTarget.value)
          }}
        />
        <span
          className="axis-display"
          data-ui-config-id="axis-title"
          ref={xAxisDisplayRef}
        >
          {processParameters(xAxisValue, {
            chartId,
            token: "chartAxisX",
            useDisplayName: true,
            trackUsage: true
          })}
        </span>
      </div>
    </div>
  )
}

const mapStateToProps = ({ dashboard: { layout }, router }) => ({
  layout,
  isEdit: onEditPath(router.location.pathname)
})

const mapDispatchToProps = (dispatch) => ({
  markDashboardUnsaved: () => dispatch(updateDashboardSaveState())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(MapDCChartAxisOverlay))
