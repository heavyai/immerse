// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react"
import { getTables } from "../utils/get-tables"

export const useTables = () => {
  const [tables, setTables] = useState<string[]>([])

  useEffect(() => {
    const fetchTablesAsync = async () => {
      const fetchedTables = await getTables()
      setTables(fetchedTables)
    }
    fetchTablesAsync()
  }, [])

  return tables
}
