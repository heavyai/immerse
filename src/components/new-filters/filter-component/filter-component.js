// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import cx from "classnames"
import { Icon } from "@rmwc/icon"
import { noop } from "utils/helpers"
import { isSupportedTypeForCohortFilter } from "components/new-filters/filter-component/data-type-filters"
import { isOldFilter } from "vega/constants/filter-metadata-types"
import { CustomSQLTypes } from "components/custom-sql-manager/custom-sql-manager-actions"

import FilterOperatorSelector from "./components/filter-operator-selector"
import FilterTimeModal from "./components/filter-time-modal"
import FilterCohortDisplay from "./components/filter-cohort-display"
import FilterSqlBox from "./components/filter-sql-box"
import FilterTitleBar from "./components/filter-title-bar"
import SimpleFilter from "./simple-filter"

import {
  optionsForDataType,
  getInfoForOption,
  optionNameFromFilter,
  typeCategory,
  updatedFilterFromOption,
  multiSelect,
  multiSelectFilterFromValues,
  noneSelected,
  cohortOptions,
  optionNameFromCohortFilter,
  cohortExclude,
  shouldShowAutosuggest,
  TYPE_CATEGORIES,
  getChildlessFilter,
  getOrFilterValues,
  buildDisplayName
} from "./filter-component-options"

import {
  isFilterValueValid,
  checkFilterForCompleteness
} from "../filter-selectors"
import "./filter-component.scss"

import FilterColumnEditor from "./filter-column-editor"

import {
  OnApplyActionTypes,
  CategorySelectionsPropType
} from "actions/category-selection-modal-action-creators"
import {
  getDistinctColumnValues,
  clearDistinctColumnValues
} from "actions/column-values-action-creators"
import { isStringType } from "constants/data-types"
import { ParameterTypes } from "components/parameters/parameters-types"
import {
  getParameterizedCustomSqlMetadata,
  parameterDefinitionToFilterMetadata
} from "utils/parameterized-custom-sql-metadata"

import {
  FILTER_TYPE_SQL,
  FILTER_TYPE_MULTISOURCE,
  FILTER_TYPE_OR
} from "vega/constants/filter-type-constants"

const MIN_SQL_RESIZE_HEIGHT = 60

export class FilterComponent extends PureComponent {
  static propTypes = {
    updateFilter: PropTypes.func,
    removeFilter: PropTypes.func,
    removeFromNewlyCreated: PropTypes.func,
    highlightCharts: PropTypes.func,
    dehighlightCharts: PropTypes.func,
    chartIds: PropTypes.arrayOf(PropTypes.string),
    isReadOnly: PropTypes.bool,
    toggleFilter: PropTypes.func,
    toggleFilterSimpleMode: PropTypes.func,
    showSimpleModeIcon: PropTypes.bool,
    autosuggestResults: PropTypes.arrayOf(
      PropTypes.shape({
        col: PropTypes.string
      })
    ),
    getAutosuggestResults: PropTypes.func,
    clearAutosuggestResults: PropTypes.func,
    openCategorySelectionModal: PropTypes.func,
    categorySelectorState: CategorySelectionsPropType,
    newlyCreated: PropTypes.bool,
    filterMetaData: PropTypes.object,
    updateCohort: PropTypes.func,
    onTouchCallback: PropTypes.func,
    isLastTouchedFilter: PropTypes.bool,
    columns: PropTypes.arrayOf(PropTypes.object),
    dataSources: PropTypes.object,
    dataSource: PropTypes.string.isRequired
  }

  static defaultProps = {
    highlightCharts: () => {},
    dehighlightCharts: () => {},
    selectedFilterSet: {},
    filterSets: {},
    hideAdvancedFilterControls: false,
    categorySelectorState: {
      selections: [],
      onApplyAction: {}
    },
    multiSelections: []
  }

