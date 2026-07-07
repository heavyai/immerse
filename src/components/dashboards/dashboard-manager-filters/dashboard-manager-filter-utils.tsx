// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import moment from "moment"

import { FilterTag } from "./dashboard-manager-filter-types"

export const filterTagTypeLabel = (filterType: string) => {
  switch (filterType) {
    case "last_modified":
      return "Last modified"
    case "is_shared":
      return "Sharing"
    default:
      return (
        filterType &&
        filterType.charAt(0).toUpperCase().concat(filterType.slice(1))
      )
  }
}

export const filterTagValueLabel = (filterTag: FilterTag) => {
  const momentFormat = "MMM DD YYYY"
  const filterTagType: string = Object.keys(filterTag)[0]
  if (filterTagType === "last_modified") {
    const formatTime = (time: string) =>
      time && moment(time).isValid() ? moment(time).format(momentFormat) : "*"
    return `${formatTime(filterTag[filterTagType][0])} -
      ${formatTime(filterTag[filterTagType][1])}
    `
  } else if (filterTagType === "source" || filterTagType === "owner") {
    return Object.keys(filterTag[filterTagType]).join(", ")
  } else if (filterTagType === "is_shared") {
    return filterTag[filterTagType] === true ? "Is shared" : "Not shared"
  }

  return filterTag[filterTagType].toString()
}

export const selectOptionLabel = (filterType: string, optionValue) => {
  if (filterType === "is_shared") {
    return optionValue === true ? "Is shared" : "Not shared"
  }

  return (
    optionValue !== undefined && optionValue !== null && optionValue.toString()
  )
}

export const isValidFilter = (filter: FilterTag) => {
  return Object.values(filter).some((v) => v === false || v)
}
