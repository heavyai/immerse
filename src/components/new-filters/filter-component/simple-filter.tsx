// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect, useRef } from "react"
import { connect } from "react-redux"
import cx from "classnames"
import moment from "moment"
import { Checkbox } from "@rmwc/checkbox"
import { Tooltip } from "@rmwc/tooltip"
import { TextField } from "widgets/text-field/TextField"
import { Icon } from "@rmwc/icon"
import Slider from "@material-ui/core/Slider"
import Popover from "components/popover/popover"
import {
  buildFilterLabel,
  buildOmnifilterSql
} from "vega/constants/filter-types"
import { getColumnMinMax } from "actions/column-values-action-creators"

import { process } from "utils/ImmerseSQLPlusPlus/parser"
import ParameterSelectorInput from "components/parameter-selector-input"
import CategoricalMultiSelect from "./components/simple-categorical-multiselect-filter"
import {
  getOrFilterValues,
  cohortOptions,
  optionNameFromCohortFilter,
  showParameterValueForOption,
  // Renaming these to distinguish between data types and filter types
  typeCategory as dataTypeCategory,
  TYPE_CATEGORIES as DATA_TYPE_CATEGORIES,
  between as BETWEEN_OPERATOR,
  notBetween as NOT_BETWEEN_OPERATOR,
  greaterThan as GREATER_THAN_OPERATOR,
  greaterThanOrEqual as GREATER_THAN_OR_EQUAL_OPERATOR,
  equal as EQUAL_OPERATOR,
  notEqual as NOT_EQUAL_OPERATOR
} from "./filter-component-options"
import { FILTER_TYPE_SQL } from "vega/constants/filter-type-constants"

import "./simple-filter.scss"

type SimpleFilterProps = {
  isFilterIncomplete: boolean
  filterMetaData: object
  filterDisplayName: string
  filterOperatorInfo: object
  filterType: string
  textInputValue: string
  textInputStartValue: string
  textInputEndValue: string
  shouldShowAutosuggest: boolean
  autosuggestResults: any[]
  getAutosuggestResults: Function
  clearAutosuggestResults: Function
  toggleFilter: Function
  updateFilter: Function
  updateCohort: Function
  submitFilter: Function
  submitMultiSelectFilter: Function
  openTimePicker: Function
  closeTimePicker: Function
  dataSource: string
  column: string
  minValue: number
  maxValue: number
  getMinMax: Function
}

