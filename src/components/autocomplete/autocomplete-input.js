// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import Icon from "components/icon/icon"

export default class AutocompleteInput extends Component {
  static propTypes = {
    inputOnBlur: PropTypes.func,
    inputOnChange: PropTypes.func,
    inputOnClear: PropTypes.func,
    inputOnClick: PropTypes.func,
    inputOnFocus: PropTypes.func,
    inputState: PropTypes.string,
    inputValue: PropTypes.string || PropTypes.bool,
    placeholder: PropTypes.string,
    resetInputState: PropTypes.func
  }

  componentDidMount() {
    this.setInputState()
  }

  componentDidUpdate() {
    this.setInputState()
  }

  setupInputRef = (node) => {
    this.inputRef = node
  }

  setInputState = () => {
    if (this.props.inputState) {
      this.inputRef[this.props.inputState]()
      this.props.resetInputState()
    }
  }

  render() {
    return (
      <div className="autocomplete-input">
        <input
          className="autocomplete-input-elm"
          onBlur={this.props.inputOnBlur}
          onChange={this.props.inputOnChange}
          onClick={this.props.inputOnClick}
          onFocus={this.props.inputOnFocus}
          placeholder={this.props.placeholder || "Enter value..."}
          ref={this.setupInputRef}
          value={this.props.inputValue || ""}
          data-testid="autocomplete-input"
        />
        {this.props.inputValue && (
          <button
            className="button icon-button clear-input"
            onClick={this.props.inputOnClear}
          >
            <Icon name="clear-text" />
          </button>
        )}
      </div>
    )
  }
}
