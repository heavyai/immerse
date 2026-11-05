// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
export interface PersistedChart { type: string; version?: number; [key: string]: JsonValue | undefined }
export interface DashboardDocument { charts?: { [id: string]: PersistedChart }; dashboard?: { [key: string]: JsonValue }; [key: string]: unknown }
export interface Base64Codec { btoa(binary: string): string; atob(wire: string): string }
export interface DocumentMigration<Context> { id: string; apply(document: DashboardDocument, context: Context): DashboardDocument }
export const persistedDashboardKeys: readonly string[]
export function encodeDashboard(document: DashboardDocument, codec: Base64Codec): string
export function decodeDashboard(wire: string, codec: Base64Codec): DashboardDocument
export function migrateDocument<Context>(document: DashboardDocument, migrations: readonly DocumentMigration<Context>[], context: Context): DashboardDocument

export function mapDashboardCharts<T>(document: T, transform: (chart: PersistedChart) => PersistedChart): T

export function upgradeChartMap<T extends PersistedChart>(charts: { [id: string]: T }, migrationContext: { upgradeChart(chart: T): T }): { [id: string]: T }
