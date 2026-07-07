// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import cx from "classnames"
import { Column } from "../../constants/data-selection-types"
import "./styles.scss"
import {
  unsetFilterNewlyCreated,
  setFilterNewlyCreated
} from "components/new-filters/filters-actions"
import {
  makeCategorySelection,
  openCategorySelectionModal,
  ApplyToFilterOptions,
  CategorySelectorSelections
} from "actions/category-selection-modal-action-creators"
import {
  editParameterizedCustomSQLSelector,
  openCustomSQLFilterModal
} from "components/custom-sql-manager/custom-sql-manager-actions"
import { SUBMIT_PREFILTER } from "components/new-filters/filter-component/filter-column-editor-actions"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import WhereFilter from "components/new-filters/filter-component/filter-component"
import {
  clearFilterByName,
  setChartFilter,
  setChartCohort,
  toggleFilterByName
} from "vega/actions/filter-action-creators"
import { Filter } from "../../constants/filter-types"
import {
  BaseFilterMetadata,
  CohortDimension,
  FilterMetadata
} from "vega/constants/filter-metadata-types"
import { simpleFilter } from "vega/constants/filter-types"
import { getChildlessFilter } from "components/new-filters/filter-component/filter-component-options"
import { isSupportedTypeForPrefilter } from "components/new-filters/filter-component/data-type-filters"
import { getDataSourcesForFilter } from "vega/utils/filter"

type OwnProps = {
  chartId: string
  layerId: string
  dataSource: string
  columns: Column[] | null
}

type StateProps = {
  layerFilters: BaseFilterMetadata[]
  categorySelector: CategorySelectorSelections
  newlyCreatedFilters: { name: boolean }
  dataSources: {
    [key: string]: {
      columnMetadata: Column[]
    }
  }
  actions?: {
    updateChartFilter(
      filter: Filter,
      chartId: string,
      layerId?: string,
      name?: string,
      valid?: boolean
    ): void
    updateChartCohort(
      dimension: CohortDimension,
      filter: Filter,
      chartId: string,
      layerId?: string,
      name?: string
    ): void
    removeChartFilter(name: string): void
    toggleChartFilter(name: string, enabled?: boolean): void
    openCategorySelection(): void
    unsetFilterNewlyCreated(name: string): void
    setFilterNewlyCreated(name: string): void
    makeCategorySelection(
      selectedCategories: string[],
      onApplyAction: ApplyToFilterOptions
    ): void
  }
}

type Props = StateProps & OwnProps

const PreFilterComponent: FC<Props> = ({
  actions,
  chartId,
  layerId,
  dataSource,
  columns,
  layerFilters,
  categorySelector,
  newlyCreatedFilters,
  dataSources
}) => {
  //  not doing anything to highlight the filter component now.
  //  We are not sure if we want the same hightlight behavior as global filter panel
  const [lastTouchedFilter, setLastTouchedFilter] = useState(undefined)

  const noteLastTouchedFilter = () => {
    setLastTouchedFilter(undefined)
  }

  const addChartFilter = () => {
    if (!dataSource) {
      return
    }

    // dataSource will be replaced with the filter columns table once it is selected
    // but we need to have something here to initialize
    actions.updateChartFilter(
      simpleFilter(dataSource, dataSource, null, null, null, null, {
        dataTypeIsArray: false
      }),
      chartId,
      layerId,
      undefined,
      false
    )
  }

  return (
    <>
      <div className="chart-editor-section-header">
        <div className="chart-editor-label">Filters</div>
      </div>
      <div className="pre-filter-container">
        {layerFilters.length > 0 &&
          layerFilters
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((filter) => (
              <WhereFilter
                key={`${filter.name}-${
                  getChildlessFilter(filter.filter).dataExpression
                }`}
                enabled={filter.enabled}
                name={filter.name}
                filterMetaData={filter}
                updateFilter={(updatedFilter, name, enabled) =>
                  actions.updateChartFilter(
                    updatedFilter,
                    chartId,
                    layerId,
                    name,
                    enabled
                  )
                }
                removeFilter={({ name }) => actions.removeChartFilter(name)}
                toggleFilter={({ name }, enabled) =>
                  actions.toggleChartFilter(name, enabled)
                }
                categorySelectorState={categorySelector}
                openCategorySelectionModal={actions.openCategorySelection}
                newlyCreated={newlyCreatedFilters[filter.name]}
                removeFromNewlyCreated={(name) =>
                  actions.unsetFilterNewlyCreated(name)
                }
                updateCohort={(dimension, cohortFilter, name) =>
                  actions.updateChartCohort(
                    dimension,
                    cohortFilter,
                    chartId,
                    layerId,
                    name
                  )
                }
                chartId={chartId}
                layerId={layerId}
                allowedDataSources={[dataSource]}
                canSelectDataSource={false}
                // We're not allowing selecting cohorts for chart filters at
                // the moment. We'll need to conditionally pass in
                // SWITCH_SELECTED_CHART_COHORT as columnSelectAction if that
                // changes.
                columnSelectAction={SUBMIT_PREFILTER}
                onTouchCallback={noteLastTouchedFilter}
                isLastTouchedFilter={lastTouchedFilter === filter.name}
                makeCategorySelection={actions.makeCategorySelection}
                columns={columns || dataSources?.[dataSource]?.columnMetadata}
                dataTypeFilter={isSupportedTypeForPrefilter}
                openCustomSQLFilterModal={actions.openCustomSQLFilterModal}
                editParameterizedCustomSQL={
                  actions.editParameterizedCustomSQLSelector
                }
                dataSource={dataSource}
              />
            ))}
        <div
          className="chart-editor-add-selector-button"
          data-testid="chart-editor-add-prefilter-button"
          onClick={addChartFilter}
        >
          <div
            className={cx({
              "chart-editor-add-selector-button-icon": true,
              disabled: !dataSource
            })}
          >
            + Add filter
          </div>
        </div>
      </div>
    </>
  )
}

const getFiltersForLayer = (
  omnifilters: FilterMetadata[],
  layerDataSource: string,
  chartId: string,
  layerId: number
): FilterMetadata[] => {
  return omnifilters.filter((f) => {
    // If this is a new filter... just check datasource
    return (
      f.appliesTo === "CHART" &&
      !f.isBinnedFilter &&
      f.chartId === chartId &&
      (f.layerId === layerId || f.layerId === undefined) &&
      // Only apply the filter if every table in the filter applies to this layer
      getDataSourcesForFilter(f.filter).has(layerDataSource)
    )
  })
}

const mapStateToProps = (state) => {
  return {
    categorySelector: state.ui.categorySelector,
    newlyCreatedFilters: state.ui.filters.newlyCreated,
    dataSources: state.dashboard.dataSources,
    omnifilters: state.omnifilters
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        updateChartFilter: setChartFilter,
        updateChartCohort: setChartCohort,
        removeChartFilter: clearFilterByName,
        toggleChartFilter: toggleFilterByName,
        openCategorySelection: openCategorySelectionModal,
        unsetFilterNewlyCreated,
        setFilterNewlyCreated,
        makeCategorySelection,
        openCustomSQLFilterModal,
        editParameterizedCustomSQLSelector
      },
      dispatch
    )
  }
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    layerFilters: getFiltersForLayer(
      stateProps.omnifilters,
      ownProps.dataSource,
      ownProps.chartId,
      ownProps.layerId
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(PreFilterComponent)
