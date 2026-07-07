// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import comboMigrator from "./chart-migrations/combo-migrator"
import barMigrator from "./chart-migrations/bar-migrator"
import histogramMigrator from "./chart-migrations/histogram-migrator"
import stackedBarMigrator from "./chart-migrations/stacked-bar-migrator"

const migratorMapping = {
  line2: {
    "vega-combo": comboMigrator
  },
  row: {
    "vega-combo": barMigrator
  },
  histogram: {
    "vega-combo": histogramMigrator
  },
  bar: {
    "vega-combo": stackedBarMigrator
  }
}

export default migratorMapping
