// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/no-did-mount-set-state, react/no-did-update-set-state */
// TODO: Refactor state setting

import React, { PureComponent } from "react"
import cx from "classnames"

import { noop } from "utils/helpers"
import { Tooltip } from "@rmwc/tooltip"
import PillContainer from "../../pill-container"
import {
  contains,
  startsWith,
  endsWith,
  multiSelect,
  showParameterValueForOption
} from "../filter-component-options"
import FilterTimeDisplay from "./filter-time-display"
import FilterAutosuggestDropdown from "./filter-autosuggest-dropdown"
import FilterSelect from "./filter-select"
import { FilterMetadata } from "vega/constants/filter-metadata-types"
import {
  CategorySelectorSelections,
  OnApplyActionTypes
} from "actions/category-selection-modal-action-creators"
import FilterPanelParameterSelectorInput from "components/new-filters/filter-panel/components/filter-panel-parameter-selector-input"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

const MIN_RESIZE_HEIGHT = 30

/**
 * Operator Selector properties.
 */
interface IOperatorSelectorProps {
  /** Identifier for selected option */
  optionName?: string
  /** Operator start value for between filters */
  start?: number
  /** Operator end value for between filters */
  end?: number
  /** Operator value for single value operation filters */
  value?: number
  /** If menu should be open */
  menuIsOpen?: boolean
  /** If widget should be disabled */
  isDisabled?: boolean
  /** When menu is clicked open */
  onMenuOpen?: Function
  /** When menu is clicked close or values are being entered */
  onMenuClose?: Function
  /** When a menu item is selected */
  onMenuSelect?: Function
  /** When a text input is focused */
  onFocus?: Function
  /** When an input is changed (on blur) */
  onBlur?: Function
  /** When a text input is changed (on every keystroke) */
  onChange?: Function
  /** Update local/unsaved state */
  onAutosuggestClick?: Function
  /** All available operators for data type */
  options: [object]
  /** Which field if any should have autosuggest dropdown open */
  autosuggestField?: [object]
  /** Autocomplete options for dropdown */
  autosuggestResults?: [object]
  /** Needs time input field */
  isTime: boolean
  /** Is a filter on extracted date/time type */
  isExtract?: boolean
  /** Behavior when clicking the case sensitive toggle */
  toggleCaseSensitive: Function
  /** Behavior when clicking the time displayed in widget itself */
  onClickTime: boolean
  /** Needs categorical selector */
  isMultiSelect: boolean
  /** Multiselect values displayed as pills */
  multiSelections: string[]
  /** Apply multiselect filter from new values */
  submitMultiSelectFilter: Function
  /** Remove value from multiselect filter */
  removeMultiSelectValue: Function
  /** Open category selection modal */
  openCategorySelectionModal: Function
  /** Filter name / id */
  name: string
  /** Category Selector modal selections */
  categorySelectorState: CategorySelectorSelections
  isCohort: boolean
  /** Test id for operator dropdown */
  selectTestId: string
  filterMetaData: FilterMetadata
}

/**
 * Operator Selector
 */
export default class FilterOperatorSelector extends PureComponent<
  IOperatorSelectorProps,
  {}
