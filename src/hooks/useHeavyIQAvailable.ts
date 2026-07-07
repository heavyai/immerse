// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { checkIQAvailable } from "components/sql-notebook/sql-notebook.service"
import { useEffect, useState } from "react"

export const useHeavyIQAvailable = () => {
  const [loading, setLoading] = useState(false)
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    setLoading(true)
    checkIQAvailable()
      .then((isAvailable) => {
        setAvailable(isAvailable)
      })
      .catch(() => {
        setAvailable(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return [loading, available]
}
