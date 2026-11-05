// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import moment from "moment"
import { render, screen, fireEvent } from "@testing-library/react"
import FilterTimeModalInput from "./filter-time-modal-input"

it.each([false, true])(
  "preserves wall-clock values, milliseconds and UTC/local interpretation (local=%s)",
  (localTime) => {
    const update = jest.fn()
    render(
      <FilterTimeModalInput
        field="start"
        localTime={localTime}
        momentFormat="YYYY-MM-DD HH:mm:ss.SSS"
        inputValue=""
        calendarValue={moment.utc("2026-11-05T12:15:30.123Z")}
        updateInput={() => {}}
        updateCalendarAndInput={update}
      />
    )
    fireEvent.change(screen.getByLabelText("Choose date and time"), {
      target: { value: "2026-11-06T14:25:35.456" }
    })
    const [field, values] = update.mock.calls[0]
    expect(field).toBe("start")
    expect(values.input).toBe("2026-11-06 14:25:35.456")
    expect(values.calendar.isUTC()).toBe(!localTime)
    expect(values.calendar.millisecond()).toBe(456)
  }
)