> {
  static defaultProps = {
    onAutosuggestClick: noop,
    autosuggestResults: [],
    autosuggestField: null,
    onFocus: noop
  }

  constructor(props) {
    super(props)
    this.filterOperatorSelectorRef = React.createRef()
    this.textInput = React.createRef()
  }

  state = {
    width: null,
    inputFocused: false
  }

  componentDidMount() {
    const current = this.filterOperatorSelectorRef.current
    this.setState({
      width: current && current.clientWidth
    })
    // wait until after animation to set width of resizable box
    setTimeout(() => {
      const currentWidth = current && current.clientWidth
      this.setState({
        width: currentWidth
      })
    }, 500)
  }

  componentDidUpdate(prevProps) {
    const { categorySelectorState, name } = this.props
    if (
      categorySelectorState &&
      categorySelectorState.onApplyAction.type ===
        OnApplyActionTypes.APPLY_TO_FILTER &&
      categorySelectorState.selections.length
    ) {
      const selectionsAreDifferent =
        JSON.stringify(prevProps.categorySelectorState.selections) !==
        JSON.stringify(categorySelectorState.selections)
      const categorySelectionsApplyToThisFilter =
        categorySelectorState.onApplyAction.filterName === name
      if (categorySelectionsApplyToThisFilter && selectionsAreDifferent) {
        this.props.submitMultiSelectFilter(categorySelectorState.selections)
      }
    }
    const currentWidth =
      this.filterOperatorSelectorRef.current &&
      this.filterOperatorSelectorRef.current.clientWidth
    if (currentWidth !== this.state.width) {
      this.setState({
        width: currentWidth
      })
    }

    // Swapping param value with param name on focus causes a rerender, so here's
    // a workaround to re-focus.
    if (
      showParameterValueForOption(this.props.optionName) &&
      this.state.inputFocused &&
      document.activeElement !== this.textInput?.current
    ) {
      this.textInput.current.focus()
    }
  }

  onFocus = (field) => (e) => {
    this.setState({ inputFocused: true })
    this.props.onFocus(field, e.target.value)
    this.props.onMenuClose()
  }

  onBlur = (field) => (e) => {
    this.setState({ inputFocused: false })
    this.props.onBlur(field, e.target.value)
  }

  onChange = (field) => (e) => {
    this.props.onChange(field, e.target.value)
  }

  onKeyUp = (field) => (e) => {
    if (e.key === "Enter") {
      e.target.blur(field, e.target.value)
    }
    if (this.props.menuIsOpen) {
      this.props.onMenuClose()
    }
  }

  onMenuSelect = (operatorName) => {
    this.props.onMenuSelect(operatorName)
    if (operatorName === multiSelect.name) {
      this.props.openCategorySelectionModal()
    }
  }

  onMenuOpen = () => {
    if (this.props.menuIsDisabled) {
      return
    }

    this.props.onMenuOpen()
  }

  onAutosuggestClick = (field, value) => {
    this.props.onAutosuggestClick(field, value)
  }

  onInsertParameter = (field) => (fieldValue) => {
    this.props.onChange(field, fieldValue, true)
  }

  renderInput(field, defaultValue) {
    const showAutosuggest = Boolean(
      this.props.autosuggestField === field &&
        this.props.autosuggestResults.length
    )
    const showCaseSensitive = Boolean(
      this.props.optionName === contains.name ||
        this.props.optionName === startsWith.name ||
        this.props.optionName === endsWith.name
    )

    let inputValue = defaultValue
    const displayParameterValue =
      showParameterValueForOption(this.props.optionName) &&
      document.activeElement !== this.textInput?.current
    let inputValueUsesParameter = false

    if (displayParameterValue && typeof defaultValue === "string") {
      inputValue = process(defaultValue, {
        useDisplayName: true,
        onProcessComplete: ({ parametersInUse }) => {
          inputValueUsesParameter = Boolean(parametersInUse.size)
        }
      })
    }

    const inputField = (
      <FilterPanelParameterSelectorInput
        onSelectParameter={this.onInsertParameter(field)}
        inputProps={{
          value: inputValue,
          "data-testid": `filter-component-input-${field}`,
          onBlur: this.onBlur(field),
          onFocus: this.onFocus(field),
          onChange: this.onChange(field),
          className: cx({
            parameterized: inputValueUsesParameter && displayParameterValue
          }),
          ref: this.textInput
        }}
      />
    )

    return (
      <div className={`${field}-input`} key={field}>
        {displayParameterValue && inputValueUsesParameter ? (
          <Tooltip enterDelay={500} content={defaultValue}>
            <div className="input-tooltip-target">{inputField}</div>
          </Tooltip>
        ) : (
          inputField
        )}
        {showCaseSensitive && (
          <Tooltip
            enterDelay={500}
            content={
              this.props.filterMetaData.filter.caseSensitive
                ? "Disable case-sensitivity"
                : "Enable case-sensitivity"
            }
          >
            <div
              className={cx("case-sensitive-icon", {
                checked: this.props.filterMetaData.filter.caseSensitive
              })}
              onClick={this.props.toggleCaseSensitive}
            >
              Aa
            </div>
          </Tooltip>
        )}
        {showAutosuggest && (
          <FilterAutosuggestDropdown
            autosuggestResults={this.props.autosuggestResults}
            field={field}
            onMouseDown={(value) => this.onAutosuggestClick(field, value)}
          />
        )}
      </div>
    )
  }

  renderBetweenInputs() {
    return (
      <div className="between-input">
        {this.renderInput("start", this.props.start)}
        <div className="between-label">and</div>
        {this.renderInput("end", this.props.end)}
      </div>
    )
  }

  renderTextInputs(args) {
    if (
      !this.props.optionName ||
      this.props.isCohort ||
      (this.props.isTime && !this.props.isExtract)
    ) {
      return null
    }

    const needsStart = args.includes("start")
    const needsEnd = args.includes("end")

    if (needsStart && needsEnd) {
      return this.renderBetweenInputs()
    }

    return args.map((arg) => this.renderInput(arg, this.props[arg]))
  }

  renderMultiSelect() {
    return (
      <PillContainer
        values={this.props.multiSelections}
        minHeight={MIN_RESIZE_HEIGHT}
        width={this.state.width}
        remove={this.props.removeMultiSelectValue}
        add={() => this.props.openCategorySelectionModal()}
      />
    )
  }

  render() {
    let selectedOption = {}
    let selectedOptionArgs = []
    if (this.props.optionName) {
      selectedOption = this.props.options.find(
        (option) => option.name === this.props.optionName
      )

      if (!selectedOption) {
        return null
      }

      selectedOptionArgs = selectedOption.args
    }

    const operatorSelectorClass = cx({
      "filter-operator-selector": true,
      "full-width":
        this.props.isTime || this.props.isMultiSelect || this.props.isCohort,
      hidden: this.props.isDisabled,
      "middle-section": selectedOption.isRelative
    })

    return (
      <div
        className="filter-operator-selector-container"
        ref={this.filterOperatorSelectorRef}
      >
        <div className={operatorSelectorClass}>
          <FilterSelect
            selectedOption={selectedOption}
            menuIsOpen={this.props.menuIsOpen}
            onMenuSelect={this.onMenuSelect}
            options={this.props.options}
            className={"operator"}
            testId={this.props.selectTestId || "filter-component-dropdown-menu"}
            openMenu={this.onMenuOpen}
            closeMenu={this.props.onMenuClose}
            menuIsDisabled={this.props.menuIsDisabled}
          />
          {this.renderTextInputs(selectedOptionArgs)}
        </div>
        {this.props.isTime && !this.props.isExtract && (
          <FilterTimeDisplay
            selectedOption={selectedOption}
            start={this.props.start}
            end={this.props.end}
            value={this.props.value}
            onClick={this.props.onClickTime}
          />
        )}
        {this.props.isMultiSelect && this.renderMultiSelect()}
      </div>
    )
  }
}
