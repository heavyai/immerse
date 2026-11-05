// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import moment from "moment"
import { DateTimeField } from "@immerse/ui"
import { TextField } from "widgets/text-field/TextField"
import PropTypes from "prop-types"

export default class FilterTimeModalInput extends Component {
  static propTypes = {
    inputValue: PropTypes.string,
    calendarValue: PropTypes.instanceOf(moment),
    updateInput: PropTypes.func,
    updateCalendarAndInput: PropTypes.func,
    field: PropTypes.string
  }

  onCalendarChange = (value) => {
    const time = this.props.localTime
      ? moment(value).local()
      : moment.utc(value)
    const newValues = {
      calendar: value,
      input: time.format(this.props.momentFormat)
    }

    this.props.updateCalendarAndInput(this.props.field, newValues)
  }

  // cannot parse with moment onchange; will throw invalid date mid-edit
  onInputChange = (e) => {
    this.props.updateInput(this.props.field, e.target.value)
  }

  onInputBlur = (e) => {
    // Handle date strings in the format the calendar populates the input with
    let dateFormat = this.props.momentFormat

    // Also accept standard date format
    if (moment(e.target.value, moment.ISO_8601, true).isValid()) {
      dateFormat = moment.ISO_8601
    }

    const momentObj = this.props.localTime
      ? moment(e.target.value, dateFormat).local()
      : moment.utc(e.target.value, dateFormat)

    const newValues = {
      calendar: momentObj,
      input: momentObj.format(this.props.momentFormat).toString()
    }

    this.props.updateCalendarAndInput(this.props.field, newValues)
  }

  onKeyUp = (e) => {
    if (e.key === "Enter") {
      e.target.blur()
    }
  }

  render() {
    const time = this.props.localTime
      ? moment(this.props.calendarValue).local()
      : moment.utc(this.props.calendarValue)
    return (
      <div className="time-picker-container">
        <DateTimeField
          includeTime={!this.props.hideTimePicker}
          value={
            time.isValid()
              ? time.format(
                  this.props.hideTimePicker
                    ? "YYYY-MM-DD"
                    : "YYYY-MM-DDTHH:mm:ss.SSS"
                )
              : ""
          }
          onChange={(value) =>
            this.onCalendarChange(
              this.props.localTime ? moment(value) : moment.utc(value)
            )
          }
        />
        <TextField
          label={"Date"}
          value={this.props.inputValue}
          onBlur={(e) => {
            this.onInputBlur(e)
          }}
          onChange={this.onInputChange}
          onKeyUp={this.onKeyUp}
          style={{ width: "100%" }}
          data-testid={`time-filter-input-${this.props.field}`}
        />
      </div>
    )
  }
}
