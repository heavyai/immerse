// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface LegacyDcClient { redrawAllAsync(groups?: unknown): Promise<unknown>; renderAllAsync(groups?: unknown): Promise<unknown> }
export function createLegacyDcEngine(dc: LegacyDcClient): { redraw(groups?: unknown): Promise<unknown>; render(groups?: unknown): Promise<unknown> }
export { ChartEngine, ChartRuntime } from "@immerse/chart-core"
