// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { SecondaryButton } from "widgets/button/Button"

import { getDataSourcesList } from "actions/tables-action-creators"
import { getTableListData } from "actions/dashboard-action-creators"

import {
  getAllDataSources,
  getCohortRows
} from "components/custom-sql-manager/custom-sql-manager-utils"

import { selectFilterColumn } from "./filter-column-editor-actions"
import { CustomSQLTypes } from "../../custom-sql-manager/custom-sql-manager-actions"

// Subcomponents
import DataTable from "components/data-table/data-table"
import { DATA_TYPE_CATEGORY_TEXT } from "components/data-column-selector/constants"
import DataTypeIcon from "components/data-column-selector/data-type-icon"
import { getTypeCategory } from "components/data-column-selector/utils"
import { editParameterizedCustomSQLSelector } from "components/custom-sql-manager/custom-sql-manager-actions"

export const COMPONENT_TEST_ID = "filter-column-editor"

// Proptype for a filter that's currently being edited
export const existingFilterDataShape = PropTypes.shape({
  name: PropTypes.string,
  optionName: PropTypes.string,
  start: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date)
  ]),
  end: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date)
  ]),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date)
  ]),
  newlyCreated: PropTypes.bool,
  dataType: PropTypes.string,
  overwrite: PropTypes.bool,
  filterType: PropTypes.string,
  dataSource: PropTypes.string,
  dataTypeIsArray: PropTypes.bool
})

