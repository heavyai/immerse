// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { Icon } from "@rmwc/icon"

import { isSupportedTypeForAggregateFilter } from "components/new-filters/filter-component/data-type-filters"

import FilterOperatorSelector from "./components/filter-operator-selector"
import FilterTitleBar from "./components/filter-title-bar"
import FilterSelect from "./components/filter-select"
import FilterTimeModal from "./components/filter-time-modal"
import FilterColumnEditor from "./filter-column-editor"

import {
  getInfoForOption,
  optionNameFromFilter,
  updatedFilterFromOption,
  getChildlessFilter,
  buildDisplayName,
  numericOptionsNoNull,
  aggregateOptionInfoFromFilter,
  allowedAggregateOptions,
  TYPE_CATEGORIES,
  typeCategory,
  unique,
  isCountStarAggregateFilter
} from "./filter-component-options"

import { isFilterValueValid } from "../filter-selectors"

import "./aggregate-filter-component.scss"
export default class AggregateFilterComponent extends PureComponent {
  static propTypes = {
    updateFilter: PropTypes.func,
    removeFilter: PropTypes.func,
    toggleFilter: PropTypes.func,
    filterMetaData: PropTypes.object,
    customSQLManagerProps: PropTypes.object,
    makeCategorySelection: PropTypes.func,
    columns: PropTypes.arrayOf(PropTypes.object),
    dataSources: PropTypes.object
  }

