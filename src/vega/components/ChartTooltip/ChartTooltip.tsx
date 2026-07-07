// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  FC,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { debounce } from "lodash"

import "./ChartTooltip.scss"
import { GetChartBodySizeAndPosition } from "vega/charts/types"
import VegaLink from "vega/components/Vega/VegaLink"
import { TooltipTable } from "vega/charts/box-plot-chart/types"
import { ComboTooltip } from "./ComboTooltip"
import { BoxPlotTooltip } from "./BoxPlotTooltip"

const GET_RECT_TIMEOUT = 1000

export type TooltipMeasure = {
  label: string
  color: string
  value: string | number
  rawValue: string | number
  order: number
  dataSelectionIndex: number
  dataSource: string
  colorMeasureAggregate: string | null
  colorMeasureValue?: string | number
}

export type TooltipData = {
  x?: number
  y?: number
  data: {
    dimension: string
    measures: TooltipMeasure[]
  }
}

export type BoxPlotTooltipData = {
  x?: number
  y?: number
  data: TooltipTable
}

type Props = {
  vegaContainerRef: RefObject<HTMLDivElement>
  getChartBodySizeAndPosition: GetChartBodySizeAndPosition
  notifier: VegaLink
  invertOrder?: boolean
  TooltipComponent: React.FC<ComboTooltip> | React.FC<BoxPlotTooltip>
}

// This is an arbitrary-ish amount to prevent the tooltip container from
// rendering right beneath the mousetip, which causes an insane strobe party.
const TOOLTIP_OFFSET = 5

const getWindowSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight
})

const ChartTooltip: FC<Props> = ({
  vegaContainerRef,
  getChartBodySizeAndPosition,
  notifier,
  invertOrder,
  TooltipComponent
}) => {
  const [tooltipData, setTooltipData] = useState<
    TooltipData | BoxPlotTooltipData | null
  >(null)
  const windowSize = useRef(getWindowSize())
  const tooltipRef = useRef<HTMLDivElement>(null)

  // watch for window resizes
  useEffect(() => {
    const handleWindowResize = () => {
      windowSize.current = getWindowSize()
    }

    window.addEventListener("resize", handleWindowResize)
    return () => window.removeEventListener("resize", handleWindowResize)
  }, [])

  // listen for tooltip signals
  useEffect(() => {
    notifier.setListener((_, evt) => setTooltipData(evt))

    return () => notifier.removeListener()
  }, [notifier])

  // calling this function is expensive and it's ok if we get a stale result,
  // so useMemo allows us to wrap it in a debounce
  const getChartRect = useMemo(
    () =>
      debounce(
        () =>
          vegaContainerRef.current &&
          getChartBodySizeAndPosition(vegaContainerRef.current),
        GET_RECT_TIMEOUT,
        {
          leading: true
        }
      ),
    [getChartBodySizeAndPosition, vegaContainerRef]
  )

  // calling this function is expensive and it's ok if we get a stale result,
  // so useMemo allows us to wrap it in a debounce
  const getOffsetRect = useMemo(
    () =>
      debounce(
        () =>
          tooltipRef.current &&
          tooltipRef.current.offsetParent &&
          tooltipRef.current.offsetParent.getBoundingClientRect(),
        GET_RECT_TIMEOUT,
        { leading: true }
      ),
    []
  )

  // calling this function is expensive and it's ok if we get a stale result,
  // so useMemo allows us to wrap it in a debounce
  const getTooltipRect = useMemo(
    () =>
      debounce(
        () => tooltipRef.current && tooltipRef.current.getBoundingClientRect(),
        GET_RECT_TIMEOUT,
        {
          leading: true
        }
      ),
    []
  )

  useEffect(() => {
    if (vegaContainerRef.current && tooltipData) {
      const vegaContainer = vegaContainerRef.current
      const moveHandler = (evt: MouseEvent) => {
        if (tooltipRef.current) {
          const chartRect = getChartRect()
          const offsetRect = getOffsetRect()
          const tooltipRect = getTooltipRect()

          let left = -3000
          let top = -3000

          if (chartRect) {
            left = tooltipData.x ? tooltipData.x + chartRect.left : evt.clientX
            top = tooltipData.y ? tooltipData.y + chartRect.top : evt.clientY
          }

          if (tooltipRect) {
            if (left + tooltipRect.width > windowSize.current.width) {
              left -= tooltipRect.width + TOOLTIP_OFFSET * 2
            }
            if (top + tooltipRect.height > windowSize.current.height) {
              top -= tooltipRect.height + TOOLTIP_OFFSET * 2
            }
          }

          if (offsetRect) {
            left += TOOLTIP_OFFSET - offsetRect.left
            top += TOOLTIP_OFFSET - offsetRect.top
          }

          tooltipRef.current.style.top = `${top}px`
          tooltipRef.current.style.left = `${left}px`
          tooltipRef.current.style.visibility = "visible"
        }
      }

      /**
       * Will hide tooltip when mouse enters elements that are overlaid within the
       * bounds of the chart (e.g. the non-tooltip legend and baseline menu). Tooltip
       * is removed entirely when mouse leaves chart bounds, handled in vega spec
       * ("tooltipKey" signal). Handling these cases outside of vega as vega does
       * not support mouseleave, and mouseout can make tooltip jump when mousing
       * over in-chart elements (range filter handles, maybe more).
       */
      const mouseleaveHandler = () => {
        if (tooltipRef.current) {
          tooltipRef.current.style.visibility = "hidden"
        }
      }

      vegaContainer.addEventListener("mousemove", moveHandler)
      vegaContainer.addEventListener("mouseleave", mouseleaveHandler)

      return () => {
        vegaContainer.removeEventListener("mousemove", moveHandler)
        getChartRect.cancel()
        getOffsetRect.cancel()
        getTooltipRect.cancel()
      }
    }
    return undefined
  }, [
    vegaContainerRef,
    getChartBodySizeAndPosition,
    tooltipData,
    getChartRect,
    getOffsetRect,
    getTooltipRect
  ])

  const data = tooltipData?.data

  if (data?.dimension) {
    return (
      <div
        className="chart-tooltip"
        data-ui-config-id="chart-tooltip"
        ref={tooltipRef}
      >
        <TooltipComponent
          data={data}
          {...(invertOrder !== undefined && { invertOrder })}
        />
      </div>
    )
  } else {
    return null
  }
}

export default ChartTooltip
