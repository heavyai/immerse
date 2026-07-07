// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { connect, ConnectedProps } from "react-redux"
import cx from "classnames"
import { bindActionCreators, AnyAction } from "redux"
import { ThunkDispatch } from "redux-thunk"
import { AppState } from "vega/charts/types"

import { toggleLegendCollapsed } from "vega/actions/legend-action-creators"

import PinIcon from "components/svg-icons/icon-pin"
import LeftArrowIcon from "components/svg-icons/icon-left-arrow"

import "./styles.scss"
import TopNLayerLegend from "./TopNLayerLegend"
import MeasuresLayerLegend from "./MeasuresLayerLegend"
import {
  ComboSizeMeasureExpression,
  MeasureExpression
} from "vega/constants/data-selection-types"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { getDisplayOrParameterName } from "utils/get-display-or-parameter-name"

const { HIDE_VEGA_COMBO_CHART_LEGEND_HEADER } = available_feature_flags

type OwnProps = {
  chartId: string

  layersLegendData: ({
    type: "TOPN" | "MEASURE"
    legendCollapsed: boolean
    name: string
    layerId: string
    propertyName: string
    isColorMeasureSelected: boolean
    topNoptions: any[]
    allOthers: any[]
    measures: {
      size: ComboSizeMeasureExpression[]
      color: MeasureExpression | null
    }
  } & object)[]

  /** Reverse sort topN legend items */
  invertTopnOrder: boolean

  /** When the legend is pinned, the chart width shrinks to accomodate the
   * legend. If not pinned, the legend floats on top of the chart */
  pinned: boolean

  /** updates pinned prop of chart for legend */
  onPin: (pinned: boolean) => void

  style?: object
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>
) => ({
  actions: bindActionCreators({ toggleLegendCollapsed }, dispatch)
})

const hideLegendHeader = getFeatureFlag(HIDE_VEGA_COMBO_CHART_LEGEND_HEADER)

const connector = connect<
  ReturnType<() => {}>,
  ReturnType<typeof mapDispatchToProps>,
  OwnProps,
  AppState
>(null, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const LayersLegend: FC<Props> = ({
  chartId,
  layersLegendData,
  pinned,
  onPin,
  style = {},
  invertTopnOrder,
  actions
}) => {
  return (
    <div className={cx("layers-legend-container", { pinned })} style={style}>
      {layersLegendData.map((source, index) => {
        const legendPanelClassNames = cx("collapsible-layers-legend-panel", {
          expanded: !source.legendCollapsed,
          "not-pinned": !pinned
        })
        const pinnedSectionClassNames = cx(
          "legend-header-pin",
          pinned ? "pinned" : "not-pinned"
        )
        const onToggleLegendCollapsed = () =>
          actions.toggleLegendCollapsed(
            chartId,
            source.layerId,
            !source.legendCollapsed
          )

        const sourceLabel = getDisplayOrParameterName(source.name)
        return (
          <div className={legendPanelClassNames} key={source.name}>
            <div
              className={cx("legend-header", {
                hidden: hideLegendHeader
              })}
            >
              <div
                className="legend-header-title"
                data-ui-config-id="legend-discrete"
              >
                <div className="column-name" title={sourceLabel}>
                  {sourceLabel}
                </div>
              </div>
              {index === 0 && (
                <div
                  className={pinnedSectionClassNames}
                  onClick={() => onPin(pinned)}
                >
                  <PinIcon />
                </div>
              )}
              <div
                className="legend-header-collapse"
                onClick={onToggleLegendCollapsed}
              >
                <LeftArrowIcon
                  className={!source.legendCollapsed ? "open" : ""}
                />
              </div>
            </div>

            {!source.legendCollapsed && (
              <div className="collapsible-layers-legend-panel-children">
                {source.type === "TOPN" ? (
                  <TopNLayerLegend
                    chartId={chartId}
                    layerId={source.layerId}
                    invertOrder={invertTopnOrder}
                    propertyName={source.propertyName}
                    options={source.topNoptions}
                    allOthers={source.allOthers}
                    disabled={!source || !source.topNoptions}
                  />
                ) : (
                  <MeasuresLayerLegend
                    chartId={chartId}
                    dataUi="legend-discrete"
                    measures={source.measures}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default connector(LayersLegend)
