// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect, useCallback } from "react"
import moment from "moment"
import { TextField } from "widgets/text-field/TextField"

import FilterTimeModal from "components/new-filters/filter-component/components/filter-time-modal"
import Popover from "components/popover/popover"
import { DateValue } from "components/dashboards/dashboard-manager-filters/dashboard-manager-filter-types"

type Props = {
  label: string
  setFilterValue: (filterValue: { value: DateValue }) => void
  initialValue?: DateValue
  removeFilter: () => void
}

const FilterValueDatePicker: FC<Props> = ({
  setFilterValue,
  initialValue,
  removeFilter,
  label
}) => {
  const [startPickerIsOpen, setStartPickerIsOpen] = useState(false)
  const [endPickerIsOpen, setEndPickerIsOpen] = useState(false)
  const [startValue, setStartValue] = useState(
    initialValue ? initialValue[0] : null
  )
  const [endValue, setEndValue] = useState(
    initialValue ? initialValue[1] : null
  )

  const submitTimeFilter = useCallback(() => {
    setFilterValue({
      value: [
        // We only display a date picker, but the calendar also returns a time
        // field that we need to round off. This rounds those fields to include
        // the entirety of both days selected.
        startValue ? moment(startValue).startOf("day").toISOString() : null,
        endValue ? moment(endValue).endOf("day").toISOString() : null
      ]
    })
  }, [setFilterValue, startValue, endValue])

  const onClosePopover = () => {
    if (startValue || endValue) {
      submitTimeFilter()
    } else if (initialValue) {
      removeFilter()
    }
  }

  useEffect(() => {
    if (
      (startValue || endValue) &&
      // Need the following condition to allow editing a filter with existing
      // start and end values, otherwise it will autosubmit on initial render
      ((initialValue && startValue !== initialValue[0]) ||
        (initialValue && endValue !== initialValue[1]) ||
        !initialValue)
    ) {
      submitTimeFilter()
    }
  }, [submitTimeFilter, startValue, endValue, initialValue])

  useEffect(() => {
    if (!startValue && !endValue && initialValue) {
      removeFilter()
    }
  }, [startValue, endValue, initialValue, removeFilter])

  return (
    <Popover
      isOpened
      onClose={onClosePopover}
      className="dashboard-manager-filter-date-picker"
    >
      <DateInput
        inputName={`${label} start`}
        menuIsOpen={startPickerIsOpen}
        setMenuState={setStartPickerIsOpen}
        value={startValue}
        setValue={setStartValue}
        testIdSuffix={"start"}
      />
      <DateInput
        inputName={`${label} end`}
        menuIsOpen={endPickerIsOpen}
        setMenuState={setEndPickerIsOpen}
        value={endValue}
        setValue={setEndValue}
        testIdSuffix={"end"}
      />
    </Popover>
  )
}

type DateInputProps = {
  inputName: string
  menuIsOpen: boolean
  setMenuState: (menuOpen: boolean) => void
  value: string | null
  setValue: (filterValue: null | Date) => void
  initialValue?: DateValue
  testIdSuffix?: string
}

const DateInput: FC<DateInputProps> = ({
  inputName,
  menuIsOpen,
  setMenuState,
  value,
  setValue,
  testIdSuffix
}) => {
  const openMenu = () => {
    setMenuState(true)
  }
  const closeMenu = () => {
    setMenuState(false)
  }

  const onSubmitDate = (modalSelection: { value: Date }) => {
    setValue(modalSelection.value)
  }

  const clearValue = (e) => {
    e.stopPropagation()
    setValue(null)
  }

  return (
    <div className="dashboard-manager-filter-date-input">
      <div className="date-text-field-wrapper" onClick={openMenu}>
        <TextField
          value={(value && moment(value).format("MMM DD YYYY")) || ""}
          trailingIcon={value ? { icon: "close", onClick: clearValue } : {}}
          label={value ? inputName : ""}
          placeholder={inputName}
          readOnly
          data-testid={`dashboard-manager-filter-tag-date-${testIdSuffix}`}
        />
      </div>

      <Popover isOpened={menuIsOpen} onClose={closeMenu}>
        <FilterTimeModal
          selectedOptionArgs={["value"]}
          submitTimeFilter={onSubmitDate}
          onCancel={closeMenu}
          momentFormat={"MMM DD YYYY"}
          value={value || new Date()}
          localTime
          hideTimePicker
        />
      </Popover>
    </div>
  )
}

export default FilterValueDatePicker
