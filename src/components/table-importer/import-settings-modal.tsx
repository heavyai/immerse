// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { SimpleDialog } from "widgets/dialog/Dialog"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { Switch } from "widgets/switch/Switch"
import CustomSelector from "components/custom-selector/custom-selector"
import {
  TEncodingType,
  TCopyParams,
  TImportHeaderRow,
  TSourceType,
  TRasterPointType,
  TRasterPointTransform
} from "@heavyai/connector/dist/browser-connector"
import { toggleImportSettingsModal } from "actions/importer-action-creators"
import { setImportSettings } from "../../actions/importer-action-creators"
import { ImporterState, ImportSettings } from "../../reducers/importer-reducer"

interface IImportSettingsModalProps {
  requestImportPreviewData: () => void
  shouldShowGeoImportOptions: boolean
}

// More than one 'hardware info' result means we are connected to a distributed cluster.
// This matters for showing the 'Replicate Table' option (across distributed nodes)
// in the import settings.
const hardwareIsDistributed = (hardwareInfo) =>
  Array.isArray(hardwareInfo) && hardwareInfo.length > 1

const ImportSettingsModal: FC<IImportSettingsModalProps> = ({
  requestImportPreviewData,
  shouldShowGeoImportOptions
}) => {
  const [localCopyParams, setLocalCopyParams] = useState({})
  const dispatch = useDispatch()
  const isDistributed = useSelector(({ connection: { hardwareInfo } }: any) =>
    hardwareIsDistributed(hardwareInfo)
  )
  const copyParams: ImportSettings = useSelector(
    ({ importer }: { importer: ImporterState }) => importer.settings
  )
  const open = useSelector(
    ({ importer }: { importer: ImporterState }) =>
      importer.showImportSettingsModal
  )

  const isDelimitedType = copyParams.source_type === TSourceType.DELIMITED_FILE
  const isRasterType = copyParams.source_type === TSourceType.RASTER_FILE

  useEffect(() => {
    if (open) {
      setLocalCopyParams({ ...copyParams })
    }
  }, [open]) // eslint-disable-line

  const DELIMITER_OPTIONS = [
    { label: "Auto Detect", value: "" },
    { label: ",", value: "," },
    { label: "Tab", value: "\\t" },
    { label: "|", value: "|" },
    { label: "Space", value: " " }
  ]

  const RASTER_POINT_TYPE_OPTIONS = [
    { label: "None", value: TRasterPointType.NONE },
    { label: "Auto", value: TRasterPointType.AUTO },
    { label: "Small Int", value: TRasterPointType.SMALLINT },
    { label: "Int", value: TRasterPointType.INT },
    { label: "Float", value: TRasterPointType.FLOAT },
    { label: "Double", value: TRasterPointType.DOUBLE },
    { label: "Point", value: TRasterPointType.POINT }
  ]

  const RASTER_POINT_TRANSFORM_OPTIONS = [
    {
      label: "None",
      value: TRasterPointTransform.NONE,
      disabled:
        localCopyParams.raster_point_type === TRasterPointType.POINT ||
        localCopyParams.raster_point_compute_angle
    },
    {
      label: "Auto",
      value: TRasterPointTransform.AUTO,
      disabled:
        localCopyParams.raster_point_type === TRasterPointType.POINT ||
        localCopyParams.raster_point_compute_angle
    },
    {
      label: "File",
      value: TRasterPointTransform.FILE,
      disabled:
        localCopyParams.raster_point_type === TRasterPointType.POINT ||
        localCopyParams.raster_point_compute_angle
    },
    {
      label: "World",
      value: TRasterPointTransform.WORLD,
      disabled: [TRasterPointType.SMALLINT, TRasterPointType.INT].includes(
        localCopyParams.raster_point_type
      )
    }
  ]

  // only GEOMETRY is a valid option, currently - uncomment once this changes
  // const GEO_TYPE_OPTIONS = [
  //   { label: "Geography", value: TDatumType.GEOGRAPHY },
  //   { label: "Geometry", value: TDatumType.GEOMETRY }
  // ]

  // only WGS 84 (EPSG:4326) is a valid option now
  // const GEO_SRID_OPTIONS = [
  //   { label: "WGS 84 (EPSG:4326)", value: 4326 },
  //   { label: "Mercator (EPSG:3857)", value: 3857 },
  //   { label: "Google Mercator (EPSG:900913)", value: 900913 }
  // ]

  // geo_coords_encoding = 0 / TEncodingType.GEOINT
  // geo_coords_comp_param = 0 / 32
  const GEO_ENCODING_OPTIONS = [
    { label: "COMPRESSED(32) / 50%", value: TEncodingType.GEOINT },
    { label: "None", value: 0 }
  ]

  const DEFAULT_GEO_COORDS_COMP_PARAM = new TCopyParams().geo_coords_comp_param

  const updateCopyParam = (setting) => (value) =>
    setLocalCopyParams((existing) => ({ ...existing, [setting]: value }))
  const updateCopyParamEventHandler = (setting, property) => (e) =>
    updateCopyParam(setting)(e.target[property])

  const applySettings = () => {
    dispatch(setImportSettings(localCopyParams))
    requestImportPreviewData()
    dispatch(toggleImportSettingsModal(false))
  }

  return (
    <SimpleDialog
      title="Import Settings"
      open={open}
      className="import-settings-dialog"
      footer={
        <>
          <div>
            <SecondaryButton
              onClick={() => dispatch(toggleImportSettingsModal(false))}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={() => applySettings()}>Apply</PrimaryButton>
          </div>
        </>
      }
      onCloseFromHeader={() => dispatch(toggleImportSettingsModal(false))}
    >
      <div className="import-settings-modal" key="panel-left">
        {isRasterType && (
          <div className="table-importer-option-list-container">
            <div className="table-importer-option-container">
              <div className="table-importer-option-title">
                Raster Point Type
              </div>
              <CustomSelector
                className="raster-point-type-options"
                currentValue={localCopyParams.raster_point_type}
                onChange={(newVal: TRasterPointType) => {
                  if (
                    [TRasterPointType.SMALLINT, TRasterPointType.INT].includes(
                      newVal
                    ) &&
                    localCopyParams.raster_point_transform ===
                      TRasterPointTransform.WORLD
                  ) {
                    updateCopyParam("raster_point_transform")(
                      TRasterPointTransform.AUTO
                    )
                  } else if (newVal === TRasterPointType.POINT) {
                    updateCopyParam("raster_point_transform")(
                      TRasterPointTransform.WORLD
                    )
                  }
                  updateCopyParam("raster_point_type")(newVal)
                }}
                options={RASTER_POINT_TYPE_OPTIONS}
              />
            </div>
            <div className="table-importer-option-container">
              <div className="table-importer-option-title">
                Raster Point Transform
              </div>
              <CustomSelector
                className="raster-point-type-options"
                currentValue={localCopyParams.raster_point_transform}
                onChange={(newVal: TRasterPointTransform) => {
                  updateCopyParam("raster_point_transform")(newVal)
                }}
                options={RASTER_POINT_TRANSFORM_OPTIONS}
              />
            </div>
            <div className="table-importer-option-container">
              <label
                className="table-importer-option-title"
                htmlFor="raster-compute-angle-checkbox"
              >
                Compute Angle
              </label>
              <Switch
                id="has-header-checkbox"
                className="table-importer-option-checkbox"
                checked={localCopyParams.raster_point_compute_angle}
                onChange={(event) => {
                  const computeAngle = event.target.checked
                  if (computeAngle) {
                    updateCopyParam("raster_point_transform")(
                      TRasterPointTransform.WORLD
                    )
                  }
                  updateCopyParam("raster_point_compute_angle")(computeAngle)
                }}
              />
            </div>
          </div>
        )}
        {isDelimitedType && (
          <div className="table-importer-option-list-container">
            <div className="table-importer-option-container">
              <div className="table-importer-option-title">Null String</div>
              <input
                className="table-importer-option-text-input"
                onChange={updateCopyParamEventHandler("null_str", "value")}
                value={localCopyParams.null_str}
              />
            </div>

            <div className="table-importer-option-container">
              <div className="table-importer-option-title">Delimiter Type</div>
              <CustomSelector
                className="delimiter-options"
                currentValue={localCopyParams.delimiter}
                onChange={updateCopyParam("delimiter")}
                options={DELIMITER_OPTIONS}
              />
            </div>

            <div className="table-importer-option-checkboxgroup">
              <div className="table-importer-option-container">
                <label
                  className="table-importer-option-title"
                  htmlFor="has-header-checkbox"
                >
                  Includes Header Row
                </label>
                <Switch
                  id="has-header-checkbox"
                  className="table-importer-option-checkbox"
                  checked={
                    localCopyParams.has_header !== TImportHeaderRow.NO_HEADER
                  }
                  onChange={(event) => {
                    const hasHeader = event.target.checked
                      ? TImportHeaderRow.HAS_HEADER
                      : TImportHeaderRow.NO_HEADER
                    updateCopyParam("has_header")(hasHeader)
                  }}
                />
              </div>

              <div className="table-importer-option-container">
                <label
                  className="table-importer-option-title"
                  htmlFor="quoted-string-checkbox"
                >
                  Quoted String
                </label>
                <Switch
                  id="quoted-string-checkbox"
                  className="table-importer-option-checkbox"
                  checked={localCopyParams.quoted}
                  onChange={updateCopyParamEventHandler("quoted", "checked")}
                />
              </div>
            </div>
            {isDistributed && (
              <div className="table-importer-option-checkboxgroup">
                <div className="table-importer-option-container">
                  <input
                    id="table-importer-option-checkbox-is_replicated"
                    className="table-importer-option-checkbox"
                    checked={localCopyParams.is_replicated}
                    onChange={updateCopyParamEventHandler(
                      "is_replicated",
                      "checked"
                    )}
                    type="checkbox"
                  />
                  <label
                    className="table-importer-option-title"
                    htmlFor="table-importer-option-checkbox-is_replicated"
                  >
                    Replicate Table
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {shouldShowGeoImportOptions && (
          <div className="table-importer-option-list-container">
            {/*  only GEOMETRY is a valid option, currently - uncomment once this changes
            <div className="table-importer-option-container">
            <div className="table-importer-option-title">Geo Type</div>
            <CustomSelector
            bottom
            className="delimiter-options"
            currentValue={props.copyParams.geo_coords_type}
            onChange={value =>
            props.updateCopyParam("geo_coords_type", "value")({
            target: { value }
            })
            }
            options={GEO_TYPE_OPTIONS}
            />
            </div>
             */}
            <div className="table-importer-option-container">
              <div className="table-importer-option-title">Geo Type</div>
              <span className="table-importer-option-placeholder">
                GEOMETRY
              </span>
            </div>

            {/* Only WGS 84 (EPSG:4326) is valid right now
            <div className="table-importer-option-container">
            <div className="table-importer-option-title">Geo SRID</div>
            <CustomSelector
            bottom
            className="delimiter-options"
            currentValue={props.copyParams.geo_coords_srid}
            onChange={value =>
            props.updateCopyParam("geo_coords_srid", "value")({
            target: { value }
            })
            }
            options={GEO_SRID_OPTIONS}
            />
            </div>
             */}
            <div className="table-importer-option-container">
              <div className="table-importer-option-title">Geo SRID</div>
              <span className="table-importer-option-placeholder">
                WGS 84 (EPSG:4326)
              </span>
            </div>

            <div className="table-importer-option-container">
              <div className="table-importer-option-title">
                Geo Encoding / Compression
              </div>
              <CustomSelector
                className="delimiter-options"
                currentValue={localCopyParams.geo_coords_encoding}
                onChange={(value) => {
                  updateCopyParam("geo_coords_encoding")(value)
                  updateCopyParam("geo_coords_comp_param")(
                    value === 0 ? 0 : DEFAULT_GEO_COORDS_COMP_PARAM
                  )
                }}
                options={GEO_ENCODING_OPTIONS}
              />
            </div>
          </div>
        )}
      </div>
    </SimpleDialog>
  )
}

export default ImportSettingsModal
