// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createParser } from "@heavyai/data-layer"

export const isValidFilter = (f) =>
  !f.error &&
  !f.loading &&
  Boolean(
    (f.operand && f.value) ||
      f.expression ||
      (f.value && (f.operator === "IS NULL" || f.operator === "NOT NULL"))
  )

export default function createFilterService() {
  const parser = createParser()

  function setFilters() {
    // this was deprecated away when old crossfilter was dropped
  }

  function clearAllFilters() {
    // this was deprecated away when old crossfilter was dropped
  }

  return {
    parser,
    setFilters,
    clearAllFilters
  }
}
