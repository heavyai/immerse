// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useContext } from "react"
import { HeavyServicesContext } from "containers/heavy-services-provider"

export default function connectToMapDServices(Component) {
  function WithServices(props) {
    const services = useContext(HeavyServicesContext)
    return <Component {...props} MapD={services} />
  }
  WithServices.displayName = `WithServices(${
    Component.displayName || Component.name || "Component"
  })`
  return WithServices
}
