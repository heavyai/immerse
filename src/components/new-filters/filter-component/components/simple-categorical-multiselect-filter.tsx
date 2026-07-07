// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import { connect } from "react-redux"
import { AutoSizer, List } from "react-virtualized"
import { Checkbox } from "@rmwc/checkbox"
import { TextField } from "widgets/text-field/TextField"
import { CircularProgress } from "@rmwc/circular-progress"
import "@rmwc/circular-progress/circular-progress.css"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { getDistinctColumnValues } from "actions/column-values-action-creators"

import "./simple-categorical-multiselect-filter.scss"

interface ColumnData {
  col: string
  num: number
}

type CategoricalMultiSelectProps = {
  dataSourceName: string
  columnName: string
  columnValues: ColumnData[]
  isLoadingColumnValues: boolean
  getColumnValues: Function
  initialSelections: string[]
  submitMultiSelectFilter: Function
  excludeFilter: string[]
}

const CategoricalMultiSelect: FC<CategoricalMultiSelectProps> = ({
  dataSourceName,
  columnName,
  columnValues,
  isLoadingColumnValues,
  getColumnValues,
  initialSelections,
  submitMultiSelectFilter,
  excludeFilter
}) => {
  const { CATEGORY_MODAL_LIMIT } = available_feature_flags
  const categoriesLimit = getFeatureFlag(CATEGORY_MODAL_LIMIT)

  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState(
    initialSelections
  )
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    getColumnValues({
      dataSource: dataSourceName,
      column: columnName,
      searchTerm,
      ignoredDashboardFilters: [excludeFilter]
    })
  }, [
    dataSourceName,
    categoriesLimit,
    columnName,
    getColumnValues,
    searchTerm,
    excludeFilter
  ])

  useEffect(() => {
    if (columnValues) {
      setCategories(
        columnValues
          .map((data) => data.col)
          .filter((value) => !selectedCategories.includes(value))
          .sort()
      )
    }
  }, [columnValues, selectedCategories])

  useEffect(() => {
    submitMultiSelectFilter(selectedCategories)
  }, [selectedCategories, submitMultiSelectFilter])

  const onSelectCategory = (e) => {
    if (e.currentTarget.checked) {
      setSelectedCategories([...selectedCategories, e.currentTarget.value])
    } else {
      setSelectedCategories(
        selectedCategories.filter(
          (category) => category !== e.currentTarget.value
        )
      )
    }
  }

  // This should technically be >= and not ===, but we limit the results of the
  // query for category values by the category limit so we don't actually know
  // if the real number of values is greater
  //
  // This is copying behavior in the category selection modal
  // Immerse PR #5941
  const showCategoryLimitMessage = columnValues.length === categoriesLimit
  const displayCategoryList = selectedCategories
    .sort()
    .concat(categories)
    .filter((v) => v !== null)

  const CategoryListRow = ({ index, key, style }) => (
    <div
      className="simple-filter--multiselect__category"
      key={key}
      style={style}
    >
      <Checkbox
        id={`category-${displayCategoryList[index]}-${index}`}
        value={displayCategoryList[index]}
        checked={selectedCategories.includes(displayCategoryList[index])}
        onChange={onSelectCategory}
      />
      <label
        className="simple-filter--multiselect__category__label"
        htmlFor={`category-${displayCategoryList[index]}-${index}`}
      >
        {displayCategoryList[index]}
      </label>
    </div>
  )

  const CategoryList = () =>
    displayCategoryList.length ? (
      <>
        <div className="simple-filter--multiselect__categories">
          <AutoSizer>
            {({ width, height }) => (
              <List
                width={width}
                height={height}
                rowHeight={24}
                rowCount={displayCategoryList.length}
                rowRenderer={CategoryListRow}
              />
            )}
          </AutoSizer>
        </div>

        {showCategoryLimitMessage && (
          <p className="simple-filter--multiselect__limit-message">
            Showing top {categoriesLimit} values. Use search if your desired
            value is not found above.
          </p>
        )}
      </>
    ) : (
      "No results"
    )

  return (
    <div className="simple-filter--multiselect">
      <TextField
        icon="search"
        className="simple-filter__input"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.currentTarget.value)
        }}
      />

      {isLoadingColumnValues ? (
        <div className="simple-filter--multiselect--loading">
          <CircularProgress size="xsmall" />
        </div>
      ) : (
        <CategoryList />
      )}
    </div>
  )
}

const mapStateToProps = ({ columnValues }, { dataSourceName, columnName }) => {
  const columnData =
    (columnValues[dataSourceName] &&
      columnValues[dataSourceName][columnName]) ||
    {}

  return {
    columnValues: columnData.distinctValues || [],
    isLoadingColumnValues: columnData.loading
  }
}

export default connect(mapStateToProps, {
  getColumnValues: getDistinctColumnValues
})(CategoricalMultiSelect)
