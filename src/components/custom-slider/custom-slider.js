// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { NEGATIVE_ONE, SLIDER_MAX, SLIDER_MIN } from "constants/magic-variables"
import React, { Component } from "react"
import PropTypes from "prop-types"
import Slider, { Range } from "rc-slider"
import { Tooltip } from "@rmwc/tooltip"

const START_INPUT_INDEX = 0
const END_INPUT_INDEX = 1

export default class CustomSlider extends Component {
  static propTypes = {
    defaultValue: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
    testid: PropTypes.string,
    max: PropTypes.number,
    min: PropTypes.number,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onValueChange: PropTypes.func,
    range: PropTypes.bool,
    values: PropTypes.arrayOf(PropTypes.number),
    // If you don't want input boxes to appear next to sliders, this should be
    // true
    fuzzyValues: PropTypes.bool,
    disabled: PropTypes.bool,
    disabledTooltipText: PropTypes.string,
    displayUnit: PropTypes.string
  }

  static defaultProps = {
    fuzzyValues: false
  }

  /* This took me a while to properly wrap my head around, so documenting for the next person.
    The basic issue there was that
     if the user changed the value to a bad value, for example by setting the min > the max, then
     the slider would display a malformed image.

     The fix was to separate out the values used for the slider component and those used for the
     text input components. But those are always the same values, you protest! And you're right,
     most of the time.

     But what it does now is as the user changes the values in the input fields, it stores those values
     internally (inputValues) but does *not* update the sliderValue until the user hits enter/blurs the
     input box. Then the values are sent to the onValueChange handler and the slider value is updated with
     the final value. Changing the slider itself will update the input boxes at the same time, since you can't
     slide to an invalid value the way you could type one.
  */

  state = {
    sliderValue: this.getDefaultValue(),
    inputValues: this.getDefaultValue(),
    value: this.getDefaultValue()
  }

  UNSAFE_componentWillReceiveProps({ defaultValue, values }) {
    const newValue = values || defaultValue
    if (newValue) {
      this.setState({
        sliderValue: newValue,
        inputValues: newValue,
        value: newValue
      })
    }
  }

  getDefaultValue() {
    const min = this.getMin()
    return this.props.defaultValue || (this.props.range ? [min, min] : min)
  }

  getMax() {
    return typeof this.props.max === "undefined" ? SLIDER_MAX : this.props.max
  }

  getMin() {
    return typeof this.props.min === "undefined" ? SLIDER_MIN : this.props.min
  }

  handleBlur = (e) => {
    const startOrEndInput =
      e.target.className === "start-input" ? START_INPUT_INDEX : END_INPUT_INDEX

    const value = this.parseInputValue(e.target.value, startOrEndInput)

    this.updateValue(value)

    if (this.props.onBlur) {
      this.props.onBlur()
    }
  }

  handleFocus = () => {
    if (this.props.onFocus) {
      this.props.onFocus()
    }
  }

  onSubmit = (e) => {
    e.preventDefault()
    const index =
      e.target.parentNode.className.indexOf("start") > NEGATIVE_ONE
        ? START_INPUT_INDEX
        : END_INPUT_INDEX
    const value = this.parseInputValue(e.target.childNodes[0].value, index)
    this.updateValue(value)
  }

  parseInputValue(value, index) {
    if (isNaN(Number(value))) {
      return this.state.value
    }

    const parsedVal = Math.max(
      Math.min(Number(value), this.getMax()),
      this.getMin()
    )

    if (!this.props.range) {
      return parsedVal
    }

    let newValue = this.state.value

    if (index === START_INPUT_INDEX) {
      newValue =
        parsedVal <= newValue[END_INPUT_INDEX]
          ? [parsedVal, newValue[END_INPUT_INDEX]]
          : [newValue[END_INPUT_INDEX], parsedVal]
    } else {
      newValue =
        parsedVal >= newValue[START_INPUT_INDEX]
          ? [newValue[START_INPUT_INDEX], parsedVal]
          : [parsedVal, newValue[START_INPUT_INDEX]]
    }
    return newValue
  }

