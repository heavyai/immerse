// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { chartShape } from "constants/prop-types"
import cx from "classnames"
import Icon from "components/icon/icon"
import { Tooltip } from "@rmwc/tooltip"
import { typeAliases } from "./chart-type-button-type-aliases"
import { CHART_DEFS } from "constants/chart-types"

export const getTypeAlias = (chartType) => typeAliases[chartType] ?? chartType

const ChartTypeButton = ({
  id,
  chart,
  updateChartType,
  reqMsg,
  index,
  chartType,
  iconId,
  className,
  isEnabled,
  disabled
}) => {
  const subTypes = CHART_DEFS[chart.type].subTypes ?? []
  return (
    <Tooltip
      content={reqMsg}
      className={"chart-type-tooltip"}
      key={index}
      showArrow
      align={"bottom"}
    >
      <div
        className={cx("chart-type-btn", "button", className, {
          "chart-btn-selected":
            chartType === chart.type || subTypes.includes(chartType),
          "chart-btn-enabled": isEnabled,
          "chart-btn-disabled": disabled
        })}
        data-testid={`chart-type-${chartType}`}
        id={`chart-type-${chartType}`}
        onClick={() =>
          chart.type === chartType ? false : updateChartType(id, chartType)
        }
        role="button"
      >
        <Icon name={iconId} />
        <div className="chart-type-label">{getTypeAlias(chartType)}</div>
      </div>
    </Tooltip>
  )
}

ChartTypeButton.propTypes = {
  chart: chartShape.isRequired,
  chartType: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  iconId: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  isEnabled: PropTypes.bool.isRequired,
  reqMsg: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.element
  ]).isRequired,
  updateChart: PropTypes.func.isRequired,
  updateChartType: PropTypes.func.isRequired
}

export default ChartTypeButton