const SimpleFilter: FC<SimpleFilterProps> = ({
  isFilterIncomplete,
  filterMetaData,
  filterDisplayName,
  filterOperatorInfo,
  filterType,
  textInputValue,
  textInputStartValue,
  textInputEndValue,
  toggleFilter,
  updateFilter,
  updateCohort,
  submitFilter,
  submitMultiSelectFilter,
  shouldShowAutosuggest,
  autosuggestResults,
  getAutosuggestResults,
  clearAutosuggestResults,
  openTimePicker,
  dataSource,
  column,
  minValue,
  maxValue,
  getMinMax
}) => {
  const [autosuggestDropdownOpen, setAutosuggestDropdownOpen] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    if (
      dataTypeCategory(filterMetaData.filter) ===
        DATA_TYPE_CATEGORIES.NUMERIC ||
      dataTypeCategory(filterMetaData.filter) === DATA_TYPE_CATEGORIES.TIME
    ) {
      getMinMax(dataSource, column)
    }
  }, [column, dataSource, filterMetaData.filter, getMinMax])

  useEffect(() => {
    if (isInputFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isInputFocused])

  const FILTER_START_VALUE = "start"
  const FILTER_END_VALUE = "end"
  const FILTER_VALUE = "value"

  const OPERATOR_ARG_TO_INPUT_VALUE = {
    [FILTER_START_VALUE]: textInputStartValue,
    [FILTER_END_VALUE]: textInputEndValue,
    [FILTER_VALUE]: textInputValue
  }

  const NUMERICAL_SLIDER_OPTIONS = {
    transformForSlider: (value) => Number(value),
    transformFromSlider: (value) => String(value)
  }

  const DATE_SLIDER_OPTIONS = {
    transformForSlider: (utcTime) => moment.utc(utcTime).valueOf(),
    transformFromSlider: (dateTimeValue) => moment.utc(dateTimeValue).format()
  }

  const showAutosuggest = (value) => {
    if (shouldShowAutosuggest) {
      if (
        // We just show true/false for Boolean filters so no need to query
        dataTypeCategory(filterMetaData.filter) !== DATA_TYPE_CATEGORIES.BOOL
      ) {
        getAutosuggestResults({
          dataSource,
          column,
          value,
          excludeFilter: filterMetaData.name
        })
      }
      setAutosuggestDropdownOpen(true)
    }
  }

  // Each operator has a different list of "args" that determines how many text
  // fields we need to render, and for which values keys ("start", "end", "value").
  // See filter-component-options
  const renderTextFieldForArg = (filterOperatorArg) => (
    <TextField
      className="simple-filter__input"
      value={OPERATOR_ARG_TO_INPUT_VALUE[filterOperatorArg] || ""}
      data-testid={`simple-filter-input-field-${column}`}
      onBlur={() => {
        submitFilter()

        if (shouldShowAutosuggest) {
          setAutosuggestDropdownOpen(false)
          clearAutosuggestResults(dataSource, column)
        }
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur(filterOperatorArg, e.currentTarget.value)
        }
      }}
      onClick={(e) => {
        e.currentTarget.select()
        showAutosuggest()
      }}
      onChange={(e) => {
        showAutosuggest(e.currentTarget.value)
        updateFilter(filterOperatorArg, e.currentTarget.value)
      }}
    />
  )

  const renderAutosuggest = () => {
    const autosuggestOptions =
      dataTypeCategory(filterMetaData.filter) === DATA_TYPE_CATEGORIES.BOOL
        ? ["true", "false"]
        : autosuggestResults.map((result) => result.col).sort()

    return (
      <Popover
        isOpened={autosuggestDropdownOpen}
        onClose={() => setAutosuggestDropdownOpen(false)}
      >
        <ul className="simple-filter--text__autosuggest">
          {autosuggestOptions.map((result, i) => (
            <li
              key={`simple-filter-autosuggest-${result}-${i}`}
              onMouseDown={(e) => {
                e.stopPropagation()
                updateFilter(FILTER_VALUE, result)
                setAutosuggestDropdownOpen(false)
              }}
              className="simple-filter--text__autosuggest__item"
            >
              {result}
            </li>
          ))}
        </ul>
      </Popover>
    )
  }

  const renderTextInputs = () => {
    let inputValue = OPERATOR_ARG_TO_INPUT_VALUE[FILTER_VALUE] || ""
    const displayParameterValue =
      showParameterValueForOption(filterOperatorInfo.name) &&
      document.activeElement !== inputRef.current
    let inputValueUsesParameter = false

    if (displayParameterValue) {
      inputValue = process(inputValue, {
        useDisplayName: true,
        onProcessComplete: ({ parametersInUse }) => {
          inputValueUsesParameter = Boolean(parametersInUse.size)
        }
      })
    }

    const scroller = document.getElementById("filter-panel-scroller")
    const dashboardScroller = document.getElementById("dashboard-container")

    return (
      <div className="simple-filter--text">
        {showParameterValueForOption(filterOperatorInfo.name) ? (
          <ParameterSelectorInput
            onSelectParameter={(valueWithParameter) => {
              showAutosuggest(false)
              updateFilter(FILTER_VALUE, valueWithParameter, true)
              setIsInputFocused(true)
            }}
            portalProps={{
              scrollingElements: [scroller, dashboardScroller]
            }}
            inputProps={{
              ref: inputRef,
              value: inputValue || "",
              className: cx("simple-filter__input--param", {
                "has-parameter":
                  inputValueUsesParameter && displayParameterValue
              }),
              "data-testid": `simple-filter-input-field-${column}`,
              onBlur: () => {
                setIsInputFocused(false)
                submitFilter()

                if (shouldShowAutosuggest) {
                  setAutosuggestDropdownOpen(false)
                  clearAutosuggestResults(dataSource, column)
                }
              },
              onKeyUp: (e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur(FILTER_VALUE, e.currentTarget.value)
                }
              },
              onClick: (e) => {
                setIsInputFocused(true)
                e.currentTarget.select()
                showAutosuggest()
              },
              onChange: (e) => {
                showAutosuggest(e.currentTarget.value)
                updateFilter(FILTER_VALUE, e.currentTarget.value)
              }
            }}
          />
        ) : (
          renderTextFieldForArg(FILTER_VALUE)
        )}

        {shouldShowAutosuggest && renderAutosuggest()}
      </div>
    )
  }

  const renderSlider = ({ transformForSlider, transformFromSlider }) => {
    let trackDisplayValue = "normal"
    if (
      filterOperatorInfo.name === GREATER_THAN_OPERATOR.name ||
      filterOperatorInfo.name === GREATER_THAN_OR_EQUAL_OPERATOR.name
    ) {
      trackDisplayValue = "inverted"
    } else if (
      filterOperatorInfo.name === EQUAL_OPERATOR.name ||
      filterOperatorInfo.name === NOT_EQUAL_OPERATOR.name
    ) {
      trackDisplayValue = false
    }

    return (
      <Slider
        className={cx("simple-filter__slider", {
          "is-missing-value": isFilterIncomplete
        })}
        color="primary"
        value={transformForSlider(textInputValue)}
        min={transformForSlider(minValue)}
        max={transformForSlider(maxValue)}
        onChange={(e, value) => {
          updateFilter(FILTER_VALUE, transformFromSlider(value))
        }}
        onChangeCommitted={submitFilter}
        aria-labelledby="continuous-slider"
        track={trackDisplayValue}
      />
    )
  }

  const renderRangeSlider = ({ transformForSlider, transformFromSlider }) => {
    const handleRangeChange = (e, values) => {
      const newStartValue = transformFromSlider(values[0])
      const newEndValue = transformFromSlider(values[1])

      if (textInputStartValue !== newStartValue) {
        updateFilter(FILTER_START_VALUE, newStartValue)
      }
      if (textInputEndValue !== newEndValue) {
        updateFilter(FILTER_END_VALUE, newEndValue)
      }
    }

    return (
      <Slider
        className={cx("simple-filter__slider", {
          "is-missing-value": isFilterIncomplete
        })}
        value={[
          // User may input values outside of the min/max range which causes
          // Slider to throw an exception
          Math.max(
            transformForSlider(textInputStartValue),
            transformForSlider(minValue)
          ),
          Math.min(
            transformForSlider(textInputEndValue),
            transformForSlider(maxValue)
          )
        ]}
        // TODO: We need to query for the min/max of each column
        min={transformForSlider(minValue)}
        max={transformForSlider(maxValue)}
        onChange={handleRangeChange}
        onChangeCommitted={submitFilter}
        aria-labelledby="range-slider"
        track={
          filterOperatorInfo.name === NOT_BETWEEN_OPERATOR.name
            ? "inverted"
            : "normal"
        }
      />
    )
  }

  const renderNumericInputs = () => (
    <div className="simple-filter--numeric">
      {renderSlider(NUMERICAL_SLIDER_OPTIONS)}
      {renderTextFieldForArg(FILTER_VALUE)}
    </div>
  )

  const renderNumericRangeInputs = () => (
    <div className="simple-filter--numeric simple-filter--range">
      {renderRangeSlider(NUMERICAL_SLIDER_OPTIONS)}
      <div className="simple-filter--range__values">
        {renderTextFieldForArg(FILTER_START_VALUE)}
        {renderTextFieldForArg(FILTER_END_VALUE)}
      </div>
    </div>
  )

  const renderDateInputs = () => {
    const datePickerText = textInputValue
      ? moment(textInputValue).format("ll")
      : "Select a date"

    return (
      <div className="simple-filter--date">
        {renderSlider(DATE_SLIDER_OPTIONS)}
        <div>
          <span
            className="simple-filter--date__picker"
            onClick={openTimePicker}
          >
            {datePickerText}
            <Icon icon={{ icon: "date_range", size: "xsmall" }} />
          </span>
        </div>
      </div>
    )
  }

  const renderDateRangeInputs = () => {
    const startDatePickerText = textInputStartValue
      ? moment(textInputStartValue).format("ll")
      : "Select a start date"
    const endDatePickerText = textInputEndValue
      ? moment(textInputEndValue).format("ll")
      : "Select an end date"

    return (
      <div className="simple-filter--date simple-filter--range">
        {renderRangeSlider(DATE_SLIDER_OPTIONS)}
        <div className="simple-filter--range__values">
          <span
            className="simple-filter--date__picker"
            onClick={openTimePicker}
          >
            {startDatePickerText}
            <Icon icon={{ icon: "date_range", size: "xsmall" }} />
          </span>
          <span
            className="simple-filter--date__picker"
            onClick={openTimePicker}
          >
            {endDatePickerText}
            <Icon icon={{ icon: "date_range", size: "xsmall" }} />
          </span>
        </div>
      </div>
    )
  }

  const renderCohortFilter = () => (
    <>
      <span className="simple-filter--cohort">
        ({filterMetaData.cohortDimension.cohortName})
      </span>
      <Tooltip
        content={process(buildOmnifilterSql(filterMetaData), {
          useDisplayName: true
        })}
        enterDelay={500}
      >
        <Icon
          className="simple-filter--info-icon"
          icon={{ icon: "info", size: "xsmall" }}
        />
      </Tooltip>
      <div className="simple-filter--cohort__options">
        {cohortOptions.map((cohortOption, i) => (
          <div
            key={`cohort-${cohortOption.name}-${i}`}
            onClick={() => {
              updateCohort(cohortOption.name)
            }}
            className={cx("simple-filter--cohort__option", {
              "is-selected":
                optionNameFromCohortFilter(filterMetaData) === cohortOption.name
            })}
          >
            {cohortOption.name}
          </div>
        ))}
      </div>
    </>
  )

  const renderSQLFilter = () => (
    <Tooltip content={buildFilterLabel(filterMetaData)} enterDelay={500}>
      <Icon
        className="simple-filter--info-icon"
        icon={{ icon: "info", size: "xsmall" }}
      />
    </Tooltip>
  )

  const renderCategoricalMultiselect = () => (
    <CategoricalMultiSelect
      submitMultiSelectFilter={submitMultiSelectFilter}
      initialSelections={getOrFilterValues(filterMetaData.filter)}
      columnName={column}
      dataSourceName={dataSource}
      excludeFilter={filterMetaData.name}
    />
  )

  const renderFilterControls = () => {
    if (filterMetaData.cohortDimension) {
      return renderCohortFilter()
    }

    if (filterType === FILTER_TYPE_SQL) {
      return renderSQLFilter()
    }

    if (
      filterOperatorInfo.name === "ISNULL" ||
      filterOperatorInfo.name === "ISNOTNULL"
    ) {
      return null
    }

    if (filterOperatorInfo.name === "MULTI") {
      return renderCategoricalMultiselect()
    }

    if (dataTypeCategory(filterMetaData.filter) === DATA_TYPE_CATEGORIES.TIME) {
      // Don't show the datetime picker or slider if the filter is using a
      // preset e.g. Last 60 minutes, Yesterday, etc to prevent crashing Immerse
      // when user opens the datetime picker.
      //
      // We will likely want to build out a relative datetime picker for Simple
      // Mode for real (like a slider that gives you a range from "last year" to
      // "now") but for now just render nothing
      if (filterOperatorInfo.isRelative) {
        return null
      }

      if (
        filterOperatorInfo.name === BETWEEN_OPERATOR.name ||
        filterOperatorInfo.name === NOT_BETWEEN_OPERATOR.name
      ) {
        return renderDateRangeInputs()
      }

      return renderDateInputs()
    }

    if (
      dataTypeCategory(filterMetaData.filter) === DATA_TYPE_CATEGORIES.NUMERIC
    ) {
      if (
        filterOperatorInfo.name === BETWEEN_OPERATOR.name ||
        filterOperatorInfo.name === NOT_BETWEEN_OPERATOR.name
      ) {
        return renderNumericRangeInputs()
      }

      return renderNumericInputs()
    }

    if (
      dataTypeCategory(filterMetaData.filter) === DATA_TYPE_CATEGORIES.TEXT ||
      dataTypeCategory(filterMetaData.filter) === DATA_TYPE_CATEGORIES.BOOL
    ) {
      return renderTextInputs()
    }

    return <p>Filter not yet supported in Simple Mode</p>
  }

  return (
    <div className="simple-filter" data-testid="filter-panel-simple-filters">
      <Tooltip
        enterDelay={500}
        content={
          isFilterIncomplete
            ? "Enter a valid value to enable filter"
            : "Toggle filter"
        }
      >
        {/* Tooltips don't render when their immediate child is disabled,
        so we're adding a span here as buffer */}
        <span className="simple-filter__toggle">
          <Checkbox
            checked={filterMetaData.enabled}
            disabled={isFilterIncomplete}
            ripple={false}
            onChange={() => {
              toggleFilter()
            }}
          />
        </span>
      </Tooltip>
      <span className="simple-filter__display-name">{filterDisplayName}</span>

      {filterOperatorInfo && filterOperatorInfo.name !== "MULTI" ? (
        <span className="simple-filter__operator-option">
          {filterOperatorInfo.label}
        </span>
      ) : null}

      {renderFilterControls(filterOperatorInfo)}
    </div>
  )
}

const mapStateToProps = ({ columnValues }, { dataSource, column }) => {
  const columnData =
    (columnValues[dataSource] && columnValues[dataSource][column]) || {}

  return {
    minValue: columnData.minValue,
    maxValue: columnData.maxValue
  }
}

const mapDispatchToProps = (dispatch) => ({
  getMinMax: (dataSource, column) => {
    dispatch(getColumnMinMax(dataSource, column))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SimpleFilter)
