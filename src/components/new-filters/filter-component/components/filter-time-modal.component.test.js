// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import {
  render,
  getByTestId,
  queryByTestId,
  getByText,
  fireEvent
} from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { noop } from "utils/helpers"
import FilterTimeModal, { END_BEFORE_START_ERROR } from "./filter-time-modal"

const mockProps = {
  selectedOptionArgs: ["start", "end"],
  submitTimeFilter: noop,
  onCancel: noop,
  resetStartEndValues: false,
  start: "2019-12-12T00:16:46.619Z",
  end: "2019-12-12T00:16:46.619Z",
  value: "2019-12-12T00:16:46.619Z",
  momentFormat: "MMM DD YYYY HH:mm:ss:SSS"
}

const setup = (propOverrides) => {
  const { container } = render(
    <FilterTimeModal {...mockProps} {...propOverrides} />
  )
  return container
}

const enterValueAndClickApply = (container, value, inputName = "start") => {
  const input = getByTestId(container, `time-filter-input-${inputName}`)
  fireEvent.change(input, { target: { value } })
  fireEvent.blur(input)
  getByText(container, "Done").click()
}

describe("Time filter modal", () => {
  it("should call submitTimeFilter when an ISO date string is applied", () => {
    const submitTimeFilter = jest.fn()
    const container = setup({ submitTimeFilter, selectedOptionArgs: ["value"] })
    enterValueAndClickApply(container, "2019-12-12T00:16:46.679Z", "value")
    expect(submitTimeFilter).toHaveBeenCalled()
  })
  it("should call submitTimeFilter when a formatted date string is applied", () => {
    const submitTimeFilter = jest.fn()
    const container = setup({ submitTimeFilter, selectedOptionArgs: ["value"] })
    enterValueAndClickApply(container, "Jan 24 2020 12:00:00:000", "value")
    expect(submitTimeFilter).toHaveBeenCalled()
  })
  it("should not call submitTimeFilter when a non-date string is applied", () => {
    const submitTimeFilter = jest.fn()
    const container = setup({ submitTimeFilter })
    enterValueAndClickApply(container, "not a date", "end")
    expect(submitTimeFilter).not.toHaveBeenCalled()
  })
  it("should not call submitTimeFilter when the end date is before the start date", () => {
    const submitTimeFilter = jest.fn()
    const container = setup({ submitTimeFilter })
    enterValueAndClickApply(container, "2019-11-12T00:16:46.619Z", "end")
    expect(submitTimeFilter).not.toHaveBeenCalled()
  })
  it("should display error messaging when the end date is before the start date", () => {
    const submitTimeFilter = jest.fn()
    const container = setup({ submitTimeFilter })
    enterValueAndClickApply(container, "2019-11-12T00:16:46.619Z", "end")
    expect(getByText(container, END_BEFORE_START_ERROR)).toBeTruthy()
  })
  it("should clear error state once a valid date is applied", () => {
    const submitTimeFilter = jest.fn()
    const container = setup({ submitTimeFilter })
    enterValueAndClickApply(container, "2019-11-12T00:16:46.619Z", "end")
    enterValueAndClickApply(container, "2019-12-13T00:16:46.619Z", "end")
    expect(
      queryByTestId(container, "filter-time-modal-error").value
    ).toBeFalsy()
    expect(submitTimeFilter).toHaveBeenCalled()
  })
})