  // This is only needed to reflect changes made to crossfilters from charts
  static getDerivedStateFromProps(props, state) {
    if (props.newlyCreated) {
      // Blanking the text field for newly created filters is a state-only fix right now since incomplete filters aren't
      // supported in omnifilters, so don't sync state to props in this case.
      return null
    }

    const newState = {}
    const { start, end, value } = getChildlessFilter(
      props.filterMetaData.filter,
      props.dataSource
    )
    if (start !== state.propsStart) {
      newState.start = start
      newState.propsStart = start
    }
    if (end !== state.propsEnd) {
      newState.end = end
      newState.propsEnd = end
    }
    if (value !== state.propsValue) {
      newState.value = value
      newState.propsValue = value
    }

    // I tried SO HARD to refactor away storing an isComplete flag in the state. But there's one case
    // where we need it. If you create an old chart crossfilter AND make it invalid, then it won't percolate
    // out to the chart to come back in with the updated invalid value. So we ~do~ need to store it, at least
    // as long as old-style charts exist. After they're gone, then the filterMetaData will just update with
    // changes and we can re-check its completeness. Sigh.
    newState.incomplete =
      state.incomplete !== undefined && isOldFilter(props.filterMetaData)
        ? state.incomplete
        : !checkFilterForCompleteness(props.filterMetaData.filter)

    if (Object.keys(newState).length) {
      return newState
    } else {
      return null
    }
  }

