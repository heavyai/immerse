// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ColorDefinition } from "reducers/charts/charts-reducer-types"

export type PaletteMapping = {
  id: string
  name: string
  dataSource?: string
  column?: string
  mapping: ColorDefinition
}

export type SharedSettingsState = {
  mappings: Array<PaletteMapping>
}
