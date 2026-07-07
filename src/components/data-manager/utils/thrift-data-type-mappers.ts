// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  TColumnType,
  TCopyParams,
  TTableRefreshInfo,
  TTableRefreshIntervalType,
  TTableRefreshTimingType,
  TTableRefreshUpdateType
} from "@heavyai/connector/dist/browser-connector"
import { invert } from "lodash"
import Services from "../../../services/immerse"

export const mapRowDescriptorFields = (rowDescriptor: TColumnType[]) => {
  const { _datumEnum, TEncodingTypeMap } = Services.get("DbCon")
  return rowDescriptor.map((colType: TColumnType) => {
    const { col_type, col_name, clean_col_name } = colType
    return {
      ...colType,
      col_name:
        clean_col_name && clean_col_name !== col_name
          ? clean_col_name
          : col_name,
      col_type: {
        ...col_type,
        type: _datumEnum[col_type.type],
        encoding: TEncodingTypeMap[col_type.encoding]
      }
    }
  })
}

export const mapCopyParamsFields = (copyParams: TCopyParams) => {
  const {
    TImportHeaderRowMap,
    TFileTypeMap,
    TEncodingTypeMap,
    _datumEnum,
    TRasterPointTypeMap,
    TRasterPointTransformMap,
    TSourceTypeMap
  } = Services.get("DbCon")
  return {
    ...copyParams,
    file_type: TFileTypeMap[copyParams.file_type],
    has_header: TImportHeaderRowMap[copyParams.has_header],
    geo_coords_encoding: TEncodingTypeMap[copyParams.geo_coords_encoding],
    geo_coords_type: _datumEnum[copyParams.geo_coords_type],
    raster_point_type: TRasterPointTypeMap[copyParams.raster_point_type],
    raster_point_transform:
      TRasterPointTransformMap[copyParams.raster_point_transform],
    source_type: TSourceTypeMap[copyParams.source_type]
  }
}

export const mapRefreshInfoFields = (refreshInfo: TTableRefreshInfo) => {
  return {
    ...refreshInfo,
    timing_type: invert(TTableRefreshTimingType)[refreshInfo.timing_type],
    update_type: invert(TTableRefreshUpdateType)[refreshInfo.update_type],
    interval_type: invert(TTableRefreshIntervalType)[refreshInfo.interval_type]
  }
}
