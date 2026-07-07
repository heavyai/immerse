// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createSelector } from "reselect"

export const getFilterSets = (state) => state.filterZones

export const getSelectedFilterSet = createSelector(
  getFilterSets,
  (filterSets) => Object.values(filterSets || {}).find((set) => set.selected)
)

export const getSelectedFilterSetId = createSelector(
  getSelectedFilterSet,
  ({ id } = {}) => id
)
