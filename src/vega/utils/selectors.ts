// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DATA_TYPE_CATEGORY } from "components/data-column-selector/constants"

export const getDataTableFilterType = (col) => {
  if (col.parameter) {
    return DATA_TYPE_CATEGORY.COLUMN_PARAMETER
  }

  if (col.sharedCustom || col.globalCustom) {
    return DATA_TYPE_CATEGORY.CUSTOM
  }

  return col.type
}
