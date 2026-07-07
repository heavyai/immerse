// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"

export const usePreviousCell = (currentCellIndex: number) => {
  const lastCell = useSelector((state) => {
    return currentCellIndex > 0
      ? state.sqlNotebook?.cells?.[currentCellIndex - 1]
      : null
  })
  return lastCell
}
