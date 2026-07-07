// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import cx from "classnames"

import { LegacyChartingDataSelectionPanel } from "components/chart-editor/legacy-charting-data-selection-panel"
import Icon from "components/icon/icon"
import { typeAliases } from "components/chart-type-button/chart-type-button-type-aliases"
import { updateChartType } from "actions/update-chart-type-action-creators"

import "./styles.css"

const SUBTYPES = ["pointmap", "linemap", "choropleth"]

const getTypeAlias = (type: string) => typeAliases[type] ?? type

const DeckGLDataSelectionPanel = ({ id, chart, ...props }: any) => {
  const dispatch = useDispatch()

  // chart type will be "deckgl" or one of "deckgl-subtype" - in the former
  // case, the substr() will return an empty str and the || will return
  // pointmap
  const selectedSubType = chart.type.substr(7) || "pointmap"
  return (
    <>
      {
        <div className="subtype-btns">
          {SUBTYPES.map((subtype) => (
            <div
              key={subtype}
              className={cx("chart-type-btn", "button", "chart-btn-enabled", {
                "chart-btn-selected": subtype === selectedSubType
              })}
              onClick={() => dispatch(updateChartType(id, `deckgl-${subtype}`))}
            >
              <Icon name={`chart-${subtype}`} />
              <div className="chart-type-label">{getTypeAlias(subtype)}</div>
            </div>
          ))}
        </div>
      }
      <LegacyChartingDataSelectionPanel id={id} chart={chart} {...props} />
    </>
  )
}

export default DeckGLDataSelectionPanel
