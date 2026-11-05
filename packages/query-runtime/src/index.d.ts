// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface RequestIdentity { dashboardId: string; chartId: string; generation: number; sessionId: string }
export interface QueryRequest { identity: RequestIdentity; sql: string; signal?: AbortSignal }
export interface QueryRuntime { execute(request: QueryRequest): Promise<unknown>; invalidate(scope: { dashboardId?: string; sessionId?: string }): void; dispose(): void }
export function createLegacyQueryRuntime<Options, Client>(createQueuedConnector: (options: Options) => Client): { forChart(options: Options): Client }
