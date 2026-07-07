// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

export default class CustomSelectorItem extends Component {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    id: PropTypes.string,
    index: PropTypes.number.isRequired,
    item: PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.object
      ]).isRequired
    }),
    on: PropTypes.bool.isRequired,
    onOptionClick: PropTypes.func.isRequired,
    onOptionHover: PropTypes.func.isRequired,
    renderOption: PropTypes.func,
    disabled: PropTypes.bool
  }

  onMouseEnter = () => {
    this.props.onOptionHover(this.props.index, this.props.item)
  }

  onOptionClick = () => {
    this.props.onOptionClick(this.props.item.value, this.props.item)
  }

  render() {
    const processedItemLabel = process(this.props.item.label, {
      useDisplayName: true
    })
    return (
      <div
        className={cx("custom-selector-item", {
          active: this.props.active,
          on: this.props.on,
          disabled: this.props.disabled
        })}
        id={`${this.props.id}-${this.props.index}`}
        data-testid={`${this.props.id}-${this.props.index}`}
        onClick={this.onOptionClick}
        onMouseEnter={this.onMouseEnter}
        value={
          typeof this.props.item.value === "object" ? "" : this.props.item.value
        }
      >
        {this.props.renderOption
          ? this.props.renderOption({
              ...this.props.item,
              label: processedItemLabel
            })
          : processedItemLabel}
      </div>
    )
  }
}
