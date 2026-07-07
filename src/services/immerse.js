// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import CrossFilter from "services/crossfilter"
import Connector, { spoofDbConnector as spoof } from "services/connector"
import dc from "services/dc"
import vega from "services/vega"
import { populateImportableService } from "./immerse-importable"

const Services = new Map()

Services.set("DbCon", Connector)
Services.set("CrossFilter", CrossFilter)
Services.set("dc", dc)
Services.set("vega", vega)

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line no-underscore-dangle
  window.__IMMERSE__ = Services
}

populateImportableService(Services)

export default Services
export const spoofDbConnector = spoof
