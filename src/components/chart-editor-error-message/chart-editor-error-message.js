// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { concat, dropLast } from "ramda"
import React from "react"
import {
  selectorPillNotHover,
  setSelectorPillHoverFromIndex
} from "actions/ui-action-creators"
import { CHARTS, isVegaChart } from "constants/charts"
import { useDispatch } from "react-redux"
import Icon from "components/icon/icon"
import ChartErrors from "components/chart-errors/chart-errors"
import { MEASURE_NAME_ALIASES } from "constants/data-aliases"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { chartLabelsIcons } from "./chart-editor-error-message-icons"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"

function requiredDataType(chartType, selectorType, index) {
  return CHARTS[chartType][selectorType][index]
    ? CHARTS[chartType][selectorType][index].typeName
    : ""
}

function errorMessage(chartType, requiredItem, isMultiSourceEnabled) {
  let alias = ""

  if (requiredItem.name && chartType !== "table") {
    alias =
      requiredItem.type === "dimensions"
        ? requiredItem.name
        : MEASURE_NAME_ALIASES[chartType][requiredItem.name]
  }

  if (requiredItem.status === "error") {
    const typeName = requiredDataType(
      chartType,
      requiredItem.type,
      requiredItem.index
    )
    alias = typeName ? `${alias} ${typeName}` : `Invalid ${alias}`
  }

  const message = `${alias} ${dropLast(1, requiredItem.type)}`

  return isMultiSourceEnabled
    ? `${message} (Source ${requiredItem.multiSourceIndex + 1})`
    : message
}

function createMessage(type, name = "", index, multiSourceIndex = null) {
  return (status) => [{ type, index, status, name, multiSourceIndex }]
}

function maybeMaptoPrompt(selectorType) {
  return (accum, selector, index) => {
    const withStatus = createMessage(
      selectorType,
      selector.name,
      index,
      selector.multiSourceIndex
    )

    if (selector.isRequired) {
      return concat(accum, withStatus("missing"))
    } else if (selector.isError) {
      return concat(accum, withStatus("error"))
    } else {
      return accum
    }
  }
}

const ChartEditorErrorMessage = ({ chart, isMultiSourceEnabled, id }) => {
  const dispatch = useDispatch()
  const { dimensions, measures } = chart
  const selectorFilter = (selector) => !selector.value || selector.isError
  const errorPrompt = concat(
    dimensions
      .filter(selectorFilter)
      .reduce(maybeMaptoPrompt("dimensions"), []),
    measures.filter(selectorFilter).reduce(maybeMaptoPrompt("measures"), [])
  )

  const handleMouseLeave = () => {
    if (!isMultiSourceEnabled) {
      dispatch(selectorPillNotHover())
    }
  }

  const handleMouseOver = (prompt) => {
    if (!isMultiSourceEnabled && !isCrossSectionType(chart.type)) {
      dispatch(setSelectorPillHoverFromIndex(id, prompt.type, prompt.index))
    }
  }

  const iconObj = chartLabelsIcons[chart.type]

  const isVega = isVegaChart(chart.type)
  const errorStateMessage = `${iconObj.label}${isVega ? "" : " Requirements"}`
  return (
    <div
      className="chart-editor-error-wrap"
      data-testid="chart-editor-error-wrap"
    >
      <div className="error-box-wrap">
        <div className="error-box">
          <div className={`error-icon ${chart.type}`}>
            <Icon key={iconObj.icon} name={`${iconObj.icon}`} />
          </div>
          <div className="error-msg">
            <span>{errorStateMessage}</span>
            <ul>
              {chart.type === "table" && <li>1 dimension or 1 measure</li>}
              {!isVega &&
                errorPrompt.map((prompt, index) => (
                  <li
                    className={prompt.status}
                    data-testid={`prompt-status-${prompt.status}`}
                    key={index}
                    onMouseLeave={handleMouseLeave}
                    onMouseOver={() => handleMouseOver(prompt)}
                  >
                    <span>
                      {errorMessage(chart.type, prompt, isMultiSourceEnabled)}
                    </span>
                  </li>
                ))}
            </ul>
            {chart.dataError &&
              !isVega &&
              getFeatureFlag(available_feature_flags.CHART_LEVEL_ERRORS) && (
                <ChartErrors errorMessage={chart.dataError} />
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartEditorErrorMessage
