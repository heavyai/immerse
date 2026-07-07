// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { CohortSnackbar } from "./components/cohort-snackbar"
import cx from "classnames"
import "@rmwc/list/collapsible-list.css"
import { SecondaryButton } from "widgets/button/Button"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import "@rmwc/icon/icon.css"
import "@rmwc/tooltip/tooltip.css"

import { redrawAll } from "actions/dc-action-creators"

import * as filterActions from "vega/actions/filter-action-creators"
import { isOldFilter } from "vega/constants/filter-metadata-types"
import { hasNonBoundingBoxNonGeoJoinFilter } from "vega/utils/filter"

import {
  highlightCharts,
  dehighlightCharts,
  toggleChartFilters
} from "actions/charts-action-creators"
import { updateChart } from "actions/update-chart-action-creator"

import { setChartFilters } from "actions/charts-filter-action-creators"
import { FILTER_TYPE_SIMPLE } from "vega/constants/filter-type-constants"

import {
  addFilterToFilterSet,
  makeCohortFromSelectedFilterSet,
  setFilterSetDimension,
  setCohortAggregateFilter,
  removeCohortAggregateFilter,
  clearDashboardFiltersFromFilterSet,
  toggleCohortAggregateFilter,
  setCohortAggregateFilterValidity
} from "../filter-sets-action-creators"

import { deleteCohort, deleteAllCohorts } from "../cohorts-action-creators"

import { getFilterSets, getSelectedFilterSet } from "../filter-sets-selectors"

import { makeFilterValidator } from "../filter-selectors"

import {
  openCustomSQLFilterModal,
  editParameterizedCustomSQLSelector
} from "components/custom-sql-manager/custom-sql-manager-actions"

import { showCohortBuilderModal } from "components/cohort-builder/cohort-builder-actions"

import {
  SWITCH_SELECTED_DASHBOARD_COHORT,
  SUBMIT_COHORT_AGGREGATE_FILTER,
  SUBMIT_DASHBOARD_FILTER
} from "components/new-filters/filter-component/filter-column-editor-actions"

import {
  unsetFilterNewlyCreated,
  setFilterPanelViewMode,
  setFilterNewlyCreated
} from "components/new-filters/filters-actions"

import {
  openCategorySelectionModal,
  makeCategorySelection,
  CategorySelectionsPropType
} from "actions/category-selection-modal-action-creators"

import IconSimpleFilters from "components/svg-icons/icon-simple-filters"
import {
  updateFilterX,
  deleteFilterX,
  toggleFilterX
} from "vega/actions/filter-action-creators-crossfilter-interop"

import "./filter-panel.scss"

import { CollapsibleList } from "@rmwc/list"
import { List } from "widgets/list/List"
import Filter from "../filter-component/filter-component"
import AggregateFilter from "../filter-component/aggregate-filter-component"
import DataSourceHeader from "./components/data-source-header"
import AddFilterButtonContainer from "./components/add-filter-button-container"
import SectionTitle from "components/dashboard-config-panel/components/section-title"
import FilterPanelModeToggle from "components/new-filters/filter-panel/components/filter-panel-mode-toggle"
import CohortNameInput from "./components/cohort-name-input"

import {
  getActiveDataSources,
  getFiltersInCurrentFilterSetByDataSource
} from "utils/currently-active-datasources"

import { FILTER_PANEL_VIEWS } from "./constants"
import {
  optionNameFromFilter,
  getChildlessFilter
} from "../filter-component/filter-component-options"

import { isSupportedTypeForDashboardFilter } from "components/new-filters/filter-component/data-type-filters"
import { getTablesForDataSource } from "components/join-manager/utils"

// eslint-disable-next-line react/prefer-stateless-function
class FilterPanel extends PureComponent {
  static propTypes = {
    filters: PropTypes.object,
    actions: PropTypes.objectOf(PropTypes.func),
    selectedFilterSet: PropTypes.shape({
      dimensions: PropTypes.object,
      filters: PropTypes.arrayOf(PropTypes.string),
      id: PropTypes.string,
      name: PropTypes.string,
      selected: PropTypes.bool
    }),
    filterSets: PropTypes.object,
    dataSources: PropTypes.arrayOf(PropTypes.string),
    addFilterToFilterSet: PropTypes.func,
    setFilterSetDimension: PropTypes.func,
    categorySelectorState: CategorySelectionsPropType,
    newlyCreatedFilters: PropTypes.object,
    dataSourcesFull: PropTypes.object,
    cohorts: PropTypes.object,
    charts: PropTypes.object,
    filterValidator: PropTypes.func,
    viewMode: PropTypes.oneOf([
      FILTER_PANEL_VIEWS.FILTER_SETS,
      FILTER_PANEL_VIEWS.COHORT_BUILDER
    ])
  }

  /* When a filter is FIRST added, we want to briefly flash its
     border in blue. But we only want to do it once - after the user has interacted with any
     filter in any way (clicking on it or adding a new one), we never want to flash it again.

     So. We keep track of the filters we've previously seen. When the props come in, we look
     at the list of filters and compare it against the last set of filters (which we're holding in
     our state). If there are any filters we haven't seen (and there should never be more than one),
     then that's our last added filter. So we flag it as being lastTouched.

     Later, that's handed to the filter-component to help determine if it should show the blue pulse
     animation. Once that filter (or any other filter) is clicked, then we fire a callback to here which
     sets the lastTouchedFilter to undefined. That way, we'll never show the animation again, and it
     only turns on for the next filter when it comes in through here and is new. Ta da.
  */
  static getDerivedStateFromProps = (props, state) => {
    const newFilters = Object.values(props.filters).reduce((nf, dsFilters) => {
      const filterNames = dsFilters.map((f) => f.name)
      nf.push(...filterNames)
      return nf
    }, [])
    const oldFilters = state.oldFilters || []

    const newState = {
      ...state,
      oldFilters: newFilters
    }

    const unseenFilters = newFilters.filter((f) => !oldFilters.includes(f))

    if (unseenFilters.length) {
      newState.lastTouchedFilter = unseenFilters[0]
    }

    return newState
  }

  state = {
    cohortSnackbar: false,
    cohortApplied: false
  }

  componentDidMount() {
    // we don't have a way to delete cohorts, and that's awful. We *need* some way to
    // get rid of them. And until we have an interface for it, we'll expose a couple of
    // functions in the console to do it. Delete these lines when we have a real interface.
    window.deleteCohort = this.props.actions.deleteCohort
    window.deleteAllCohorts = this.props.actions.deleteAllCohorts

    this.preventEmptySimpleModeView()
  }

  componentDidUpdate(prevProps) {
    // avoid opening to cohort builder when switching to a filter set with no dimension selected
    if (this.props.viewMode === FILTER_PANEL_VIEWS.COHORT_BUILDER) {
      const { selectedFilterSet } = this.props
      if (
        selectedFilterSet &&
        prevProps.selectedFilterSet &&
        prevProps.selectedFilterSet.id !== selectedFilterSet.id
      ) {
        const dimensions =
          selectedFilterSet.dimensions &&
          Object.keys(selectedFilterSet.dimensions)
        if (!dimensions.length) {
          this.changeViewMode(FILTER_PANEL_VIEWS.FILTER_SETS)
        }
        // when current filter set is deleted
      } else if (!selectedFilterSet) {
        this.changeViewMode(FILTER_PANEL_VIEWS.FILTER_SETS)
      }
    }

    this.preventEmptySimpleModeView()
  }

  componentWillUnMount() {
    window.deleteCohort = () =>
      // eslint-disable-next-line no-console
      console.log("Please open the filter panel to delete a cohort")
    window.deleteAllCohorts = () =>
      // eslint-disable-next-line no-console
      console.log("Please open the filter panel to delete a cohort")
  }

  preventEmptySimpleModeView() {
    if (
      // We don't want to show the simple filter panel if there are no
      // simple filters enabled for the filter set
      !this.props.filterSetHasSimpleFilters &&
      !this.props.showAdvancedFilterControls
    ) {
      this.props.toggleAdvancedFilterControls(true)
    }
  }

  updateFilter = async (filter, name, enabled) => {
    // updateFilter is called with the filter object, but we need to look to the filter meta data
    // to know whether it's a crossfilter or a dashboard filter.
    // our filter data is stuffed into our dataSources array, so we look through our sources and
    // then through our filters until we find the matching one. Then we break out of both loops
    // and call the appropriate action depending upon the filter's type.
    // This is a -prime- candidate for refactoring into something without as much hoop jumping.
    let filterMetadata = undefined
    for (const dataSource of this.props.dataSources) {
      if (this.props.filters[dataSource]) {
        filterMetadata = this.props.filters[dataSource].find(
          (fmd) => fmd.name === name
        )
        if (filterMetadata !== undefined) {
          break
        }
      }
      if (filterMetadata !== undefined) {
        break
      }
    }

    if (filterMetadata.appliesTo === "CROSSFILTER") {
      if (isOldFilter(filterMetadata)) {
        await this.props.actions.toggleFilterX(name, enabled)
        await this.props.actions.updateFilterX(filter, name)
      } else {
        await this.props.actions.toggleFilterByName(name, enabled)
        await this.props.actions.updateFilterByName(name, filter)
      }
    } else {
      await this.props.actions.setDashboardFilter(
        filter,
        name,
        undefined,
        undefined,
        enabled
      )
    }
  }

  updateCohort = (dimension, filter, name) => {
    this.props.actions.setDashboardCohort(dimension, filter, name)
  }

  toggleFiltersForDataSource = (dataSource, enabled) => {
    if (this.props.filters[dataSource]) {
      this.props.filters[dataSource].forEach((filter) => {
        if (this.props.filterValidator(filter) === false) {
          return
        }
        this.toggleFilter(filter, enabled)
      })
    }
  }

  removeFilter = (filterMetaData) => {
    if (isOldFilter(filterMetaData)) {
      this.props.actions.deleteFilterX(filterMetaData.name)
    } else {
      this.props.actions.clearFilterByName(filterMetaData.name)
    }
  }

  unsetFilterNewlyCreated = (name) => {
    this.props.actions.unsetFilterNewlyCreated(name)
  }

  toggleFilter = (filterMetaData, enabled = undefined) => {
    if (isOldFilter(filterMetaData)) {
      this.props.actions.toggleFilterX(filterMetaData.name, enabled)
    } else {
      this.props.actions.toggleFilterByName(filterMetaData.name, enabled)
    }
  }

  toggleFilterSimpleMode = (filterMetaData, simpleModeEnabled = undefined) => {
    // TODO: Deal with old filters
    this.props.actions.toggleFilterSimpleModeByName(
      filterMetaData.name,
      simpleModeEnabled
    )
  }

  noteLastTouchedFilter = () => {
    this.setState({ lastTouchedFilter: undefined })
  }

  // when the user selects a name and "saves" their cohort. `clearDimension` is
  // used if we want to clear the dimension from the cohort builder
  applyCohort = (
    name,
    createNewFilterSet,
    replaceFilterSet,
    clearDimension
  ) => {
    const { dataSource } = this.getCohortBuilderState()
    const dataSourceTables = getTablesForDataSource(dataSource)
    this.setState({ cohortApplied: createNewFilterSet || replaceFilterSet })
    this.props.actions
      .makeCohortFromSelectedFilterSet(
        dataSource,
        dataSourceTables,
        name,
        createNewFilterSet,
        replaceFilterSet,
        clearDimension
      )
      .then(() => this.openCohortSnackbar())
    if (createNewFilterSet || replaceFilterSet) {
      this.changeViewMode(FILTER_PANEL_VIEWS.FILTER_SETS)
    }
  }

  addCohortAggregateFilter = () => {
    const { dataSource } = this.getCohortBuilderState()
    const blankAggregrateFilter = {
      filterType: FILTER_TYPE_SIMPLE,
      dataExpression: {
        value: null,
        function: null,
        type: "SimpleAggregateFilterDataExpression"
      },
      dataType: null,
      operator: ">=",
      dataSource
    }

    this.props.actions.setCohortAggregateFilter(blankAggregrateFilter)
  }

  updateCohortAggregateFilter = (filter, name) => {
    this.props.actions.setCohortAggregateFilter(filter, name)
  }

  removeCohortAggregateFilter = (name) => {
    this.props.actions.removeCohortAggregateFilter(name)
  }

  toggleCohortAggregateFilter = (name, enabled) => {
    this.props.actions.toggleCohortAggregateFilter(name, enabled)
  }

  setCohortAggregateFilterValidity = (name, valid) => {
    this.props.actions.setCohortAggregateFilterValidity(name, valid)
  }

  renderPostfilter = (filterMetaData) => {
    const { dataSource } = this.getCohortBuilderState()
    const columnMetadata = this.props.dataSourcesFull[dataSource].columnMetadata
    const { dataExpression } = getChildlessFilter(filterMetaData.filter)

    return (
      <AggregateFilter
        key={`${filterMetaData.name}-${dataExpression.value}`}
        filterMetaData={filterMetaData}
        updateFilter={this.updateCohortAggregateFilter}
        removeFilter={this.removeCohortAggregateFilter}
        toggleFilter={this.toggleCohortAggregateFilter}
        setFilterValidity={this.setCohortAggregateFilterValidity}
        columnMetaData={columnMetadata}
        columnSelectAction={SUBMIT_COHORT_AGGREGATE_FILTER}
        dataSource={dataSource}
      />
    )
  }

  renderFilterComponent(filterMetaData, i, dataSource) {
    const commonFilterProps = {
      filterMetaData,
      updateFilter: this.updateFilter,
      incomplete: !this.props.filterValidator(filterMetaData.name),
      dataSource,
      openCategorySelectionModal: this.props.actions.openCategorySelectionModal,
      categorySelectorState: this.props.categorySelectorState,
      onTouchCallback: this.noteLastTouchedFilter,
      isLastTouchedFilter: this.state.lastTouchedFilter === filterMetaData.name
    }

    if (filterMetaData.appliesTo === "GLOBAL") {
      const { dataExpression } = getChildlessFilter(filterMetaData.filter)
      return (
        <Filter
          {...commonFilterProps}
          useSimpleFilter={!this.props.showAdvancedFilterControls}
          showSimpleModeIcon={
            this.props.viewMode === FILTER_PANEL_VIEWS.FILTER_SETS
          }
          hideAdvancedFilterControls={!this.props.showAdvancedFilterControls}
          key={`${filterMetaData.name}-${dataExpression}-{i}`}
          removeFilter={this.removeFilter}
          toggleFilter={this.toggleFilter}
          toggleFilterSimpleMode={this.toggleFilterSimpleMode}
          newlyCreated={this.props.newlyCreatedFilters[filterMetaData.name]}
          removeFromNewlyCreated={this.unsetFilterNewlyCreated}
          updateCohort={this.updateCohort}
          makeCategorySelection={this.props.actions.makeCategorySelection}
          dataSources={this.props.dataSourcesFull}
          columnSelectAction={
            filterMetaData.cohortDimension
              ? SWITCH_SELECTED_DASHBOARD_COHORT
              : SUBMIT_DASHBOARD_FILTER
          }
          dataTypeFilter={isSupportedTypeForDashboardFilter}
          openCustomSQLFilterModal={this.props.actions.openCustomSQLFilterModal}
          editParameterizedCustomSQL={
            this.props.actions.editParameterizedCustomSQLSelector
          }
        />
      )
    } else if (filterMetaData.appliesTo === "CROSSFILTER") {
      const { filter } = filterMetaData
      const chartIds = [filterMetaData.chartId]

      // We don't have user-editable interfaces for some filters created from charts. Transitioning between an editable to a non-editable filter triggers
      // an unwanted filter update, so add optionNameFromFilter (which will be undefined when we don't have an interface to edit that filter) to key.
      // Shouldn't create needless new instances as option names aren't editable for filters from charts otherwise.
      return (
        <Filter
          {...commonFilterProps}
          key={`${filterMetaData.name}-${optionNameFromFilter(filter)}-${i}`}
          removeFilter={
            hasNonBoundingBoxNonGeoJoinFilter(filterMetaData)
              ? this.removeFilter
              : undefined
          }
          toggleFilter={() =>
            this.toggleFilter(filterMetaData, !filterMetaData.enabled)
          }
          highlightCharts={this.props.actions.highlightCharts}
          dehighlightCharts={this.props.actions.dehighlightCharts}
          chartIds={chartIds}
        />
      )
    } else {
      return null
    }
  }

  renderSimpleFiltersMode(dataSources, filters, selectedFilterSet) {
    return (
      <div className="filter-panel-simple-mode" id="filter-panel-scroller">
        {dataSources.sort().map((dataSource) => {
          const dataSourceFilters = filters[dataSource] || []

          const simpleModeFilters = dataSourceFilters.filter(
            (filter) => filter.simpleModeEnabled
          )

          return (
            <List
              className="filter-panel-datasource-container"
              key={dataSource}
            >
              <CollapsibleList
                startOpen
                handle={
                  <DataSourceHeader
                    dataSource={dataSource}
                    dataSourceFilters={dataSourceFilters}
                    selectedFilterSet={selectedFilterSet}
                    toggleFiltersForDataSource={(enabled) => {
                      this.toggleFiltersForDataSource(dataSource, enabled)
                    }}
                  />
                }
              >
                <div className="filter-subsection panel-filters">
                  <div className="filter-component-container">
                    {simpleModeFilters
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((filterMetaData, i) =>
                        this.renderFilterComponent(
                          filterMetaData,
                          i,
                          dataSource
                        )
                      )}
                  </div>
                </div>
              </CollapsibleList>
            </List>
          )
        })}
      </div>
    )
  }

  // Render filters when we're viewing the "Filters" tab on the filter panel
  renderFilterSetViewMode(dataSources, filters, selectedFilterSet) {
    const showZeroSourceState = dataSources.length === 0

    const dataSourceSections = dataSources.sort().map((dataSource) => {
      const dataSourceFilters = filters[dataSource] || []

      const dashboardFilters = dataSourceFilters.filter(
        (filter) => filter.appliesTo === "GLOBAL"
      )
      const crossFilters = dataSourceFilters.filter(
        (filter) => filter.appliesTo === "CROSSFILTER"
      )
      return (
        <List className="filter-panel-datasource-container" key={dataSource}>
          <CollapsibleList
            startOpen
            handle={
              <DataSourceHeader
                showDashboardFilterDelete={
                  this.props.showAdvancedFilterControls
                }
                deleteDashboardFilters={() => {
                  this.props.actions.clearDashboardFiltersFromFilterSet(
                    selectedFilterSet.id,
                    dataSource
                  )
                }}
                dataSource={dataSource}
                dataSourceFilters={dataSourceFilters}
                dashboardFilters={dashboardFilters}
                selectedFilterSet={selectedFilterSet}
                toggleFiltersForDataSource={(enabled) => {
                  this.toggleFiltersForDataSource(dataSource, enabled)
                }}
              />
            }
          >
            <div
              className="filter-subsection panel-filters"
              data-testid="filter-panel-adv-filters"
            >
              {dataSource ? (
                <AddFilterButtonContainer
                  dataSource={dataSource}
                  setDashboardFilter={this.props.actions.setDashboardFilter}
                  setFilterNewlyCreated={
                    this.props.actions.setFilterNewlyCreated
                  }
                />
              ) : null}
              <div className="filter-component-container">
                {dashboardFilters
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((filterMetaData, i) =>
                    this.renderFilterComponent(filterMetaData, i, dataSource)
                  )}
              </div>
            </div>
            <div className="filter-subsection chart-filters">
              <CollapsibleList
                startOpen
                handle={
                  <SectionTitle
                    title={"Filters from charts"}
                    className="chart-filters"
                  />
                }
              >
                <div className="filter-component-container chart-filters">
                  {crossFilters
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((filterMetaData, i) =>
                      this.renderFilterComponent(filterMetaData, i, dataSource)
                    )}
                </div>
              </CollapsibleList>
            </div>
          </CollapsibleList>
        </List>
      )
    })
    return (
      <>
        {showZeroSourceState ? (
          <p
            className="filter-panel-no-source-error"
            data-testid="filter-panel-no-source-error"
          >
            <Icon icon="error" />
            Add a chart to start filtering
          </p>
        ) : null}
        <div id="filter-panel-scroller">{dataSourceSections}</div>
      </>
    )
  }

  // Render filters when we're viewing the "Create Cohort" tab on the filter panel
  renderCohortBuilderViewMode(filters, selectedFilterSet) {
    const { dataSource, dimension } = this.getCohortBuilderState()
    const dataSourceFilters = filters[dataSource] || []

    const dashboardFilters = dataSourceFilters.filter(
      (filter) => filter.appliesTo === "GLOBAL"
    )
    const crossFilters = dataSourceFilters.filter(
      (filter) => filter.appliesTo === "CROSSFILTER"
    )
    return (
      <>
        <div id="filter-panel-scroller">
          <List key={dataSource} className="filter-panel-datasource-container">
            <CollapsibleList
              startOpen
              handle={
                <DataSourceHeader
                  dataSource={dataSource}
                  cohortDimension={dimension}
                  dataSourceFilters={dataSourceFilters}
                  selectedFilterSet={selectedFilterSet}
                  toggleFiltersForDataSource={(enabled) => {
                    this.toggleFiltersForDataSource(dataSource, enabled)
                  }}
                  changeCohortDimension={() => {
                    this.props.actions.showCohortBuilderModal({
                      isEditing: true
                    })
                  }}
                />
              }
            >
              <div className="filter-subsection panel-filters">
                <AddFilterButtonContainer
                  currentDataSource={dataSource}
                  dataSource={dataSource}
                  setDashboardFilter={this.props.actions.setDashboardFilter}
                  setFilterNewlyCreated={
                    this.props.actions.setFilterNewlyCreated
                  }
                />
                <div className="filter-component-container">
                  {dashboardFilters
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((filterMetaData, i) =>
                      this.renderFilterComponent(filterMetaData, i, dataSource)
                    )}
                </div>
              </div>
              <div className="filter-subsection chart-filters">
                <CollapsibleList
                  startOpen
                  handle={
                    <SectionTitle
                      title={"Filters from charts"}
                      className="chart-filters"
                    />
                  }
                >
                  <div className="filter-component-container chart-filters">
                    {crossFilters
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((filterMetaData, i) =>
                        this.renderFilterComponent(
                          filterMetaData,
                          i,
                          dataSource
                        )
                      )}
                  </div>
                </CollapsibleList>
                <CollapsibleList
                  startOpen
                  handle={
                    <SectionTitle
                      title={"Cohort aggregate filters"}
                      className="chart-filters"
                    />
                  }
                >
                  <div className="filter-button-container">
                    <SecondaryButton
                      className={"inline-button"}
                      icon={"add"}
                      onClick={() => this.addCohortAggregateFilter()}
                      data-testid="add-cohort-aggregate-filter-button"
                    >
                      {"Add aggregate filter"}
                    </SecondaryButton>
                  </div>
                  <div className="filter-component-container postfilters">
                    {selectedFilterSet.cohortAggregateFilters &&
                      Object.values(selectedFilterSet.cohortAggregateFilters)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((filterMetaData) =>
                          this.renderPostfilter(filterMetaData)
                        )}
                  </div>
                </CollapsibleList>
              </div>
            </CollapsibleList>
          </List>
        </div>
        <CohortNameInput
          cohorts={this.props.cohorts}
          onApplyCohort={this.applyCohort}
        />
      </>
    )
  }

  getCohortBuilderState = () => {
    const filterSetDimensions = this.props.selectedFilterSet?.dimensions ?? {}

    const areBuildingCohort =
      Object.keys(filterSetDimensions).length > 0 &&
      Object.values(filterSetDimensions)[0]

    const dataSource = areBuildingCohort && Object.keys(filterSetDimensions)[0]
    const dimension = dataSource && filterSetDimensions[dataSource]

    return {
      areBuildingCohort,
      dataSource,
      dimension
    }
  }

  changeViewMode = (viewMode) => {
    const switchingToCohortBuilder =
      this.props.viewMode === FILTER_PANEL_VIEWS.FILTER_SETS &&
      viewMode === FILTER_PANEL_VIEWS.COHORT_BUILDER
    const { areBuildingCohort } = this.getCohortBuilderState()
    const startingNewCohort = switchingToCohortBuilder && !areBuildingCohort
    if (startingNewCohort) {
      // If we're starting a new cohort (switching to the cohort builder and we
      // haven't already started a cohort), open the data selection modal /
      // cohort dimension modal and run a callback once the user has selected a
      // cohort dimension. The callback sets the cohort dimension and THEN flips
      // to the cohort builder tab
      this.props.actions.showCohortBuilderModal()
    } else {
      this.props.actions.setFilterPanelViewMode(viewMode)
    }
  }
  openCohortSnackbar() {
    if (this.snackbarTimeout) {
      clearTimeout(this.snackbarTimeout)
    }

    const timeoutDelay = 3000
    this.setState({ cohortSnackbar: true }, () => {
      this.snackbarTimeout = setTimeout(this.closeCohortSnackbar, timeoutDelay)
    })
  }

  closeCohortSnackbar = () => {
    this.setState({ cohortSnackbar: false })
  }

  render() {
    const { dataSources, filters, selectedFilterSet = {} } = this.props

    const classNames = cx("dashboard-config-panel", "filter-panel", {
      "cohort-mode": this.props.viewMode === FILTER_PANEL_VIEWS.COHORT_BUILDER
    })

    let simpleFiltersTooltip = this.props.filterSetHasSimpleFilters
      ? "View simple filters"
      : "No simple filters enabled"
    if (this.props.viewMode === FILTER_PANEL_VIEWS.COHORT_BUILDER) {
      simpleFiltersTooltip = "Finish building your cohort to enable Simple Mode"
    }

    return (
      <div className={classNames} data-testid="filter-panel">
        <Tooltip
          enterDelay={500}
          content={
            this.props.showAdvancedFilterControls
              ? simpleFiltersTooltip
              : "View advanced filter options"
          }
        >
          <span
            className={cx("filter-panel-simple-mode-icon", {
              "is-simple-mode-on": !this.props.showAdvancedFilterControls,
              "is-disabled":
                !this.props.filterSetHasSimpleFilters ||
                this.props.viewMode === FILTER_PANEL_VIEWS.COHORT_BUILDER
            })}
            onClick={
              this.props.filterSetHasSimpleFilters &&
              this.props.viewMode === FILTER_PANEL_VIEWS.FILTER_SETS
                ? this.props.toggleAdvancedFilterControls
                : undefined
            }
            data-testid="filter-panel-simple-mode-toggle"
          >
            <IconSimpleFilters />
          </span>
        </Tooltip>
        <FilterPanelModeToggle
          viewMode={this.props.viewMode}
          changeViewMode={this.changeViewMode}
          showAdvancedFilterControls={this.props.showAdvancedFilterControls}
          disableCohortBuilder={dataSources.length === 0}
        />
        {this.props.showAdvancedFilterControls ? (
          <>
            {this.props.viewMode === FILTER_PANEL_VIEWS.FILTER_SETS
              ? this.renderFilterSetViewMode(
                  dataSources,
                  filters,
                  selectedFilterSet
                )
              : this.renderCohortBuilderViewMode(filters, selectedFilterSet)}
            {this.state.cohortSnackbar && (
              <CohortSnackbar cohortApplied={this.state.cohortApplied} />
            )}
          </>
        ) : (
          this.renderSimpleFiltersMode(dataSources, filters, selectedFilterSet)
        )}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const selectedFilterSet = getSelectedFilterSet(state)
  const selectedFilterIds = selectedFilterSet ? selectedFilterSet.filters : []

  const filters = state.omnifilters
    ? getFiltersInCurrentFilterSetByDataSource(state)
    : {}

  const simpleFiltersForSelectedFilterSet = state.omnifilters
    .filter(
      (f) =>
        selectedFilterIds.includes(f.name) || selectedFilterSet === undefined
    )
    .filter((f) => f.simpleModeEnabled)

  const filterSetHasSimpleFilters = simpleFiltersForSelectedFilterSet.length > 0

  // get active data sources for the current filter set
  const dataSources = getActiveDataSources(state, true)

  const filterSets = getFilterSets(state)

  const filterValidator = makeFilterValidator(state)

  return {
    filters,
    dataSources,
    selectedFilterSet,
    filterSetHasSimpleFilters,
    showAdvancedFilterControls: ownProps.showAdvancedFilterControls,
    filterSets,
    categorySelectorState: state.ui.categorySelector,
    newlyCreatedFilters: state.ui.filters.newlyCreated,
    cohorts: state.cohorts,
    charts: state.charts,
    dataSourcesFull: state.dashboard.dataSources,
    viewMode: state.ui.filterPanel.viewMode,
    filterValidator
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      ...filterActions,
      highlightCharts,
      dehighlightCharts,
      openCategorySelectionModal,
      addFilterToFilterSet,
      setFilterNewlyCreated,
      unsetFilterNewlyCreated,
      makeCohortFromSelectedFilterSet,
      clearDashboardFiltersFromFilterSet,
      setFilterSetDimension,
      updateChart,
      deleteCohort,
      deleteAllCohorts,
      makeCategorySelection,
      redrawAll,
      setChartFilters,
      toggleChartFilters,
      updateFilterX,
      deleteFilterX,
      toggleFilterX,
      setFilterPanelViewMode,
      setCohortAggregateFilter,
      removeCohortAggregateFilter,
      toggleCohortAggregateFilter,
      setCohortAggregateFilterValidity,
      openCustomSQLFilterModal,
      editParameterizedCustomSQLSelector,
      showCohortBuilderModal
    },
    dispatch
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(FilterPanel)