  constructor(props) {
    super(props)
    const { filterMetaData } = this.props
    const { start, end, value, dataExpression } = getChildlessFilter(
      filterMetaData.filter
    )
    const selectedOption = optionNameFromFilter(filterMetaData.filter)
    const selectedOptionInfo = getInfoForOption(
      selectedOption,
      this.props.filterMetaData.filter
    )

    this.state = {
      optionName: selectedOption,
      operator: selectedOptionInfo && selectedOptionInfo.operator,
      start: start || "",
      end: end || "",
      value: value || "",
      editingColumn: dataExpression.value === null,
      columnSearchText: ""
    }

    this.setFilterValidity()
    this.dataTableRef = React.createRef()
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  setRef = (node) => {
    this.filterContainerRef = node
  }

  handleClickOutside = (e) => {
    if (
      this.filterContainerRef &&
      !this.filterContainerRef.contains(e.target)
    ) {
      this.closeColumnEditor()
    }
  }

  closeColumnEditor = () => {
    const { dataExpression } = getChildlessFilter(
      this.props.filterMetaData.filter,
      this.props.dataSource
    )

    // Only allow closing column editor if user is editing a complete filter--
    // prevent closing column editor when it's the zero state.
    if (dataExpression && dataExpression.value) {
      this.setState({ editingColumn: false })
    }
  }

  setFilterValidity = () => {
    const { setFilterValidity, filterMetaData } = this.props
    setFilterValidity(filterMetaData.name, this.allFieldsValid())
  }

  allFieldsValid = () => {
    const { filterMetaData } = this.props
    const selectedOptionInfo = getInfoForOption(
      this.state.optionName,
      filterMetaData.filter
    )
    const { dataExpression } = getChildlessFilter(filterMetaData.filter)

    if (!dataExpression || !dataExpression.value) {
      return false
    }

    return selectedOptionInfo.args.every((arg) =>
      this.isValid(arg, this.state[arg])
    )
  }

  submitFilterUpdate = () => {
    this.setFilterValidity()

    const { filterMetaData, updateFilter, columnMetaData } = this.props
    const { value, start, end, optionName } = this.state

    const updatedFilter = updatedFilterFromOption(
      optionName,
      filterMetaData.filter,
      { value, start, end },
      columnMetaData
    )

    updateFilter(updatedFilter, filterMetaData.name)
  }

  onMenuOpen = () => {
    this.setState({ menuIsOpen: true })
  }

  onMenuClose = () => {
    this.setState({ menuIsOpen: false })
  }

  onAggregateMenuOpen = () => {
    this.setState({ aggregateMenuIsOpen: true })
  }

  onAggregateMenuClose = () => {
    this.setState({ aggregateMenuIsOpen: false })
  }

  onTextChange = (fieldName, value) => {
    this.setState({ [fieldName]: value })
  }

  onOperatorChange = (option) => {
    const selectedOptionInfo = getInfoForOption(
      option,
      this.props.filterMetaData.filter
    )
    this.setState(
      {
        optionName: option,
        operator: selectedOptionInfo.operator,
        menuIsOpen: false
      },
      this.submitFilterUpdate
    )
  }

  onAggregateChange = (optionName) => {
    const { filterMetaData, updateFilter, columnMetaData } = this.props

    const updatedFilter = updatedFilterFromOption(
      this.state.optionName,
      filterMetaData.filter,
      {
        ...this.state,
        aggregate: optionName
      },
      columnMetaData
    )

    // Filter dataType may change when we switch the aggregate function. Clear possibly invalid entered values in this case.
    if (
      getChildlessFilter(updatedFilter).dataType !==
      getChildlessFilter(filterMetaData.filter).dataType
    ) {
      this.clearValues(() => updateFilter(updatedFilter, filterMetaData.name))
    } else {
      updateFilter(updatedFilter, filterMetaData.name)
    }
  }

  clearValues = (callback) => {
    this.setState(
      {
        start: "",
        end: "",
        value: ""
      },
      () => {
        this.setFilterValidity()
        callback()
      }
    )
  }

  submitTimeFilter = (updatedValues) => {
    this.setState(
      {
        ...updatedValues,
        timeModalIsOpen: false
      },
      this.submitFilterUpdate
    )
  }

  onClickTime = () => {
    this.setState({ timeModalIsOpen: true })
  }

  onCancelTimeModal = () => {
    this.setState({ timeModalIsOpen: false })
  }

  isValid = (fieldName, val) => {
    const { filterMetaData } = this.props
    return isFilterValueValid(val, filterMetaData.filter)
  }

  removeFilter = () => {
    this.props.removeFilter(this.props.filterMetaData.name)
  }

  toggleFilter = () => {
    this.props.toggleFilter(this.props.filterMetaData.name)
  }

  onClickDataExpression = () => {
    this.setState({ editingColumn: true })
  }

  setColumnSearchText = (value) => {
    this.setState({ columnSearchText: value })
  }

  renderOperatorSection() {
    const { filterMetaData } = this.props
    const { dataExpression } = getChildlessFilter(filterMetaData.filter)

    return (
      <FilterOperatorSelector
        name={filterMetaData.name}
        optionName={this.state.optionName}
        start={this.state.start}
        end={this.state.end}
        value={this.state.value}
        operator={this.state.operator}
        menuIsOpen={this.state.menuIsOpen}
        onMenuOpen={this.onMenuOpen}
        onMenuClose={this.onMenuClose}
        onMenuSelect={this.onOperatorChange}
        onBlur={this.submitFilterUpdate}
        onChange={this.onTextChange}
        options={numericOptionsNoNull}
        filterMetaData={filterMetaData}
        // All options for a time column should display a time except for "# Unique"
        isTime={
          typeCategory(filterMetaData.filter) === TYPE_CATEGORIES.TIME &&
          dataExpression.function !== unique.aggregateFunction
        }
        onClickTime={this.onClickTime}
        selectTestId={"cohort-aggregate-filter-operator-select"}
      />
    )
  }

  renderRemoveButton() {
    return this.props.removeFilter ? (
      <div
        className="filter-button"
        onClick={this.removeFilter}
        data-testid={"cohort-aggregate-filter-delete"}
      >
        <Icon icon="close" className="filter-component-delete" />
      </div>
    ) : null
  }

  renderAggregateMenu() {
    return (
      <FilterSelect
        options={allowedAggregateOptions(
          this.props.filterMetaData,
          this.props.columnMetaData
        )}
        selectedOption={aggregateOptionInfoFromFilter(
          this.props.filterMetaData.filter
        )}
        onMenuSelect={this.onAggregateChange}
        openMenu={this.onAggregateMenuOpen}
        closeMenu={this.onAggregateMenuClose}
        testId={"cohort-aggregate-filter-function-select"}
        menuIsOpen={this.state.aggregateMenuIsOpen}
        menuIsDisabled={false}
      />
    )
  }

  renderColumnEditor() {
    const { dataType, dataExpression, dataSource } = getChildlessFilter(
      this.props.filterMetaData.filter
    )

    const { start, end, value, optionName } = this.state

    const existingFilterData = {
      dataType,
      start,
      end,
      value,
      name: this.props.filterMetaData.name,
      optionName,
      dataSource,
      dataExpression,
      filter: this.props.filterMetaData.filter
    }

    return (
      <FilterColumnEditor
        allDataSources={this.props.dataSources}
        dataTypeFilter={isSupportedTypeForAggregateFilter}
        dataTableRef={this.dataTableRef}
        canSelectDataSource={false}
        allowedDataSources={[dataSource]}
        columnSelectAction={this.props.columnSelectAction}
        dataSourcesList={[dataSource]}
        existingFilterData={existingFilterData}
        searchValue={this.state.columnSearchText}
        customOptions={[
          {
            label: "# Records",
            value: "*",
            type: "INT",
            table: dataSource,
            isCount: true
          }
        ]}
      />
    )
  }

  render() {
    const { filterMetaData } = this.props
    const selectedOptionInfo = getInfoForOption(
      this.state.optionName,
      filterMetaData.filter
    )
    const { start, end, value } = this.state

    return (
      <div className="filter-component aggregate">
        {this.renderRemoveButton()}
        <div className="filter-container" ref={this.setRef}>
          <div className="filter-top-container">
            <FilterTitleBar
              onClick={this.onClickDataExpression}
              enabled={this.props.filterMetaData.enabled}
              incomplete={!this.props.filterMetaData.valid}
              onClickToggle={this.toggleFilter}
              classNames={""}
              displayName={buildDisplayName(
                this.props.filterMetaData,
                !selectedOptionInfo
              )}
              dataTableRef={this.dataTableRef}
              toggleTestId={"cohort-aggregate-filter-toggle"}
              testId={"cohort-aggregate-filter-data-expression"}
              editingColumn={this.state.editingColumn}
              columnSearchText={this.state.columnSearchText}
              setColumnSearchText={this.setColumnSearchText}
            />
            {!this.state.editingColumn &&
              !isCountStarAggregateFilter(filterMetaData.filter) &&
              this.renderAggregateMenu()}
          </div>
          {this.state.editingColumn
            ? this.renderColumnEditor()
            : this.renderOperatorSection(selectedOptionInfo)}
        </div>
        {this.state.timeModalIsOpen && (
          <FilterTimeModal
            start={this.isValid("start", start) ? start : Date.now()}
            end={this.isValid("end", end) ? end : Date.now()}
            value={this.isValid("value", value) ? value : Date.now()}
            selectedOptionArgs={selectedOptionInfo.args}
            submitTimeFilter={this.submitTimeFilter}
            onCancel={this.onCancelTimeModal}
            overlay
          />
        )}
      </div>
    )
  }
}
