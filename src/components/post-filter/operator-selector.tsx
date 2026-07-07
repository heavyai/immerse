// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"

const operators = [
  {
    name: "less than or equals",
    label: "Less than or equal",
    args: ["max"]
  },
  {
    name: "greater than or equals",
    label: "Greater than or equal",
    args: ["min"]
  },
  {
    name: "between",
    label: "Between",
    args: ["min", "max"]
  },
  {
    name: "not between",
    label: "Not between",
    args: ["min", "max"]
  },
  {
    name: "equals",
    label: "Equals",
    args: ["min"]
  },
  {
    name: "not equals",
    label: "Not equals",
    args: ["min"]
  },
  {
    name: "null",
    label: "Is null",
    args: []
  },
  {
    name: "not null",
    label: "Not null",
    args: []
  }
]

/**
 * Operator Selector properties.
 */
interface IOperatorSelectorProps {
  /** Operator min value */
  min?: string
  /** Operator max value */
  max?: string
  /** Selected operator */
  operator?: string
  /** If menu should be open */
  menuIsOpen?: boolean
  /** When menu is clicked open */
  onMenuOpen?: any
  /** When menu is clicked close or values are being entered */
  onMenuClose?: any
  /** When a menu item is selected */
  onMenuSelect?: any
  /** When a min or max input is changed (on blur) */
  onBlur?: any
  /** When a min or max input is changed (on every keystroke) */
  onChange?: any
}

/**
 * Operator Selector
 */
export default class OperatorSelector extends PureComponent<
  IOperatorSelectorProps,
  {}
> {
  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOut)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOut)
  }

  handleClickOut = (e) => {
    const node = this.containerRef
    if (this.props.menuIsOpen && !(node && node.contains(e.target))) {
      this.props.onMenuClose()
    }
  }

  onBlur = (minOrMax) => (e) => {
    this.props.onBlur(minOrMax, e.target.value)
  }

  onKeyDown = (minOrMax) => (e) => {
    if (e.key === "Enter") {
      e.target.blur(minOrMax, e.target.value)
    }
    if (this.props.menuIsOpen) {
      this.props.onMenuClose()
    }
  }

  onMenuSelect = (operatorName) => () => {
    this.props.onMenuSelect(operatorName)
  }

  onMenuClick = () => {
    if (this.props.menuIsOpen) {
      this.props.onMenuClose()
    } else {
      this.props.onMenuOpen()
    }
  }

  render() {
    let selectedOperator = {}
    let hasMin = false
    let hasMax = false
    let label = ""
    if (this.props.operator) {
      selectedOperator = operators.find(
        (operator) => operator.name === this.props.operator
      )
      hasMin = selectedOperator.args.includes("min")
      hasMax = selectedOperator.args.includes("max")
      label = selectedOperator.label
    }
    return (
      <div
        data-testid="post-filter"
        className="operator-selector"
        id="post-filter"
        ref={(node) => {
          this.containerRef = node
        }}
      >
        <div className="operator" onClick={this.onMenuClick}>
          <div
            className={`operator-label ${label.length > 3 ? "long-label" : ""}`}
          >
            {label}
          </div>
          <div
            className={`arrow ${this.props.menuIsOpen ? "opened" : "closed"}`}
          />
        </div>
        {hasMin && (
          <div className="min-input">
            <input
              type="text"
              defaultValue={
                typeof this.props.min === "number" ? this.props.min : ""
              }
              key={this.props.min}
              onBlur={this.onBlur("min")}
              onKeyDown={this.onKeyDown("min")}
            />
          </div>
        )}
        {hasMin && hasMax && <div className="between-label">and</div>}
        {hasMax && (
          <div className="max-input">
            <input
              type="text"
              defaultValue={
                typeof this.props.max === "number" ? this.props.max : ""
              }
              key={this.props.max}
              onBlur={this.onBlur("max")}
              onKeyDown={this.onKeyDown("max")}
            />
          </div>
        )}
        {this.props.menuIsOpen && (
          <div className="operator-menu">
            {operators.map((operator, i) => (
              <div
                key={i}
                className={`operator-item ${
                  operator.name === selectedOperator.name ? "selected" : ""
                }`}
                onClick={this.onMenuSelect(operator.name)}
              >
                {operator.label}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
}
