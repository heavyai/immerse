// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface QueryOptions { [key: string]: unknown }
export interface LegacyDbClient {
  queryAsync(sql: string, options?: QueryOptions): Promise<unknown>
  queryDFAsync(sql: string, options?: QueryOptions): Promise<unknown>
  renderVegaAsync(widgetId: string, spec: unknown, options?: QueryOptions): Promise<unknown>
  getTablesAsync(): Promise<unknown>
}
export interface DbTransport {
  query(sql: string, options?: QueryOptions): Promise<unknown>
  queryArrow(sql: string, options?: QueryOptions): Promise<unknown>
  render(widgetId: string, spec: unknown, options?: QueryOptions): Promise<unknown>
  getTables(): Promise<unknown>
  readonly cancellation: "discard-results-only"
}
export function createDbTransport(client: LegacyDbClient): DbTransport
