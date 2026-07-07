// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import moment from "moment"
import { PrimaryButton } from "widgets/button/Button"
import cx from "classnames"
import FilterTimeModalInput from "./filter-time-modal-input"
import "./filter-time-modal.scss"

const valueToMoment = (value, localTime = false) => {
  return localTime ? moment(value).local() : moment.utc(value)
}

export const END_BEFORE_START_ERROR = "End date is prior to start date"
export default class FilterTimeModal extends PureComponent {
  static propTypes = {
    selectedOptionArgs: PropTypes.arrayOf(PropTypes.string),
    start: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    end: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    submitTimeFilter: PropTypes.func,
    onCancel: PropTypes.func,
    momentFormat: PropTypes.string,
    modal: PropTypes.bool,
    localTime: PropTypes.bool,
    hideTimePicker: PropTypes.bool
  }

  constructor(props) {
    super(props)

    // moment will throw a warning if we pass the calendar a custom formatted object;
    // only use formatted moment object for input field
    if (props.selectedOptionArgs.length === 2) {
      this.state = {
        startCalendar: valueToMoment(props.start, props.localTime),
        startInput: valueToMoment(props.start, props.localTime).format(
          props.momentFormat
        ),
        endCalendar: valueToMoment(props.end, props.localTime),
        endInput: valueToMoment(props.end, props.localTime).format(
          props.momentFormat
        )
      }
    } else if (props.selectedOptionArgs.length === 1) {
      this.state = {
        valueCalendar: valueToMoment(props.value, props.localTime),
        valueInput: valueToMoment(props.value, props.localTime).format(
          props.momentFormat
        )
      }
    }
  }

  // cannot parse with moment on change; moment will return "invalid date" mid-edit
  // only convert to a moment object and sync calendar on blur
  updateInput = (field, value) => {
    const inputUpdateField = `${field}Input`
    this.setState({
      [inputUpdateField]: value
    })
  }

  updateCalendarAndInput = (field, values) => {
    const calendarUpdateField = `${field}Calendar`
    const inputUpdateField = `${field}Input`

    this.setState({
      [calendarUpdateField]: values.calendar,
      [inputUpdateField]: values.input
    })
  }

  submitTimeFilter = () => {
    const { startCalendar, endCalendar, valueCalendar } = this.state
    let updatedValues = {}

    if (this.props.selectedOptionArgs.length === 1) {
      updatedValues = {
        value: valueCalendar.toDate()
      }
    } else if (this.props.selectedOptionArgs.length === 2) {
      updatedValues = {
        start: startCalendar.toDate(),
        end: endCalendar.toDate()
      }
    }

    this.props.submitTimeFilter(updatedValues)
  }

  allFieldsValid = () => {
    const { startCalendar, endCalendar, valueCalendar } = this.state

    if (this.props.selectedOptionArgs.length === 1) {
      return valueCalendar.isValid()
    } else if (this.props.selectedOptionArgs.length === 2) {
      if (startCalendar.isValid() && endCalendar.isValid()) {
        const isValidRange =
          startCalendar.isBefore(endCalendar) ||
          startCalendar.isSame(endCalendar)
        this.setState({ error: isValidRange ? "" : END_BEFORE_START_ERROR })

        return isValidRange
      }
    }

    return false
  }

  onClickOutside = (e) => {
    e.preventDefault()
    if (e.target === e.currentTarget) {
      this.props.onCancel()
    }
  }

  render() {
    return (
      <div
        className={cx("filter-time-modal", { overlay: this.props.overlay })}
        onClick={this.onClickOutside}
      >
        <div className="filter-time-modal-centered">
          <div className="filter-time-modal-top">
            {this.props.selectedOptionArgs.map((field, i) => (
              <FilterTimeModalInput
                key={`date-input-${i}`}
                field={field}
                updateInput={this.updateInput}
                updateCalendarAndInput={this.updateCalendarAndInput}
                inputValue={this.state[`${field}Input`]}
                calendarValue={this.state[`${field}Calendar`]}
                momentFormat={this.props.momentFormat}
                localTime={this.props.localTime}
                hideTimePicker={this.props.hideTimePicker}
              />
            ))}
          </div>
          <div className="filter-time-modal-bottom">
            <div
              className="filter-time-modal-error"
              data-testid="filter-time-modal-error"
            >
              {this.state.error}
            </div>
            <div
              className="cancel"
              onClick={this.props.onCancel}
              data-testid={"time-filter-input-cancel"}
            >
              Cancel
            </div>
            <div className="filter-time-modal-apply">
              <PrimaryButton
                onClick={this.submitTimeFilter}
                disabled={!this.allFieldsValid()}
                data-testid={"time-filter-input-apply"}
              >
                Done
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
