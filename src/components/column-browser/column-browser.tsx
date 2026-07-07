// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  DATA_TABLE_HEADERS2,
  DATA_TYPE_CATEGORY_TEXT
} from "components/data-column-selector/constants"
import DataTypeIcon from "components/data-column-selector/data-type-icon"
import { getTypeCategory } from "components/data-column-selector/utils"
import { Column, ColumnTable } from "components/column-browser/column-table"

import { TextField } from "@rmwc/textfield"
import { MultiSelectDropdown } from "components/sql-notebook/components/multi-select-menu"
import { uniqBy } from "lodash"
import { TypeCategory } from "../data-column-selector/types"

import "./column-browser.scss"
import { ColumnMetadata } from "constants/prop-types"
import { ColumnBrowserRow } from "components/sql-notebook/data-panel/column-list-item"
import { IItemAction } from "components/sql-notebook/data-panel/row-action"

const DATA_TYPE_FILTER_OPTIONS = {
  ALL: "All",
  CATEGORICAL: "Categorical",
  DATE_TIME: "Date/Time",
  BOOLEAN: "Boolean",
  NUMERIC: "Numeric",
  STRING: "String",
  POINT: "Point",
  LINE: "Line",
  POLYGON: "Polygon"
}

// Not sure if we need these configurable
const filterTextColumnKey = "value"
const filterCategoryColumnKey = "type"
const getFilterCategoryIcon = (category: TypeCategory) => (
  <DataTypeIcon type={category} />
)
const { ALL } = DATA_TYPE_FILTER_OPTIONS

interface IColumnBrowser {
  onSelectRow: () => void
  activeRow: ColumnBrowserRow | undefined
  data: Array<any>
  dataHeaders: Array<Column>
  loading: boolean
  rowActions: Array<IItemAction<ColumnMetadata>>
  rowsSelectable: boolean
}

export const ColumnBrowser = ({
  onSelectRow,
  activeRow,
  data,
  dataHeaders = DATA_TABLE_HEADERS2,
  loading,
  rowActions,
  rowsSelectable = false
}: IColumnBrowser) => {
  const [filterText, setFilterText] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<Array<string>>([ALL])
  const [filteredData, setFilteredData] = useState(data)

  // Ensure we default to a string if the search field is cleared and returns nothing
  const setOrClearFilterText = (text = "") => {
    setFilterText(text)
  }

  const availableDataTypeFilters = useMemo(() => {
    const uniqueCategories = uniqBy(
      data.map((column: any) => {
        const category = getTypeCategory(column[filterCategoryColumnKey])
        return {
          value: category,
          label: DATA_TYPE_CATEGORY_TEXT[category]
        }
      }),
      "value"
    )
    return [
      {
        value: ALL,
        label: "All"
      },
      ...uniqueCategories
    ]
  }, [data])

  const onSelectDataFilter = (val: string) => {
    if (val === ALL) {
      // Only select ALL
      setSelectedFilters([ALL])
    } else {
      // User didn't click "ALL", remove "ALL" selection, select clicked option
      let newFilters = selectedFilters.filter((f) => f !== ALL)
      if (selectedFilters.includes(val)) {
        newFilters = newFilters.filter((f) => f !== val)
        if (newFilters.length === 0) {
          newFilters = [ALL]
        }
        setSelectedFilters(newFilters)
      } else {
        setSelectedFilters([...newFilters, val])
      }
    }
  }

  useEffect(() => {
    setFilteredData(
      data
        .filter((column) => {
          return String(column[filterTextColumnKey])
            .toLowerCase()
            .includes(filterText.toLowerCase())
        })
        .filter((column) => {
          const allSelected =
            selectedFilters?.[0] === DATA_TYPE_FILTER_OPTIONS.ALL
          return (
            allSelected ||
            selectedFilters.includes(
              getTypeCategory(column[filterCategoryColumnKey])
            )
          )
        })
    )
  }, [filterText, selectedFilters, data])

  const hasSelectedOptions = useCallback(() => {
    return Boolean(
      selectedFilters?.length &&
        selectedFilters[0] !== DATA_TYPE_FILTER_OPTIONS.ALL
    )
  }, [selectedFilters])

  return (
    <div className="sql-notebook__data-column-selector">
      <div className="data-column-selector__search">
        <TextField
          outlined
          className="data-column-selector__input"
          icon="search"
          trailingIcon={
            filterText.length
              ? {
                  icon: "close",
                  onClick: () => setOrClearFilterText()
                }
              : null
          }
          label="Search columns..."
          value={filterText}
          onChange={(e) => setOrClearFilterText(e.target.value)}
        />
      </div>
      <div className="data-column-selector__filters">
        <div>Data type filters:</div>
        <div>
          <MultiSelectDropdown
            options={availableDataTypeFilters}
            selectedOptions={selectedFilters}
            onSelectOption={onSelectDataFilter}
            onClear={() => setSelectedFilters([ALL])}
            hasSelectedOptions={hasSelectedOptions}
            tooltip={
              selectedFilters?.length > 1
                ? selectedFilters
                    .map((sf) => DATA_TYPE_CATEGORY_TEXT[sf])
                    .join(", ")
                : null
            }
          />
        </div>
      </div>
      <ColumnTable
        loading={loading}
        data={filteredData}
        dataHeaders={dataHeaders}
        filterCategoryColumnKey="type"
        getFilterCategory={getTypeCategory}
        getFilterCategoryIcon={getFilterCategoryIcon}
        onSelectRow={onSelectRow}
        activeRow={activeRow}
        rowActions={rowActions}
        rowsSelectable={rowsSelectable}
      />
    </div>
  )
}