  constructor(props) {
    super(props)
    const { newlyCreated, filterMetaData } = this.props
    const { start, end, value, dataExpression } = getChildlessFilter(
      filterMetaData.filter,
      props.dataSource
    )
    const selectedOption = optionNameFromFilter(filterMetaData.filter)

    const selectedOptionInfo = getInfoForOption(
      selectedOption,
      this.props.filterMetaData.filter
    )

    this.state = {
      optionName: selectedOption,
      operator: selectedOptionInfo && selectedOptionInfo.operator,
      start: newlyCreated ? "" : start,
      end: newlyCreated ? "" : end,
      value: newlyCreated ? "" : value,
      menuIsOpen: false,
      focusedField: null,
      timeModalIsOpen: false,
      highlighted: false,
      editingColumn: dataExpression === null,
      columnSearchText: ""
    }

    this.dataTableRef = React.createRef()
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentDidUpdate(prevProps, prevState) {
    const { optionName } = this.state
    const { filterMetaData } = this.props

    // Autosubmit if we change operator. Don't do it if selecting "Custom
    // selection"--the user still needs to select values.
    if (
      optionName !== prevState.optionName &&
      optionName !== multiSelect.name
    ) {
      this.submitFilterUpdate()
    }

    if (
      this.props.newlyCreated &&
      checkFilterForCompleteness(filterMetaData.filter)
    ) {
      this.removeFromNewlyCreated()
    }
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  // Includes validation for currently entered values.
  // May be bypassed for filters that do not require validation, currently the "custom selection" option
  submitFilterUpdate() {
    /* this is quicklky becoming a ball of mud.
      Here's the logic - keep track of if it's enabled, so we know to toggle it later.

      Previously, we'd attempt to prevent invalid filters from hitting redux. Now we embrace
      it and allow it. If it's currently invalid (not complete or not all fields valid), then
      we're gonna disable it.

      Otherwise, if it's now valid toggle it on if it was previously incomplete.

      March on. Next, we need to save and update the filter - but be careful! The user could
      do horrible things like type in an "A" in a numeric field. THAT we don't actually want to
      save in redux, so instead we remap all invalid fields to nulls.

      And then it magically works.
    */

    const { value, start, end, optionName } = this.state
    const updatedFilter = updatedFilterFromOption(
      optionName,
      this.props.filterMetaData.filter,
      {
        value: this.isValid("value", value) ? value : null,
        start: this.isValid("start", start) ? start : null,
        end: this.isValid("end", end) ? end : null
      }
    )

    this.updateFilter(updatedFilter)
  }

  updateFilter(updatedFilter) {
    const { filterMetaData } = this.props
    const wasComplete =
      this.isComplete(filterMetaData.filter) &&
      this.allFieldsValid(filterMetaData.filter)
    const isComplete =
      this.isComplete(updatedFilter) && this.allFieldsValid(updatedFilter)

    let enabled = filterMetaData.enabled

    if (!wasComplete && isComplete) {
      this.removeFromNewlyCreated()
      enabled = true
    } else if (!isComplete) {
      enabled = false
    }

    // update the state to store isComplete, and then when it's done, update the filter
    this.setState({ incomplete: !isComplete }, async () => {
      await this.props.updateFilter(
        updatedFilter,
        this.props.filterMetaData.name,
        enabled
      )
      if (enabled !== filterMetaData.enabled) {
        this.toggleFilter(enabled)
      }
    })
  }

  // Time modal does not update FilterComponent state on change, but
  // submitFilterUpdate pulls from state to submit, so set state before submit
  submitTimeFilter = (updatedValues) => {
    this.setState(
      {
        ...updatedValues,
        timeModalIsOpen: false
      },
      this.submitFilterUpdate
    )
  }

  submitMultiSelectFilter = (values = []) => {
    const { filterMetaData } = this.props

    // first thing we do is rip out any nulls that may be in there. This ensures we don't do something like
    // send in ["American Airlines", null]. We'd just want "American Airlines"
    values = values.filter((c) => c !== null)

    // but if we then have no values (either we were given nothing, or we filtered it all out), stick a null sentinel back in
    if (!values.length) {
      values = [null]
    }

    this.updateFilter(
      multiSelectFilterFromValues(filterMetaData.filter, values)
    )
  }

  removeMultiSelectValue = (value) => {
    const newValues = getOrFilterValues(
      this.props.filterMetaData.filter
    ).filter((selection) => selection !== value)

    this.submitMultiSelectFilter(newValues)
  }

  isComplete(filter) {
    const { filterMetaData } = this.props
    const { filterType } = getChildlessFilter(filter, this.props.dataSource)

    // Make sure to return true for our "always complete" conditions first,
    // as these cases will fail some of the below checks. For example,
    // the EMPTY_COHORT filter type will not have a dataExpression.
    const alwaysComplete =
      filterMetaData.cohortDimension ||
      filterMetaData.appliesTo === "CROSSFILTER" ||
      filterType === FILTER_TYPE_SQL

    if (alwaysComplete) {
      return true
    } else {
      return checkFilterForCompleteness(filter)
    }
  }

  allFieldsValid = (filter) => {
    const selectedOptionInfo = getInfoForOption(this.state.optionName, filter)
    if (!selectedOptionInfo) {
      return true
    }

    const args = selectedOptionInfo.args

    if (selectedOptionInfo.filterType === FILTER_TYPE_OR) {
      return true // no way to enter invalid values currently
    }

    return args.every((arg) => this.isValid(undefined, this.state[arg]))
  }

  onMenuOpen = () => {
    this.setState({ menuIsOpen: true })
  }

  onMenuClose = () => {
    this.setState({ menuIsOpen: false })
  }

  onFocus = (fieldName, val) => {
    this.setState({ focusedField: fieldName })
    this.updateAutosuggest(val)
  }

  // only update local state on text change
  onChange = (fieldName, rawVal, shouldSubmit = false) => {
    const value = rawVal && rawVal.length ? rawVal : null
    this.updateAutosuggest(value)
    this.setState({ [fieldName]: value }, shouldSubmit ? this.onBlur : noop)
  }

  onBlur = () => {
    this.setState({ focusedField: null })
    this.submitFilterUpdate()
  }

  setRef = (node) => {
    this.filterContainerRef = node
  }

  closeColumnEditor = () => {
    const { dataExpression } = getChildlessFilter(
      this.props.filterMetaData.filter,
      this.props.dataSource
    )

    // Only allow closing column editor if user is editing a complete filter--
    // prevent closing column editor when it's the zero state.
    if (dataExpression) {
      this.setState({ editingColumn: false })
    }
  }

  handleClickOutside = (e) => {
    if (
      this.filterContainerRef &&
      !this.filterContainerRef.contains(e.target)
    ) {
      this.closeColumnEditor()
    }
  }

  updateAutosuggest = (val = this.state.value) => {
    const {
      columns,
      dataSources,
      filterMetaData,
      getAutosuggestResults
    } = this.props
    const { dataExpression, value, dataType } = getChildlessFilter(
      filterMetaData.filter
    )

    if (
      shouldShowAutosuggest(filterMetaData.filter, this.state.optionName, {
        columns,
        dataSources
      })
    ) {
      const filterBySearchTerm = val !== value && isStringType(dataType)
      getAutosuggestResults({
        dataSource: this.props.dataSource,
        column: dataExpression,
        searchTerm: filterBySearchTerm ? val : "",
        excludeFilter: filterMetaData.name
      })
    }
  }

  onOptionChange = (option) => {
    const selectedOptionInfo = getInfoForOption(
      option,
      this.props.filterMetaData.filter
    )
    this.setState({
      optionName: option,
      operator: selectedOptionInfo.operator,
      menuIsOpen: false
    })
  }

  // keeping fieldName around for future per-field validation indicator that we punted on
  isValid = (fieldName, val) => {
    let filter = this.props.filterMetaData.filter
    if (filter.filterType === FILTER_TYPE_MULTISOURCE) {
      filter = filter.filtersByDataSource[this.props.dataSource]
    }
    return isFilterValueValid(val, filter)
  }

  onAutosuggestClick = (fieldName, value) => {
    this.onChange(fieldName, String(value), true)
  }

  removeFilter = () => {
    if (this.props.newlyCreated) {
      this.removeFromNewlyCreated()
    }

    this.props.removeFilter(this.props.filterMetaData)
    this.props.dehighlightCharts(this.props.chartIds)
  }

  manuallyToggleFilter = () => {
    if (
      !this.isComplete(this.props.filterMetaData.filter) ||
      !this.allFieldsValid(this.props.filterMetaData.filter)
    ) {
      return
    }

    this.toggleFilter()
  }

  toggleFilter = (enabled = undefined) => {
    this.props.toggleFilter(this.props.filterMetaData, enabled)
  }

  toggleFilterCaseSensitiveMode = () => {
    const {
      filterMetaData: { filter = {} }
    } = this.props

    filter.caseSensitive = !filter.caseSensitive
    this.updateFilter(filter)
  }

  toggleFilterSimpleMode = (simpleModeEnabled = undefined) => {
    this.props.toggleFilterSimpleMode(
      this.props.filterMetaData,
      simpleModeEnabled
    )
  }

  removeFromNewlyCreated = () => {
    this.props.removeFromNewlyCreated(this.props.filterMetaData.name)
  }

  onClickTime = () => {
    this.setState({ timeModalIsOpen: true })
  }

  onCancelTimeModal = () => {
    this.setState({ timeModalIsOpen: false })
  }

  openCustomSQLModal = () => {
    const sqlFilter = this.getExistingFilterData(true)
    if (sqlFilter.sharedCustom || sqlFilter.globalCustom) {
      this.props.editParameterizedCustomSQL({
        customSelectorValue: sqlFilter.sql,
        activeDataSource: sqlFilter.dataSource,
        chartId: this.props.chartId,
        layerId: this.props.layerId,
        customSQLType: sqlFilter.sharedCustom
          ? CustomSQLTypes.CUSTOM_SQL_EDIT_SHARED
          : CustomSQLTypes.CUSTOM_SQL_EDIT_GLOBAL,
        filter: sqlFilter
      })
    } else {
      this.props.openCustomSQLFilterModal(
        sqlFilter,
        this.props.newlyCreated ||
          (!checkFilterForCompleteness(this.props.filterMetaData.filter) &&
            !this.props.filterMetaData.enabled)
      )
    }
  }

  openColumnEditor = () => {
    this.setState({ editingColumn: true })
  }

  setColumnSearchText = (value) => {
    this.setState({ columnSearchText: value })
  }

  onClickDataExpression = () => {
    // Don't allow editing the column on filters from charts
    if (
      this.props.filterMetaData.cohortDimension ||
      this.props.filterMetaData.appliesTo === "CROSSFILTER"
    ) {
      return
    }

    const { filterType } = getChildlessFilter(
      this.props.filterMetaData.filter,
      this.props.dataSource
    )

    if (filterType === FILTER_TYPE_SQL) {
      this.openCustomSQLModal()
    } else {
      this.openColumnEditor()
    }
  }

  onMouseEnter = () => {
    if (this.props.chartIds && this.props.chartIds.length) {
      this.props.highlightCharts(this.props.chartIds)
    }
  }

  onMouseLeave = () => {
    if (this.props.chartIds && this.props.chartIds.length) {
      this.props.dehighlightCharts(this.props.chartIds)
    }
  }

  onCohortOptionChange = (option) => {
    const { filter, cohortDimension, name } = this.props.filterMetaData
    const negated = option === cohortExclude.name

    this.props.updateCohort({ ...cohortDimension, negated }, filter, name)
    this.setState({ menuIsOpen: false })
  }

  openCategorySelectionModal = () => {
    const { dataSource, dataExpression } = getChildlessFilter(
      this.props.filterMetaData.filter,
      this.props.dataSource
    )

    this.props.openCategorySelectionModal(
      dataSource,
      dataExpression,
      {
        type: OnApplyActionTypes.APPLY_TO_FILTER,
        filterName: this.props.filterMetaData.name
      },
      getOrFilterValues(this.props.filterMetaData.filter)
    )
  }

  isExtractFilter() {
    const {
      filterMetaData: { filter = {} }
    } = this.props
    const isMultiSourceFilterWithExtractTypes =
      filter.filterType === FILTER_TYPE_MULTISOURCE &&
      Object.values(filter.filtersByDataSource || {}).every((f) => f.extract)
    return filter.extract || isMultiSourceFilterWithExtractTypes
  }

  renderOperatorSection(selectedOptionInfo) {
    const {
      filterMetaData,
      columns,
      dataSources,
      isReadOnly,
      autosuggestResults,
      categorySelectorState
    } = this.props
    if (filterMetaData && filterMetaData.cohortDimension) {
      return (
        <React.Fragment>
          <FilterOperatorSelector
            isCohort
            optionName={optionNameFromCohortFilter(filterMetaData)}
            menuIsOpen={this.state.menuIsOpen}
            onMenuOpen={this.onMenuOpen}
            onMenuClose={this.onMenuClose}
            onMenuSelect={this.onCohortOptionChange}
            options={cohortOptions}
            filterMetaData={filterMetaData}
          />
          <FilterCohortDisplay
            filterMetaData={filterMetaData}
            onClickCohortName={
              !this.props.hideAdvancedFilterControls && this.openColumnEditor
            }
          />
        </React.Fragment>
      )
    }

    // So. The UX for these multiselection/"custom selection"/OR filters does exist, so we do get a selectedOption,
    // but updateFilterX also needs to be modified to update those filters before we can take out this exception
    const isUnsupportedCrossfilter =
      selectedOptionInfo &&
      selectedOptionInfo.name === "MULTI" &&
      filterMetaData.appliesTo === "CROSSFILTER"

    if (!selectedOptionInfo || isUnsupportedCrossfilter) {
      return (
        <FilterSqlBox
          filterMetaData={filterMetaData}
          minHeight={MIN_SQL_RESIZE_HEIGHT}
        />
      )
    }

    /* For crossfilters, we want to edit the value, but not change the type in the dropdown, so we disable the menu only
       That's the menuIsDisabled param. */

    return (
      <FilterOperatorSelector
        name={filterMetaData.name}
        optionName={this.state.optionName}
        start={this.state.start}
        end={this.state.end}
        value={this.state.value === null ? "" : this.state.value}
        operator={this.state.operator}
        menuIsOpen={this.state.menuIsOpen}
        isDisabled={isReadOnly}
        menuIsDisabled={filterMetaData.appliesTo === "CROSSFILTER"}
        onMenuOpen={this.onMenuOpen}
        onMenuClose={this.onMenuClose}
        onMenuSelect={this.onOptionChange}
        onBlur={this.onBlur}
        onChange={this.onChange}
        options={optionsForDataType(
          filterMetaData.filter,
          { dataSources, columns },
          this.state.optionName === noneSelected.name
        )}
        autosuggestResults={autosuggestResults}
        autosuggestField={
          shouldShowAutosuggest(filterMetaData.filter, this.state.optionName, {
            dataSources,
            columns
          }) && this.state.focusedField
        }
        onFocus={this.onFocus}
        updateAutosuggest={this.updateAutosuggest}
        onAutosuggestClick={this.onAutosuggestClick}
        toggleCaseSensitive={this.toggleFilterCaseSensitiveMode}
        isTime={typeCategory(filterMetaData.filter) === TYPE_CATEGORIES.TIME}
        isExtract={this.isExtractFilter()}
        onClickTime={this.onClickTime}
        isMultiSelect={this.state.optionName === multiSelect.name}
        submitMultiSelectFilter={this.submitMultiSelectFilter}
        multiSelections={getOrFilterValues(filterMetaData.filter)}
        removeMultiSelectValue={this.removeMultiSelectValue}
        openCategorySelectionModal={this.openCategorySelectionModal}
        categorySelectorState={categorySelectorState}
        filterMetaData={filterMetaData}
      />
    )
  }

  renderRemoveButton() {
    return this.props.removeFilter && !this.props.hideAdvancedFilterControls ? (
      <div className="filter-button" onClick={this.removeFilter}>
        <Icon
          icon="close"
          className="filter-component-delete"
          data-testid="filter-component-delete"
        />
      </div>
    ) : null
  }

  // Gather info needed when editing an existing filter through an outside
  // interface (custom SQL or the column editor)
  getExistingFilterData(creatingSqlFilter) {
    const {
      dataType,
      dataSource,
      dataTypeIsArray,
      filterType
    } = getChildlessFilter(
      this.props.filterMetaData.filter,
      this.props.dataSource
    )

    const {
      chartId,
      layerId,
      sharedCustom,
      globalCustom,
      appliesTo
    } = this.props.filterMetaData
    const { start, end, value, optionName } = this.state

    if (filterType === FILTER_TYPE_SQL || creatingSqlFilter) {
      return {
        ...this.props.filterMetaData.filter,
        name: this.props.filterMetaData.name,
        // Filter type doesn't need to be set here if we're editing an existing
        // custom SQL filter, but jf editing from a standard to a custom SQL
        // filter, explicitly pass filterType to show the correct modal UI.
        filterType: FILTER_TYPE_SQL,
        chartId,
        layerId,
        sharedCustom,
        globalCustom,
        appliesTo
      }
    }

    return {
      dataType,
      dataSource,
      start,
      end,
      value,
      name: this.props.filterMetaData.name,
      optionName,
      newlyCreated: this.props.newlyCreated,
      dataTypeIsArray,
      chartId,
      layerId,
      sharedCustom,
      globalCustom,
      appliesTo
    }
  }

  renderColumnEditor() {
    const existingFilterData = this.getExistingFilterData()

    // don't overwrite newlyCreated blank state
    if (
      !this.isComplete(this.props.filterMetaData.filter) &&
      !this.props.newlyCreated
    ) {
      existingFilterData.overwrite = true
    }

    return (
      <FilterColumnEditor
        allDataSources={this.props.dataSources}
        dataTypeFilter={
          // If editing a cohort filter, only allow switching between cohorts.
          // This is purely for dev quality of life.
          this.props.filterMetaData.cohortDimension
            ? isSupportedTypeForCohortFilter
            : this.props.dataTypeFilter
        }
        dataTableRef={this.dataTableRef}
        canSelectDataSource={false}
        allowedDataSources={[this.props.dataSource]}
        columnSelectAction={this.props.columnSelectAction}
        dataSourcesList={[this.props.dataSource]}
        existingFilterData={existingFilterData}
        searchValue={this.state.columnSearchText}
        openCustomSQLModal={
          this.props.openCustomSQLFilterModal && this.openCustomSQLModal
        }
        shouldAutoEnable={
          !checkFilterForCompleteness(this.props.filterMetaData.filter) &&
          !this.props.filterMetaData.enabled
        }
        customSqlMetadata={this.props.customSqlMetadata}
      />
    )
  }

  render() {
    const {
      filterMetaData,
      newlyCreated,
      useSimpleFilter,
      dataSource,
      dataSources,
      columns
    } = this.props
    const {
      start,
      end,
      value,
      isRelative,
      filterType,
      dataExpression
    } = getChildlessFilter(filterMetaData.filter, dataSource)
    const selectedOptionInfo = getInfoForOption(
      this.state.optionName,
      filterMetaData.filter
    )
    const filterDisplayName = buildDisplayName(
      filterMetaData,
      !selectedOptionInfo,
      dataSource
    )

    let filterComponent = (
      <div
        className="filter-component"
        data-testid="filter-component"
        onClick={() => this.props.onTouchCallback(filterMetaData.name)}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <div>
          <div
            className={cx("filter-container", {
              "newly-created-filter":
                newlyCreated && this.props.isLastTouchedFilter
            })}
            ref={this.setRef}
          >
            <FilterTitleBar
              onClick={this.onClickDataExpression}
              enabled={filterMetaData.enabled}
              incomplete={
                !checkFilterForCompleteness(filterMetaData.filter) ||
                this.state.incomplete
              }
              onClickToggle={this.manuallyToggleFilter}
              onClickSimpleModeIcon={this.toggleFilterSimpleMode}
              simpleModeEnabled={filterMetaData.simpleModeEnabled}
              hideAdvancedFilterControls={this.props.hideAdvancedFilterControls}
              showSimpleModeIcon={this.props.showSimpleModeIcon}
              classNames={selectedOptionInfo ? "" : "sql"}
              displayName={filterDisplayName}
              dataTableRef={this.dataTableRef}
              onClickRemove={this.props.removeFilter && this.removeFilter}
              showRemoveIcon={Boolean(this.props.removeFilter)}
              editingColumn={this.state.editingColumn}
              columnSearchText={this.state.columnSearchText}
              setColumnSearchText={this.setColumnSearchText}
            />
            {this.renderRemoveButton()}
            {this.state.editingColumn
              ? this.renderColumnEditor()
              : this.renderOperatorSection(selectedOptionInfo)}
          </div>
        </div>
      </div>
    )

    if (useSimpleFilter) {
      filterComponent = (
        <SimpleFilter
          isFilterIncomplete={this.state.incomplete}
          filterMetaData={filterMetaData}
          filterDisplayName={filterDisplayName}
          filterType={filterType}
          filterOperatorInfo={selectedOptionInfo}
          textInputValue={this.state.value}
          textInputStartValue={this.state.start}
          textInputEndValue={this.state.end}
          shouldShowAutosuggest={shouldShowAutosuggest(
            filterMetaData.filter,
            this.state.optionName,
            {
              dataSources,
              columns
            }
          )}
          autosuggestResults={this.props.autosuggestResults}
          getAutosuggestResults={this.props.getAutosuggestResults}
          clearAutosuggestResults={this.props.clearAutosuggestResults}
          toggleFilter={this.manuallyToggleFilter}
          updateFilter={this.onChange}
          updateCohort={this.onCohortOptionChange}
          submitFilter={this.onBlur}
          submitMultiSelectFilter={this.submitMultiSelectFilter}
          openTimePicker={this.onClickTime}
          dataSource={dataSource}
          column={dataExpression}
        />
      )
    }

    return (
      <>
        {filterComponent}
        {this.state.timeModalIsOpen && (
          // Start/end values need validity checks to throw out bogus values
          // from relative filters when switching to a standard time filter
          <FilterTimeModal
            start={this.isValid("start", start) ? start : Date.now()}
            end={this.isValid("end", end) ? end : Date.now()}
            value={this.isValid("value", value) ? value : Date.now()}
            selectedOptionArgs={selectedOptionInfo.args}
            submitTimeFilter={this.submitTimeFilter}
            onCancel={this.onCancelTimeModal}
            resetStartEndValues={isRelative}
            momentFormat={"MMM DD YYYY HH:mm:ss:SSS"}
            overlay
          />
        )}
      </>
    )
  }
}

const mapStateToProps = ({ columnValues }, { dataSource, filterMetaData }) => {
  const { dataExpression } = getChildlessFilter(filterMetaData.filter)

  const columnData =
    (columnValues &&
      columnValues[dataSource] &&
      columnValues[dataSource][dataExpression]) ||
    {}

  return {
    autosuggestResults: columnData.distinctValues || []
  }
}

const mapDispatchToProps = (dispatch) => ({
  getAutosuggestResults: ({
    dataSource,
    column,
    searchTerm,
    limit,
    excludeFilter
  }) => {
    dispatch(
      getDistinctColumnValues({
        dataSource,
        column,
        searchTerm,
        limit,
        excludeNulls: true,
        ignoredDashboardFilters: [excludeFilter]
      })
    )
  },
  clearAutosuggestResults: (dataSource, column) => {
    dispatch(clearDistinctColumnValues(dataSource, column))
  }
})

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
  customSqlMetadata: [
    ...getParameterizedCustomSqlMetadata(
      ownProps.dataSource,
      ParameterTypes.CUSTOM_FILTER,
      parameterDefinitionToFilterMetadata
    ),
    ...getParameterizedCustomSqlMetadata(
      ownProps.dataSource,
      ParameterTypes.GLOBAL_FILTER,
      parameterDefinitionToFilterMetadata
    )
  ]
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(FilterComponent)
