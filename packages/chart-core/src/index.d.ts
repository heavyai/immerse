// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PersistedChart } from "@immerse/dashboard-document"
export interface ChartRuntime { update(chart: PersistedChart): void | Promise<void>; dispose(): void }
export interface ChartEngine { create(host: unknown, chart: PersistedChart): ChartRuntime }
export interface ChartPlugin {
  readonly type: string
  readonly version?: number
  readonly capabilities?: readonly string[]
  upgrade?(chart: PersistedChart): PersistedChart
  engine?: ChartEngine
}
export interface ChartRegistry<T extends ChartPlugin> { register(plugin: T): T; get(type: string): T | undefined; list(): T[] }
export function createChartRegistry<T extends ChartPlugin>(): ChartRegistry<T>
