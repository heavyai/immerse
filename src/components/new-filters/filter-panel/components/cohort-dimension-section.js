// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import Services from "services/immerse"
import CohortKebab from "components/new-filters/filter-panel/components/cohort-kebab"
import { debounce } from "lodash"
import { connect } from "react-redux"

import {
  buildCohortCountSql,
  buildOmnifilterSql,
  emptyCohortSql,
  andFilter
} from "vega/constants/filter-types"

import { process } from "utils/ImmerseSQLPlusPlus/parser"

import PercentageBar from "./percentage-bar"

import { numberWithCommas } from "utils/helpers"

const COHORT_DIMENSION_COUNT_DEBOUNCE = 250

// eslint-disable-next-line react/prefer-stateless-function
class CohortDimensionSection extends PureComponent {
  state = {
    total: null,
    partOfTotal: null
  }
  componentDidMount() {
    this.getTotal()
    this.getPartOfTotal()
  }
  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(prevProps.dataSourceFilters) !==
        JSON.stringify(this.props.dataSourceFilters) ||
      JSON.stringify(prevProps.selectedFilterSet.cohortAggregateFilters) !==
        JSON.stringify(this.props.selectedFilterSet.cohortAggregateFilters)
    ) {
      this.debouncedGetPartOfTotal()
    }
    if (prevProps.dimension !== this.props.dimension) {
      this.getPartOfTotal()
      this.getTotal()
    }
  }
  getTotal() {
    const totalQuery = process(
      buildCohortCountSql(
        this.props.dataSource,
        this.props.dimension,
        this.props.dimensionDataType
      ),
      { trackUsage: false }
    )
    Services.get("DbCon")
      .queryAsync(totalQuery)
      .then((res) => {
        const data = res && res[0] && res[0].n
        this.setState({
          total: data || null
        })
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Unable to fetch cohort count ", error)
        this.setState({
          total: null
        })
      })
  }
  getPartOfTotal() {
    const filtersForDataSource = this.props.dataSourceFilters
      .filter((metaData) => metaData.enabled)
      .map((metaData) => metaData.filter)

    let filter = undefined
    if (filtersForDataSource.length === 0) {
      filter = emptyCohortSql(this.props.dataSource, this.props.dimension)
    } else if (filtersForDataSource.length === 1) {
      filter = filtersForDataSource[0]
    } else {
      filter = andFilter(filtersForDataSource)
    }

    const cohort = {
      cohortDimension: {
        negated: false,
        dataSource: this.props.dataSource,
        name: this.props.dimension,
        postFilters: this.props.selectedFilterSet.cohortAggregateFilters
          ? Object.values(this.props.selectedFilterSet.cohortAggregateFilters)
              .filter((metaData) => metaData.enabled && metaData.valid)
              .map((metaData) => metaData.filter)
          : []
      },
      filter
    }

    const partOfTotalQuery = process(
      buildCohortCountSql(
        this.props.dataSource,
        this.props.dimension,
        this.props.dimensionDataType,
        [buildOmnifilterSql(cohort)]
      ),
      { trackUsage: false }
    )
    Services.get("DbCon")
      .queryAsync(partOfTotalQuery)
      .then((res) => {
        const data = res && res[0] && res[0].n
        this.setState({
          partOfTotal: data || null
        })
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Unable to fetch cohort count ", error)
        this.setState({
          partOfTotal: null
        })
      })
  }
  debouncedGetPartOfTotal = debounce(
    this.getPartOfTotal,
    COHORT_DIMENSION_COUNT_DEBOUNCE,
    {
      // Fire getPartOfTotal on the leading edge for immediate / one-off changes
      // to filters
      leading: true,
      // Fire getPartOfTotal on the trailing edge so that the most accurate number
      // displays in cohort count after user finishes making changes
      trailing: true,
      // If the user is doing something like brushing on a combo chart, update
      // the count at least every 250ms
      maxWait: COHORT_DIMENSION_COUNT_DEBOUNCE
    }
  )
  render() {
    return (
      <div className="cohort-dimension">
        <div className="cohort-dimension-two-columns">
          <div className="cohort-dimension-left-column">
            <div className="cohort-dimension-title-container">
              <div className="cohort-dimension-title">
                {this.props.dimension}
              </div>
              {this.state.partOfTotal !== null && (
                <div className="cohort-dimension-title-total">
                  {numberWithCommas(this.state.partOfTotal)}{" "}
                  <span className="subpart-total">
                    {" "}
                    of {numberWithCommas(this.state.total)}
                  </span>
                </div>
              )}
            </div>
            <PercentageBar
              total={this.state.total}
              partOfTotal={this.state.partOfTotal}
            />
          </div>
          <div className="cohort-dimension-right-column">
            <CohortKebab
              filterSet={this.props.selectedFilterSet}
              dataSource={this.props.dataSource}
              hasDimension={this.props.hasDimension}
              changeCohortDimension={this.props.changeCohortDimension}
            />
          </div>
        </div>
      </div>
    )
  }
}

CohortDimensionSection.propTypes = {
  dataSource: PropTypes.string,
  dimension: PropTypes.string,
  dimensionDataType: PropTypes.string,
  dataSourceFilters: PropTypes.arrayOf(PropTypes.object),
  hasDimension: PropTypes.bool,
  changeCohortDimension: PropTypes.func,
  selectedFilterSet: PropTypes.shape({
    dimensions: PropTypes.object,
    filters: PropTypes.arrayOf(PropTypes.string),
    id: PropTypes.string,
    name: PropTypes.string,
    selected: PropTypes.bool
  }),
  actions: PropTypes.shape({
    getCohortDimensionSize: PropTypes.func
  })
}

const mapStateToProps = (state, props) => {
  if (props.dataSource && props.dimension) {
    const dataSource = state.dashboard.dataSources[props.dataSource]
    const columns = dataSource && dataSource.columnMetadata
    const column =
      columns && columns.find(({ value }) => value === props.dimension)
    if (column) {
      return { dimensionDataType: column.type }
    }
  }
  return { dimensionDataType: "" }
}

export default connect(mapStateToProps)(CohortDimensionSection)
