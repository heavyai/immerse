// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import CustomSelector from "components/custom-selector/custom-selector"
import cx from "classnames"
import Icon from "components/icon/icon"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

export default class ChartSettingsSortByDropdown extends Component {
  static propTypes = {
    currentOrderingValue: PropTypes.string.isRequired,
    currentSortValue: PropTypes.shape({
      col: PropTypes.shape({
        expression: PropTypes.string,
        agg_mode: PropTypes.string,
        name: PropTypes.string.isRequired
      }),
      index: PropTypes.number.isRequired,
      order: PropTypes.string.isRequired
    }).isRequired,
    error: PropTypes.bool.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        type: PropTypes.string,
        value: PropTypes.string.isRequired
      })
    ).isRequired,
    updateOrderingValue: PropTypes.func.isRequired,
    updateSortByValue: PropTypes.func.isRequired
  }

  renderOption = ({ label, type }) => (
    <div className="sort-by-container">
      <span className="sort-by-label">
        {process(label, { useDisplayName: true })}
      </span>
      {type && <span className="sort-type">{type}</span>}
    </div>
  )

  render() {
    return (
      <div className="chart-settings-row">
        <div className={cx({ error: this.props.error })}>
          <CustomSelector
            className="sort-by-dropdown"
            currentValue={this.props.currentSortValue}
            id="chart-settings-sort-by"
            onChange={this.props.updateSortByValue}
            options={this.props.options}
            renderOption={this.renderOption}
          />
        </div>
        <div
          className={`ordering-value ${this.props.currentOrderingValue}`}
          id="chart-settings-sort-by-direction"
          onClick={this.props.updateOrderingValue}
        >
          <Icon name="arrow3" viewBox="0 0 16 48" />
          <span>{this.props.currentOrderingValue}</span>
        </div>
      </div>
    )
  }
}
