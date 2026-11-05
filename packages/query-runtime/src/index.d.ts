// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface RequestIdentity {
  dashboardId: string
  chartId: string
  generation: number
  sessionId: string
}
export interface QueryRequest {
  identity: RequestIdentity
  sql: string
  signal?: AbortSignal
}
export interface QueryRuntime {
  execute(request: QueryRequest): Promise<unknown>
  invalidate(scope: { dashboardId?: string; sessionId?: string }): void
  dispose(): void
}
export function createLegacyQueryRuntime<Options, Client>(
  createQueuedConnector: (options: Options) => Client
): { forChart(options: Options): Client }

export interface QueryIdentity {
  sourceId?: string
  chartId: string | number
  dashboardId?: string | number
  sessionId?: string
  channel?: string
}
export interface QueryTicket extends QueryIdentity {
  readonly key: string
  readonly epoch: number
  readonly generation: number
}
export interface ChartQueryRuntime {
  begin(identity: QueryIdentity): QueryTicket
  track(identity: QueryIdentity, promise: Promise<unknown>): QueryTicket
  guard<T>(ticket: QueryTicket, promise: Promise<T>): Promise<T>
  isCurrent(ticket: QueryTicket): boolean
  commit(ticket: QueryTicket, token: string, data: unknown): boolean
  write(chartId: string | number, token: string, data: unknown): boolean
  read(chartId: string | number, token: string): unknown
  readChart(chartId: string | number): Record<string, unknown> | undefined
  getSnapshot(): Record<string, Record<string, unknown>>
  getRenderSnapshot(): Record<string, unknown>
  readRender(chartId: string | number): unknown
  writeRender(chartId: string | number, data: unknown): boolean
  subscribe(listener: () => void): () => void
  onInvalidate(
    listener: (scope: { chartId?: string | number }) => void
  ): () => void
  invalidate(scope?: { chartId?: string | number }): void
  execute<T>(
    identity: QueryIdentity,
    run: (signal: AbortSignal) => Promise<T>,
    options?: { signal?: AbortSignal }
  ): Promise<T>
  dispose(): void
}
export function createChartQueryRuntime(): ChartQueryRuntime
export class StaleQueryError extends Error {}

export function createVegaResultReducers(ports: {
  types: Record<string, string>
  getErrorMessageFromBackendError(error: any): string
}): Record<string, (state: Record<string, any>, action: any) => Record<string, any>>
