// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type DataCatalogItem = {
  name: string
  s3URL?: string
  imageURL?: string
  localFilename?: string
  localImageFilename?: string
  byteCount: number
  rowCount: number
  columnCount: number
  lastUpdate: string // ISO date string
  hasGeo: boolean
  accessKey?: string
  secretKey?: string
}

export type DataCatalog = {
  pending: boolean
  error: Error | null
  catalogItems: DataCatalogItem[] | null
}
