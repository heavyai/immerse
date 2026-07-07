// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { uniq } from "lodash"
import DataTable from "components/data-table/data-table"
import {
  DATA_TABLE_HEADERS,
  DATA_TYPE_CATEGORY_TEXT
} from "components/data-column-selector/constants"
import DataTypeIcon from "components/data-column-selector/data-type-icon"
import { getTypeCategory } from "components/data-column-selector/utils"

import "./styles.scss"

const DataColumnSelector = ({
  onSelectRow,
  activeRow = {},
  searchFieldLabel,
  rowIconOptions,
  data,
  dataHeaders = DATA_TABLE_HEADERS,
  loading,
  ...restProps
}) => {
  const dataSourcesList = uniq(data.map((column) => column.table))

  return (
    <div className="data-column-selector">
      <DataTable
        loading={loading}
        data={data}
        dataHeaders={dataHeaders}
        searchFieldLabel={
          searchFieldLabel === null || searchFieldLabel === undefined
            ? `Search in ${dataSourcesList.join(", ")}`
            : searchFieldLabel
        }
        filterCategoryColumnKey="type"
        getFilterCategory={getTypeCategory}
        getFilterCategoryLabel={(category) => DATA_TYPE_CATEGORY_TEXT[category]}
        getFilterCategoryIcon={(category) => <DataTypeIcon type={category} />}
        onSelectRow={onSelectRow}
        activeRow={activeRow}
        rowIconOptions={rowIconOptions}
        {...restProps}
      />
    </div>
  )
}

DataColumnSelector.propTypes = {
  onSelectRow: PropTypes.func,
  activeRow: PropTypes.object,
  searchFieldLabel: PropTypes.string,
  rowIconOptions: PropTypes.shape({
    icon: PropTypes.string,
    title: PropTypes.string,
    style: PropTypes.object,
    action: PropTypes.func,
    alignRight: PropTypes.bool
  }),
  data: PropTypes.arrayOf(PropTypes.object),
  dataHeaders: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool
}

export default DataColumnSelector
