// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"
import { useParams } from "react-router"
import { useDispatch } from "react-redux"
import Services from "services/immerse"
import { routeToDashboard, routeToDashboardsList } from "../../utils/routerPath"
import { Redirect } from "react-router-dom"

const SystemDashboardsRoute = () => {
  const { dashboardName } = useParams()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [dashId, setDashId] = useState()

  useEffect(() => {
    const routeToSystemDashboard = async () => {
      const dashboards = await Services.get("DbCon").getDashboardsAsync()
      const dashboard = dashboards.find(
        (dash) => dash.dashboard_name === dashboardName
      )

      if (dashboard) {
        setDashId(dashboard.dashboard_id)
      }

      setLoading(false)
    }

    routeToSystemDashboard()
  }, [dispatch, dashboardName])

  if (dashId) {
    return <Redirect to={routeToDashboard("information_schema", dashId)} />
  }

  if (!loading) {
    return <Redirect to={routeToDashboardsList("information_schema")} />
  }

  return null
}

export default SystemDashboardsRoute
