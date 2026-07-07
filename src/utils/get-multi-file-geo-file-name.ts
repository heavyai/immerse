// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parseFileName } from "../components/table-importer/table-importer-helpers"

export const getMultiFileGeoFileName = (fileNames: string[]) => {
  const shpFileName = (fileNames || []).find((fileName: string) =>
    fileName.toLowerCase().endsWith(".shp")
  )

  return (
    shpFileName && `${parseFileName(shpFileName)}.${shpFileName.split(".")[1]}`
  )
}
