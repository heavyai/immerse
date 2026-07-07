// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { IMPORT_ACTIONS, TABLE_PREVIEW_DATA } from "../constants"

// TODO: Mock async import. Replace w/ Redux action chain for create/append of table data
export const importTableData = async (
  tableName: string,
  importAction: string,
  rows: number[] // Rows only passed here to update mock table preview data
): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      TABLE_PREVIEW_DATA[tableName] = {
        rows:
          importAction === IMPORT_ACTIONS.APPEND
            ? [...TABLE_PREVIEW_DATA[tableName].rows, ...rows]
            : rows
      }
      resolve()
    }, 500)
  })
