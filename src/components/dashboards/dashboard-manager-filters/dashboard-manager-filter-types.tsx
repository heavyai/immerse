// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type MultiSelectValue = {
  [value: string]: true
}

export type DateValue = [string | null, string | null]

export type FilterTag = {
  owner?: MultiSelectValue
  title?: string[]
  source?: MultiSelectValue
  is_shared?: boolean
  last_modified?: DateValue
}

export type FrontEndViewShape = {
  image_hash: string
  update_time: string
  dashboard_name: string
  dashboard_state: string
}

export type FilterView = {
  filterViewName: string | null
  filterTags: FilterTag[]
}

export type UpdateFilterView = {
  oldFilterViewName: string
  newFilterViewName: string
  filterTags: FilterTag[]
}

export type SelectOption = {
  value: string
  label: string
}
