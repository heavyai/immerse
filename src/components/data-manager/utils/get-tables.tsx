// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TABLE_PREVIEW_DATA } from "../constants"

export const getTables = async () => {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      resolve(Object.keys(TABLE_PREVIEW_DATA))
    }, 500)
  })
}
