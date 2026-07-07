// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { chartTypeShape } from "constants/prop-types"
import MeasureSelectorsPopoverParent from "components/measure-selectors-popover/measure-selectors-popover-parent"
import SelectorContainer from "components/selector-container/selector-container"
import OperatorSelector from "./operator-selector"
import { updatePostFilter } from "../../charts/raster-chart/raster-chart-actions"
import { mergeR } from "utils/ramda-helpers"
import { connect } from "react-redux"

PostFilterSelectorsContainer.propTypes = {
  addCustomPostFilter: PropTypes.func.isRequired,
  addSelector: PropTypes.func.isRequired,
  chartId: PropTypes.string.isRequired,
  chartType: chartTypeShape,
  clearSelector: PropTypes.func.isRequired,
  hasActiveDimensions: PropTypes.bool,
  postFilters: PropTypes.arrayOf(PropTypes.object).isRequired,
  removeSelector: PropTypes.func.isRequired,
  operatorValueChange: PropTypes.func.isRequired,
  operatorMenuHandler: PropTypes.func.isRequired,
  operatorMinMaxChange: PropTypes.func.isRequired,
  operatorValueSubmit: PropTypes.func.isRequired
}

const OPENING = true
const CLOSING = false

export function PostFilterSelectorsContainer(props) {
  const operatorMenuHandler = (index, isOpening) => () => {
    props.operatorMenuHandler(index, isOpening)
  }

  const operatorValueChange = (index) => (operator) => {
    props.operatorValueChange(index, operator)
  }

  const operatorValueSubmit = (index) => (minOrMax, val) => {
    const value =
      typeof parseFloat(val) === "number" && !isNaN(val) && val !== ""
        ? parseFloat(val)
        : "" // only allow number
    props.operatorMinMaxChange(index, minOrMax, value)
  }

  return (
    <div className="post-filter-container chart-editor-section">
      {props.postFilters.map((postFilter, index) => (
        <div className="post-filter-wrapper" key={index}>
          <SelectorContainer
            addCustomPostFilter={props.addCustomPostFilter}
            addSelector={props.addSelector}
            chartId={props.chartId}
            chartType={props.chartType}
            clearSelector={props.clearSelector}
            dataSource={props.dataSource}
            hasActiveDimensions={props.hasActiveDimensions}
            index={index}
            loading={postFilter.loading}
            multiSourceIndex={props.multiSourceIndex}
            createNewCustomSQL={props.createNewCustomSQL}
            Popover={MeasureSelectorsPopoverParent}
            removeSelector={props.removeSelector}
            selector={postFilter}
            type="postFilter"
            editParameterizedCustomSql={props.editParameterizedCustomSql}
          />
          {postFilter.value !== undefined && (
            <div className={"measure-settings"}>
              <OperatorSelector
                min={postFilter.min}
                max={postFilter.max}
                operator={postFilter.operator}
                menuIsOpen={postFilter.isOpen}
                onMenuOpen={operatorMenuHandler(index, OPENING)}
                onMenuClose={operatorMenuHandler(index, CLOSING)}
                onMenuSelect={operatorValueChange(index)}
                onBlur={operatorValueSubmit(index)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function mapStateToProps(state, props) {
  return {
    chart: state.charts[props.chartId],
    id: props.chartId
  }
}

function mapDispatchToProps(dispatch, props) {
  const chartId = props.chartId
  return {
    operatorMenuHandler(index, val) {
      dispatch(
        updatePostFilter({
          chartId,
          index,
          setter: mergeR({
            loading: false,
            isOpen: val
          })
        })
      )
    },
    operatorValueChange(index, val) {
      dispatch(
        updatePostFilter({
          chartId,
          index,
          setter: mergeR({
            loading: false,
            operator: val,
            isOpen: false
          })
        })
      )
    },
    operatorMinMaxChange(index, minOrMax, val) {
      dispatch(
        updatePostFilter({
          chartId,
          index,
          setter: mergeR({
            loading: false,
            [minOrMax]: val
          })
        })
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostFilterSelectorsContainer)
