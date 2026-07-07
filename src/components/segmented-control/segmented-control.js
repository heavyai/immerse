// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import Icon from "components/icon/icon"

export default class SegmentedControl extends Component {
  static propTypes = {
    hasIcons: PropTypes.bool,
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
        default: PropTypes.bool
      })
    ).isRequired,
    setValue: PropTypes.func.isRequired
  }

  setValue(val) {
    this.props.setValue(val)
  }

  render() {
    const { options } = this.props

    const createSetter = (val) => () => this.setValue(val)

    return (
      <div className="segmented-control" id={this.props.id}>
        {options.map((option) => (
          <button
            className={`button segmented-button ${
              option.default ? "active" : ""
            }`}
            id={`${this.props.id}-${option.label}`}
            key={option.value}
            type="button"
            onClick={createSetter(option.value)}
            data-testid={option.testid}
          >
            {this.props.hasIcons && <Icon name={option.value} />}
            {option.label}
          </button>
        ))}
      </div>
    )
  }
}
