// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { AppState } from "vega/charts/types"
import {
  Connector,
  getBaseConnectors,
  getConnectors
} from "../../utils/get-connectors"

export const useConnectors = (): {
  connectors: Connector[]
  loading: boolean
} => {
  const isAdmin = useSelector<AppState, boolean>(
    ({ connection: { isSuperuser } }) => isSuperuser
  )
  const [connectors, setConnectors] = useState<Connector[]>(
    getBaseConnectors(isAdmin)
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchConnectors = async () => {
      setLoading(true)

      const fetchedConnectors = await getConnectors(isAdmin)
      setConnectors(fetchedConnectors)

      setLoading(false)
    }
    fetchConnectors()
  }, [isAdmin])

  return { connectors, loading }
}
