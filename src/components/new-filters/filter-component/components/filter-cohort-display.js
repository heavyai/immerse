// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import { numberWithCommas } from "utils/helpers"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import {
  buildCohortCountSql,
  buildOmnifilterSql
} from "vega/constants/filter-types"
import Services from "services/immerse"
import InfoIcon from "components/svg-icons/info"

import PercentageBar from "../../filter-panel/components/percentage-bar"

function FilterCohortDisplay({
  filterMetaData,
  onClickCohortName,
  dimensionDataType
}) {
  const {
    cohortDimension: { dataSource, name, cohortName },
    filter
  } = filterMetaData

  const [count, setCount] = useState(null)
  const [totalCount, setTotalCount] = useState(null)

  useEffect(() => {
    const partOfTotalQuery = process(
      buildCohortCountSql(dataSource, name, dimensionDataType, [
        buildOmnifilterSql(filterMetaData)
      ]),
      { trackUsage: false }
    )
    Services.get("DbCon")
      .queryAsync(partOfTotalQuery)
      .then((res) => {
        setCount(res && res[0] && res[0].n)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Unable to fetch cohort count ", error)
        setCount(null)
      })
  }, [dataSource, name, dimensionDataType, filter, filterMetaData])

  useEffect(() => {
    const totalQuery = process(
      buildCohortCountSql(dataSource, name, dimensionDataType),
      { trackUsage: false }
    )
    Services.get("DbCon")
      .queryAsync(totalQuery)
      .then((res) => {
        const data = res && res[0] && res[0].n
        setTotalCount(data || null)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Unable to fetch cohort count ", error)
        setTotalCount(null)
      })
  }, [dataSource, name, dimensionDataType, filter])

  // using a custom popover so that sql is selectable
  return (
    <div className="filter-cohort-display">
      <div className="title">
        <div onClick={onClickCohortName}>{cohortName}</div>
        <div className="info-icon">
          <InfoIcon />
          <div className="sql-popover">
            <p>
              {process(buildOmnifilterSql(filterMetaData), {
                useDisplayName: true
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="data">
        <div className="column">{name}</div>
        <div className="count">{numberWithCommas(count)}</div>
      </div>
      <PercentageBar total={totalCount} partOfTotal={count} />
    </div>
  )
}

FilterCohortDisplay.propTypes = {
  dimensionDataType: PropTypes.string,
  filterMetaData: PropTypes.object,
  onClickCohortName: PropTypes.func
}

const mapStateToProps = (state, props) => {
  const {
    cohortDimension: { dataSource, name: dimension }
  } = props.filterMetaData
  if (dataSource && dimension) {
    const dataSourceMeta = state.dashboard.dataSources[dataSource]
    const columns = dataSourceMeta && dataSourceMeta.columnMetadata
    const column = columns && columns.find(({ value }) => value === dimension)
    if (column) {
      return { dimensionDataType: column.type }
    }
  }
  return { dimensionDataType: "" }
}

export default connect(mapStateToProps)(FilterCohortDisplay)
