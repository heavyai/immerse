// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartFieldAssignment, ChartTypes } from "components/sql-notebook/types"
import {
  assignDate,
  assignNumber,
  assignString,
  dateField,
  numberField,
  stringField
} from "../chart-generator"
import { ChoroplethGenerator } from "../choropleth-chart-generator"

const { COLOR } = ChartFieldAssignment
export const choroplethGenerator = new ChoroplethGenerator(
  ChartTypes.VEGA_CHOROPLETH
)

choroplethGenerator.addDefinition([numberField(1)], [assignNumber(COLOR)])
choroplethGenerator.addDefinition([stringField(1)], [assignString(COLOR)])
choroplethGenerator.addDefinition([dateField(1)], [assignDate(COLOR)])
