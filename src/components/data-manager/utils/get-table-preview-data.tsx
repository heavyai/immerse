// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TABLE_PREVIEW_DATA, TablePreviewData } from "../constants"

const generateRandomPreviewData = () => ({
  rows: [...new Array(10)].map(() => Math.ceil(Math.random() * 100))
})

export const getTablePreviewData = async (tableName?: string) => {
  return new Promise<TablePreviewData>((resolve) => {
    setTimeout(() => {
      resolve(
        tableName ? TABLE_PREVIEW_DATA[tableName] : generateRandomPreviewData()
      )
    }, 500)
  })
}