class FilterColumnEditor extends PureComponent {
  static propTypes = {
    actions: PropTypes.shape({
      getDataSourcesList: PropTypes.func,
      // get metadata for a given datasource.
      // Doesn't look like this is used anywhere, consider removing
      getTableListData: PropTypes.func
    }),
    // all possible datasources available to be selected
    allDataSources: PropTypes.objectOf(
      PropTypes.shape({
        alias: PropTypes.string,
        columnMetaData: PropTypes.array
      })
    ),
    // Cohort data lives separately from our other datasource information in
    // redux, so keep that info here so we can display cohorts in the table
    cohortRows: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        table: PropTypes.string,
        is_dict: PropTypes.bool,
        type: PropTypes.string,
        cohortData: PropTypes.object
      })
    ),
    // Role check for editing global filters
    isSuperuser: PropTypes.bool.isRequired,
    // If we're editing the data source of an existing filter, store its data
    // here
    existingFilterData: existingFilterDataShape,
    // Enables / disables the ability to select a different datasource
    canSelectDataSource: PropTypes.bool,
    // A list of all the currently available tables
    dataSourcesList: PropTypes.arrayOf(PropTypes.object),
    // Datasources that are available in the modal
    allowedDataSources: PropTypes.arrayOf(PropTypes.string),
    // The action taken when the user applies their selection
    columnSelectAction: PropTypes.string,
    // Used for chart-specific filters, allows modal to know which chart and
    // layer to apply the changes
    chartId: PropTypes.string,
    layerId: PropTypes.string,
    selectColumn: PropTypes.func,
    searchValue: PropTypes.string,
    // Function to filter out any unsupported data types
    dataTypeFilter: PropTypes.func,
    // Options to prepend to column selector rows, e.g. "No. of records"
    customOptions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
        type: PropTypes.string,
        table: PropTypes.string,
        isCount: PropTypes.bool
      })
    )
  }

  static defaultProps = {
    canSelectDataSource: true,
    allowedDataSources: []
  }

  constructor(props) {
    super(props)

    this.state = {
      // These are ultimately the data sources that will appear as
      // currently selected in the search section, and within the rows in the
      // table. Needs to live in local state so the user can delete
      // datasources.
      activeDataSources: this.props.allowedDataSources.length
        ? this.props.allowedDataSources
        : Object.keys(this.props.allDataSources)
    }
  }

  componentDidMount() {
    if (this.props.dataSourcesList.length === 0) {
      this.props.actions.getDataSourcesList()
    }
  }

  onSelectRow = (selectedRow) => {
    this.props.actions.selectFilterColumn(
      this.props.existingFilterData,
      selectedRow,
      this.props.columnSelectAction,
      this.props.shouldAutoEnable
    )
  }

  buildTableData = () => {
    const {
      allDataSources,
      allowedDataSources,
      cohortRows,
      dataTypeFilter,
      customOptions = [],
      customSqlMetadata = []
    } = this.props
    // Assemble our table rows, showing just rows from active data sources
    let tableData = this.state.activeDataSources.reduce((arr, source) => {
      if (allDataSources[source]) {
        const rows = allDataSources[source].columnMetadata.map((metadata) => ({
          ...metadata,
          source
        }))
        return [...arr, ...rows]
      }
      return arr
    }, [])

    // Add cohort rows and filter out datasources based on allowedDataSources,
    // if specified
    const cohortRowsFromAllowedDatasources = this.props.allowedDataSources
      .length
      ? cohortRows.filter((cohort) => allowedDataSources.includes(cohort.table))
      : cohortRows
    tableData = tableData.concat(cohortRowsFromAllowedDatasources)

    const sortedToTopOptions = [...customOptions, ...customSqlMetadata]

    tableData = [
      ...sortedToTopOptions,
      ...tableData.sort((a, b) => a.value.localeCompare(b.value))
    ]

    // filter out unsupported data types specified by parent component
    if (dataTypeFilter) {
      tableData = tableData.filter((row) => dataTypeFilter(row.type))
    }

    return tableData
  }

  renderCustomSqlButton() {
    return (
      <div className="custom-sql-button-container">
        <SecondaryButton onClick={this.props.openCustomSQLModal}>
          Create SQL filter
        </SecondaryButton>
      </div>
    )
  }

  render() {
    const tableData = this.buildTableData()

    return (
      <div className="filter-column-editor" data-testid={COMPONENT_TEST_ID}>
        <DataTable
          data={tableData}
          dataTableRef={this.props.dataTableRef}
          dataHeaders={[
            {
              columnHeader: "Column Name",
              columnKey: "label"
            },
            {
              columnHeader: "Type",
              columnKey: "type"
            }
          ]}
          filterText={this.props.searchValue}
          filterCategoryColumnKey="type"
          getFilterCategory={getTypeCategory}
          getFilterCategoryLabel={(category) =>
            DATA_TYPE_CATEGORY_TEXT[category]
          }
          getFilterCategoryIcon={(category) => <DataTypeIcon type={category} />}
          onSelectRow={this.onSelectRow}
          useDefaultSort={false}
          rowIconOptions={{
            icon: "settings",
            title: "Edit",
            alignRight: true,
            action: (row) =>
              this.props.actions.editParameterizedCustomSQLSelector({
                customSelectorValue: row.value,
                activeDataSource: this.props.allowedDataSources[0],
                customSQLType: row.sharedCustom
                  ? CustomSQLTypes.CUSTOM_SQL_EDIT_SHARED
                  : CustomSQLTypes.CUSTOM_SQL_EDIT_GLOBAL,
                chartId: this.props.existingFilterData.chartId,
                layerId: this.props.existingFilterData.layerId
              }),
            isVisible: (option) =>
              Boolean(
                option.sharedCustom ||
                  (option.globalCustom && this.props.isSuperuser)
              )
          }}
        />
        {this.props.openCustomSQLModal && this.renderCustomSqlButton()}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    // Props from the redux state
    allDataSources: getAllDataSources(state),
    dataSourcesList: state.tables.list,
    cohortRows: getCohortRows(state),
    isSuperuser: state.connection.isSuperuser
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      getDataSourcesList,
      getTableListData,
      selectFilterColumn,
      editParameterizedCustomSQLSelector
    },
    dispatch
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(FilterColumnEditor)
