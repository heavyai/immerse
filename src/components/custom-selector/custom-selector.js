// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  DOWN_ARROW_KEY_NUM,
  ENTER_KEY_NUM,
  UP_ARROW_KEY_NUM
} from "constants/magic-variables"
import React, { Component } from "react"
import PropTypes from "prop-types"
import CustomSelectorItem from "./custom-selector-item"
import cx from "classnames"
import filter from "ramda/src/filter"
import Icon from "components/icon/icon"
import length from "ramda/src/length"
import Popover from "components/popover/popover"
import { isPlainObject, isEqual } from "lodash"
import { Tooltip } from "@rmwc/tooltip"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

export default class CustomSelector extends Component {
  static propTypes = {
    bottom: PropTypes.bool,
    className: PropTypes.string,
    currentValue: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.object
    ]),
    hideOnMouseLeave: PropTypes.bool,
    id: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onOptionHover: PropTypes.func,
    onOptionOut: PropTypes.func,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        value: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.string,
          PropTypes.object
        ]).isRequired,
        inactive: PropTypes.bool,
        disabled: PropTypes.bool
      })
    ).isRequired,
    renderOption: PropTypes.func,
    hasOrientation: PropTypes.bool,
    disabled: PropTypes.bool,
    disabledTooltipText: PropTypes.string
  }

  state = {
    showOptions: false,
    mouseOver: false,
    hoverIndex: 0
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
  }

  showOptions = () => {
    if (!this.props.disabled) {
      this.setState({
        showOptions: true
      })
    }
  }

  hideOptions = () => {
    this.setState({
      showOptions: false
    })
  }

  onOptionHover = (index, item) => {
    if (this.props.onOptionHover) {
      this.props.onOptionHover(index, item)
    }
    this.setState({
      hoverIndex: index
    })
  }

  onOptionClick = (value, option) => {
    this.props.onChange(value, option)
    this.hideOptions()
  }

  mouseLeave = () => {
    if (this.props.onOptionOut) {
      this.props.onOptionOut()
    }

    if (this.props.hideOnMouseLeave) {
      this.hideOptions()
    }
    this.setState({
      mouseOver: false
    })
  }

  mouseEnter = () => {
    this.setState({
      mouseOver: true
    })
  }

  handleKeyDown = (e) => {
    if (this.state.mouseOver) {
      const optionsLength = this.props.options.length
      if (e.which === ENTER_KEY_NUM) {
        this.props.onChange(
          this.props.options[this.state.hoverIndex].value,
          this.props.options[this.state.hoverIndex]
        )
        this.hideOptions()
      } else if (e.which === DOWN_ARROW_KEY_NUM) {
        this.setState({
          hoverIndex:
            this.state.hoverIndex + 1 < optionsLength
              ? this.state.hoverIndex + 1
              : 0
        })
      } else if (e.which === UP_ARROW_KEY_NUM) {
        this.setState({
          hoverIndex:
            this.state.hoverIndex - 1 >= 0
              ? this.state.hoverIndex - 1
              : optionsLength - 1
        })
      }
    }
  }

  get currentOption() {
    const { options } = this.props
    const filterVal =
      this.props.currentValue &&
      typeof this.props.currentValue === "object" &&
      this.props.currentValue.col
        ? this.props.currentValue.col.name
        : this.props.currentValue
    const filterIsCurrent = filter(({ value }) =>
      isPlainObject(value) ? isEqual(value, filterVal) : value === filterVal
    )
    const currentOption = filterIsCurrent(options)

    return length(currentOption) > 0 ? currentOption[0] : options[0] || {}
  }

  get currentLabel() {
    const processedOptionLabel = this.currentOption.label
      ? process(this.currentOption.label, { useDisplayName: true })
      : ""
    if (this.props.renderOption) {
      return this.props.renderOption({
        ...this.currentOption,
        label: processedOptionLabel
      })
    } else {
      return processedOptionLabel
    }
  }

  render() {
    const getCustomSelectorItem = (item, index) => (
      <CustomSelectorItem
        active={
          typeof item.value !== "undefined" &&
          item.value === this.currentOption.value
        }
        id={this.props.id}
        index={index}
        item={item}
        key={index}
        on={index === this.state.hoverIndex}
        onOptionClick={this.onOptionClick}
        onOptionHover={this.onOptionHover}
        renderOption={this.props.renderOption}
        disabled={item.inactive || item.disabled}
      />
    )

    const getLabel = () => {
      return (
        <div
          className="custom-selector-display"
          id={this.props.id}
          data-testid={`${this.props.id}-trigger`}
          onClick={this.showOptions}
        >
          <div className="custom-selector-label">{this.currentLabel}</div>
          <div className="custom-selector-icon">
            <Icon className="selector-icon" name="tick" />
          </div>
        </div>
      )
    }

    return (
      <div
        className={cx(`custom-selector`, {
          "custom-selector--disabled": this.props.disabled,
          [this.props.className]: this.props.className
        })}
        onMouseEnter={this.mouseEnter}
        onMouseLeave={this.mouseLeave}
        data-testid={`${this.props.id}-selector`}
      >
        {this.props.disabled && this.props.disabledTooltipText ? (
          <Tooltip content={this.props.disabledTooltipText}>
            {getLabel()}
          </Tooltip>
        ) : (
          getLabel()
        )}
        {this.state.showOptions && (
          <Popover isOpened={this.state.showOptions} onClose={this.hideOptions}>
            <div
              className={cx("custom-selector-popup", {
                bottom: this.props.bottom
              })}
            >
              {this.props.options.map((item, index) =>
                item.inactive ? (
                  <Tooltip // tooltip for Pointmap chart's disabled Mark type when we have orientation measure selected
                    content={
                      "This mark shape is not available when an orientation measure is selected"
                    }
                    className={"mark-type-tooltip"}
                    key={index}
                    showArrow
                    align={"bottom"}
                  >
                    <div className={cx("custom-selector-item-wrapper")}>
                      {getCustomSelectorItem(item, index)}
                    </div>
                  </Tooltip>
                ) : (
                  getCustomSelectorItem(item, index)
                )
              )}
            </div>
          </Popover>
        )}
      </div>
    )
  }
}
