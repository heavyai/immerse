// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import DimensionSelectorsPopoverParent from "components/dimension-selectors-popover/dimension-selectors-popover-parent"
import { dimensionShape } from "constants/prop-types"
import SelectorContainer from "components/selector-container/selector-container"

export default class DimensionSelectorsContainer extends Component {
  static propTypes = {
    addCustomDimension: PropTypes.func.isRequired,
    addSelector: PropTypes.func.isRequired,
    chartId: PropTypes.string.isRequired,
    chartType: PropTypes.string.isRequired,
    clearSelector: PropTypes.func.isRequired,
    dataSource: PropTypes.string,
    dimensions: PropTypes.arrayOf(dimensionShape).isRequired,
    multiSourceIndex: PropTypes.number,
    removeSelector: PropTypes.func.isRequired
  }

  render() {
    return (
      <div className="dimensions-container chart-editor-section">
        {!this.props.dimensions.length && (
          <div
            className={
              this.props.chartType === "number"
                ? "available-without-select"
                : "not-available"
            }
          >
            {this.isNumberChart ? "All Rows" : "None Required"}
          </div>
        )}
        {this.props.dimensions.map((dimension, index) => {
          let selectorContainer = null

          if (
            typeof this.props.multiSourceIndex !== "number" ||
            dimension.multiSourceIndex === this.props.multiSourceIndex
          ) {
            selectorContainer = (
              <SelectorContainer
                addCustomDimension={this.props.addCustomDimension}
                editParameterizedCustomSql={
                  this.props.editParameterizedCustomSql
                }
                addSelector={this.props.addSelector}
                chartId={this.props.chartId}
                chartType={this.props.chartType}
                clearSelector={this.props.clearSelector}
                dataSource={this.props.dataSource}
                index={index}
                key={index}
                loading={dimension.loading}
                multiSourceIndex={this.props.multiSourceIndex}
                createNewCustomSQL={this.props.createNewCustomSQL}
                Popover={DimensionSelectorsPopoverParent}
                removeSelector={this.props.removeSelector}
                selector={dimension}
                type="dimension"
              />
            )
          }

          return selectorContainer
        })}
      </div>
    )
  }
}