  onInputChange = (e) => {
    const value = e.target.value
    const index =
      e.target.className === "start-input" ? START_INPUT_INDEX : END_INPUT_INDEX
    let inputValues = this.state.inputValues
    if (this.props.range) {
      if (index === START_INPUT_INDEX) {
        inputValues = [value, inputValues[END_INPUT_INDEX]]
      } else {
        inputValues = [inputValues[START_INPUT_INDEX], value]
      }
    } else {
      inputValues = value
    }

    this.setState({ inputValues })
  }

  onSliderChange = (value) => {
    this.setState({
      sliderValue: value,
      inputValues: value
    })
  }

  onSliderAfter = (value) => {
    if (!this.props.fuzzyValues) {
      if (this.props.range) {
        this.startInputRef.blur()
      }
      this.endInputRef.blur()
    }
    this.updateValue(value)
  }

  updateValue(value) {
    const {
      onValueChange = () => {
        /* do nothing */
      }
    } = this.props
    onValueChange(value)
    this.setState({ sliderValue: value, value, inputValues: value })
  }

  setupStartInputRef = (node) => {
    this.startInputRef = node
  }

  setupEndInputRef = (node) => {
    this.endInputRef = node
  }
  render() {
    const {
      testid,
      range,
      max,
      min,
      fuzzyValues,
      disabled = false,
      disabledTooltipText
    } = this.props
    const { sliderValue, inputValues } = this.state

    const getStartInput = () => {
      return (
        <input
          {...{
            id: `${testid}-min`,
            className: "start-input",
            onBlur: this.handleBlur,
            onChange: this.onInputChange,
            onFocus: this.handleFocus,
            placeholder: "Value",
            ref: this.setupStartInputRef,
            value: this.state.inputValues[START_INPUT_INDEX],
            disabled
          }}
        />
      )
    }

    const getEndInput = () => {
      return (
        <input
          {...{
            className: "end-input",
            "data-testid": `${testid}-input`,
            id: testid,
            onBlur: this.handleBlur,
            onChange: this.onInputChange,
            onFocus: this.handleFocus,
            placeholder: "Value",
            ref: this.setupEndInputRef,
            value: range ? inputValues[END_INPUT_INDEX] : inputValues,
            disabled
          }}
        />
      )
    }
    return (
      <>
        {fuzzyValues && (
          <div className="slider-fuzzy-values-label">
            <div> Small </div>
            <div> Large </div>
          </div>
        )}
        <div className="custom-slider" data-testid={testid}>
          {range && !fuzzyValues && (
            <div className="input-wrap start">
              <form onSubmit={this.onSubmit}>
                {disabled && disabledTooltipText ? (
                  <Tooltip content={disabledTooltipText}>
                    <div>{getStartInput()}</div>
                  </Tooltip>
                ) : (
                  getStartInput()
                )}
              </form>
            </div>
          )}
          <div className="slider-wrap">
            {range ? (
              <Range
                {...{
                  id: testid,
                  max,
                  min,
                  onAfterChange: this.onSliderAfter,
                  onChange: this.onSliderChange,
                  dataFoo: "foo",
                  value: sliderValue,
                  ...this.props
                }}
              />
            ) : (
              <Slider
                {...{
                  ...this.props,
                  id: testid,
                  max,
                  min,
                  onAfterChange: this.onSliderAfter,
                  onChange: this.onSliderChange,
                  value: sliderValue
                }}
              />
            )}
          </div>
          {!fuzzyValues && (
            <div className="input-wrap end">
              <form onSubmit={this.onSubmit}>
                {disabled && disabledTooltipText ? (
                  <Tooltip content={disabledTooltipText}>
                    <div>{getEndInput()}</div>
                  </Tooltip>
                ) : (
                  getEndInput()
                )}
              </form>
            </div>
          )}
        </div>
      </>
    )
  }
}
