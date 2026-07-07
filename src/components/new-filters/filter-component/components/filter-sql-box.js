// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { ResizableBox } from "react-resizable"

import FilterLabel from "./filter-label-component"

export default function FilterSqlBox({ minHeight, width, filterMetaData }) {
  return (
    <ResizableBox
      height={minHeight}
      minConstraints={[width, minHeight]}
      axis={"y"}
      className={"filter-component-sql"}
    >
      <div className="filter-component-scroller">
        <FilterLabel filterMetaData={filterMetaData} />
      </div>
    </ResizableBox>
  )
}

FilterSqlBox.propTypes = {
  filterMetaData: PropTypes.object,
  minHeight: PropTypes.number,
  width: PropTypes.number
}
