// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { chartTypeShape } from "constants/prop-types"
import MeasureSelectorsPopoverParent from "components/measure-selectors-popover/measure-selectors-popover-parent"
import SelectorContainer from "components/selector-container/selector-container"

MeasureSelectorsContainer.propTypes = {
  addCustomMeasure: PropTypes.func.isRequired,
  addSelector: PropTypes.func.isRequired,
  chartId: PropTypes.string.isRequired,
  chartType: chartTypeShape,
  clearSelector: PropTypes.func.isRequired,
  hasActiveDimensions: PropTypes.bool,
  measures: PropTypes.arrayOf(PropTypes.object).isRequired,
  multiSourceIndex: PropTypes.number,
  removeSelector: PropTypes.func.isRequired
}

export default function MeasureSelectorsContainer(props) {
  return (
    <div
      className="measures-container chart-editor-section"
      data-testid="measures-container"
    >
      {!props.measures.length && (
        <div
          className={
            props.chartType === "text"
              ? "available-without-select"
              : "not-available"
          }
        >
          None Required
        </div>
      )}
      {props.measures.map((measure, index) => {
        let selectorContainer = null

        if (
          typeof props.multiSourceIndex !== "number" ||
          measure.multiSourceIndex === props.multiSourceIndex
        ) {
          selectorContainer = (
            <SelectorContainer
              addCustomMeasure={props.addCustomMeasure}
              addCustomPostFilter={props.addCustomPostFilter}
              addSelector={props.addSelector}
              editParameterizedCustomSql={props.editParameterizedCustomSql}
              chartId={props.chartId}
              chartType={props.chartType}
              clearSelector={props.clearSelector}
              dataSource={props.dataSource}
              hasActiveDimensions={props.hasActiveDimensions}
              index={index}
              key={index}
              loading={measure.loading}
              multiSourceIndex={props.multiSourceIndex}
              createNewCustomSQL={props.createNewCustomSQL}
              Popover={MeasureSelectorsPopoverParent}
              removeSelector={props.removeSelector}
              selector={measure}
              type="measure"
            />
          )
        }

        return selectorContainer
      })}
    </div>
  )
}
