// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useRef, useState } from "react"

import "./map-legend.scss"
import { DEFAULT_COLOR } from "../hooks/use-vega-chart"
import classNames from "classnames"
import { Icon } from "@rmwc/icon"
import { formatNumber } from "charts/utils/coordinate-helpers"
import { DEFAULT_POINT_SIZE } from "../constants"
import { SizeGradient } from "./size-gradient"

type BaseScale = {
  name: string
  type: LegendScaleType
  domain: number[] | string[]
  range: string[]
}
type QuantizeScale = BaseScale & {} // TODO: Add props when figured

export type LegendScale = QuantizeScale // TODO: Add | OtherScales when existing

// TODO: Look into replacing these with vega-lite types
export enum LegendScaleType {
  QUANTIZE = "QUANTIZE",
  NOMINAL = "NOMINAL",
  ORDINAL = "ORDINAL",
  LINEAR = "LINEAR",
  SIZE = "SIZE"
}

export type MapLegend = {
  scales: Array<LegendScale>
}

// This needs to be kept in sync with a constant in map-legend.scss if changed
const MAX_LEGEND_WIDTH = 300

const CollapsibleLegend = ({
  title,
  className,
  children
}: {
  title: string
  className?: string
  children: JSX.Element
}) => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className={classNames("collapsible-legend", className, { collapsed })}>
      <div
        className="collapsible-legend__title "
        onClick={() => setCollapsed(!collapsed)}
      >
        <Icon
          className={classNames("header-indicator", { collapsed })}
          icon={"expand_less"}
        />
        <span>{title}</span>
      </div>
      <div
        className={classNames("collapsible-container", {
          collapsed
        })}
      >
        <div
          className={classNames("collapsible collapsible-legend__content", {
            collapsed
          })}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

const CategoricalLegend = ({ scale }: { scale: LegendScale }) => {
  return (
    <div className="categorical-legend">
      {scale.domain.map((domainVal, idx) => {
        const color = scale.range[idx % scale.range.length]
        const trimmedVal = domainVal?.trim?.() ?? domainVal
        return (
          <div key={`${color}-${idx}`} className="categorical-row">
            <div
              className="categorical-color-block"
              style={{
                backgroundColor: color
              }}
            />
            <div className="categorical-label">
              {trimmedVal || "[No Value]"}
            </div>
          </div>
        )
      })}
      <div key="allOther" className="categorical-row">
        <div
          className="categorical-color-block"
          style={{
            backgroundColor: DEFAULT_COLOR
          }}
        />
        <div className="categorical-label">All Others</div>
      </div>
    </div>
  )
}

const QuantizeLegend = ({
  scale,
  width
}: {
  scale: LegendScale
  width: number
}) => {
  return (
    <div className="quantize-legend">
      <div className="quantize-labels">
        <div className="quantize-label">{formatNumber(scale.domain[0])}</div>
        <div className="quantize-label">{formatNumber(scale.domain[1])}</div>
      </div>
      <div className="quantize-colors">
        {scale.range.map((color) => {
          return (
            <div
              className="color-block"
              key={color}
              style={{
                backgroundColor: color,
                width: width / scale.range.length
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

const LinearLegend = ({ scale }: { scale: LegendScale }) => {
  return (
    <div className="continuous-legend">
      <div className="continuous-labels">
        <div className="continuous-label">{formatNumber(scale.domain[0])}</div>
        <div className="continuous-label">
          {formatNumber(scale.domain[scale.domain.length - 1])}
        </div>
      </div>
      <div
        className="continuous-colors"
        style={{
          background: `linear-gradient(90deg, ${scale.range.join(", ")})`
        }}
      />
    </div>
  )
}

const SizeLegend = ({ scale }: { scale: LegendScale }) => {
  const sizeEl = useRef()
  return (
    <div className="size-legend">
      <div className="size-row">
        <div className="size-label">{formatNumber(scale.domain[0])}</div>
        <div className="size-label">
          {formatNumber(scale.domain[scale.domain.length - 1])}
        </div>
      </div>
      <div className="size-row">
        <div ref={sizeEl} className="size-gradient">
          <SizeGradient
            height={30}
            width={sizeEl.current?.clientWidth}
            minRadius={scale.range[0] / 2}
            maxRadius={scale.range[1] / 2}
          />
        </div>
      </div>
      <div key="allOther" className="size-row align-left">
        <div className="size-label">All Others</div>
        <div
          className="size-indicator"
          style={{
            width: DEFAULT_POINT_SIZE,
            height: DEFAULT_POINT_SIZE
          }}
        />
      </div>
    </div>
  )
}

export const MapLegend = ({ scales }: MapLegend) => {
  const legendRef = useRef<HTMLDivElement | null>(null)
  const getLegendByType = (scale: LegendScale) => {
    const legendWidth = legendRef.current?.clientWidth ?? MAX_LEGEND_WIDTH
    switch (scale.type.toUpperCase()) {
      case LegendScaleType.QUANTIZE: {
        return <QuantizeLegend scale={scale} width={legendWidth} />
      }
      case LegendScaleType.ORDINAL:
      case LegendScaleType.NOMINAL:
        return <CategoricalLegend scale={scale} />
      case LegendScaleType.LINEAR:
        return <LinearLegend scale={scale} />
      case LegendScaleType.SIZE:
        return <SizeLegend scale={scale} />
      default:
        return <div>No Legend Available</div>
    }
  }
  const getLegendForScale = (scale: LegendScale) => {
    return (
      <div key={scale.type} ref={legendRef}>
        <section>{getLegendByType(scale)}</section>
      </div>
    )
  }
  return scales?.length ? (
    <div className="vega-map-legend">
      <CollapsibleLegend title={"Legend"}>
        <>{scales?.map(getLegendForScale)}</>
      </CollapsibleLegend>
    </div>
  ) : null
}
