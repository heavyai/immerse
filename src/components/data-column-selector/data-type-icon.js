// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { DATA_TYPE_CATEGORY } from "./constants"

import IconGeo from "components/svg-icons/icon-geo"
import IconNumber from "components/svg-icons/icon-number"
import IconEnum from "components/svg-icons/icon-enum"
import IconDateTime from "components/svg-icons/icon-date-time"
import IconColumn from "components/svg-icons/icon-column"
import IconCustom from "components/svg-icons/icon-data-type-custom"

const DataTypeIcon = ({ type }) => {
  switch (type) {
    case DATA_TYPE_CATEGORY.ENUM:
      return <IconEnum />
    case DATA_TYPE_CATEGORY.NUMBER:
      return <IconNumber />
    case DATA_TYPE_CATEGORY.GEO:
      return <IconGeo />
    case DATA_TYPE_CATEGORY.DATE_TIME:
      return <IconDateTime />
    case DATA_TYPE_CATEGORY.COHORT:
      return <span>Cohort</span>
    case DATA_TYPE_CATEGORY.COLUMN_PARAMETER:
      return <IconColumn />
    case DATA_TYPE_CATEGORY.CUSTOM:
      return <IconCustom className="svgicon" />
    default:
      throw new Error("Unhandled data type for DataTypeIcon")
  }
}

DataTypeIcon.propTypes = {
  type: PropTypes.string
}

export default DataTypeIcon
