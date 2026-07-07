// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  ChangeEventHandler,
  FC,
  FocusEventHandler,
  useEffect,
  useRef,
  useState
} from "react"
import { connect } from "react-redux"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import { SimpleDialog } from "widgets/dialog/Dialog"
import { Checkbox } from "@rmwc/checkbox"
import { Radio } from "@rmwc/radio"
import { TextField } from "widgets/text-field/TextField"
import "@material/radio/dist/mdc.radio.css"
import { hideModal } from "actions/ui-action-creators"
import { buildRasterExportSql } from "charts/raster-chart/raster-sql"
import APP_CONFIG from "constants/app-config"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { CHART_TYPES } from "../../constants/charts"
import { format } from "date-fns"
import Services from "services/immerse"
import { isLayerHidden } from "../../charts/raster-chart/raster-utils"
import { Icon } from "@rmwc/icon"

const {
  MAP_EXPORT_LIMIT,
  TABLE_EXPORT_LIMIT,
  SQLLogging
} = available_feature_flags

const MAP_EXPORT_LIMIT_VALUE = getFeatureFlag(MAP_EXPORT_LIMIT)
const TABLE_EXPORT_LIMIT_VALUE = getFeatureFlag(TABLE_EXPORT_LIMIT)

const CSV_FILE_TYPE = { label: "CSV", value: "csv", extension: ".csv" }

const FILETYPES = [
  { label: "GeoJSON", value: "geojson", extension: ".geojson" },
  { label: "GeoJSONL", value: "geojsonl", extension: ".geojson" },
  { label: "Shapefile", value: "shapefile", extension: ".shp" },
  { label: "FlatGeoBuf", value: "flatgeobuf", extension: ".fgb" },
  CSV_FILE_TYPE
]

const COMPRESSION_TYPES = [
  { label: "zip", value: "zip" },
  { label: "gzip", value: "gzip" }
]

const TABLE_EXPORT_OPTION_VALUES = {
  EXPORT_ALL: "EXPORT_ALL",
  CUSTOM_EXPORT: "CUSTOM_EXPORT"
}
const TABLE_EXPORT_OPTIONS = [
  {
    label: `Export all data (limit ${TABLE_EXPORT_LIMIT_VALUE} rows)`,
    value: TABLE_EXPORT_OPTION_VALUES.EXPORT_ALL
  },
  {
    label: `Export custom number of rows (limit ${TABLE_EXPORT_LIMIT_VALUE} rows)`,
    value: TABLE_EXPORT_OPTION_VALUES.CUSTOM_EXPORT
  }
]

const SQL_LIMIT_OFFSET_REGEX = /((limit)\s\d+\s(offset)\s\d+)/gim
const setLimitOffsetClause = (sql: string, limit?: number | null) =>
  limit || limit === 0
    ? sql.replace(SQL_LIMIT_OFFSET_REGEX, `LIMIT ${limit} OFFSET 0`)
    : sql

type Props = {
  chartId: string
  chart: object
  hideModal(): void
}

const ChartExportModal: FC<Props> = ({
  chartId,
  chart,
  hideModal: onClose
}) => {
  const configuredExportLimit =
    chart.type === CHART_TYPES.TABLE
      ? TABLE_EXPORT_LIMIT_VALUE
      : MAP_EXPORT_LIMIT_VALUE

  const layers = (chart.layers || [])
    .map((layer, index) => ({ index, layer }))
    .filter(({ layer: { type } }) => type !== "geoheat")

  const isSafari =
    /Safari/.test(navigator.userAgent) &&
    /Apple Computer/.test(navigator.vendor)

  const [filetype, setFiletype] = useState(
    chart.type === CHART_TYPES.TABLE ? CSV_FILE_TYPE.value : FILETYPES[0].value
  )
  const [extension, setExtension] = useState(
    chart.type === CHART_TYPES.TABLE
      ? CSV_FILE_TYPE.extension
      : FILETYPES[0].extension
  )
  const [compressionType, setCompressionType] = useState(
    COMPRESSION_TYPES[0].value
  )

  const firstVisibleLayer = layers.length
    ? layers.find((l) => !isLayerHidden(l.layer))
    : chart
  const [layerIndex, setLayerIndex] = useState(
    layers.length ? firstVisibleLayer?.index : 0
  )
  const [useCompression, setUseCompression] = useState(!isSafari)
  const [filename, setFilename] = useState<string | null>(null)
  const [layername, setLayername] = useState<string | null>(null)
  const [sql, setSql] = useState("")
  const formRef = useRef<HTMLFormElement | null>(null)
  const [tableExportOption, setTableExportOption] = useState(
    TABLE_EXPORT_OPTION_VALUES.EXPORT_ALL
  )
  const [customTableExportLimit, setCustomTableExportLimit] = useState(
    configuredExportLimit
  )

  useEffect(() => {
    const dcChart = Services.get("dc").getChart(chart.dcFlag)
    const limit =
      tableExportOption === TABLE_EXPORT_OPTION_VALUES.EXPORT_ALL
        ? configuredExportLimit
        : customTableExportLimit

    const newSql = (chart.type === CHART_TYPES.TABLE
      ? setLimitOffsetClause(dcChart.getTableQuery(true), limit)
      : buildRasterExportSql(chartId, chart, layerIndex, limit)
    ).replace(/\n/g, " ") // apparently the backend cannot handle newlines
    if (getFeatureFlag(available_feature_flags.SQLLogging)) {
      console.log("Export SQL => ", newSql) // eslint-disable-line no-console
    }
    setSql(newSql)
  }, [
    chartId,
    chart,
    layerIndex,
    tableExportOption,
    configuredExportLimit,
    customTableExportLimit
  ])

  useEffect(() => {
    if (filetype === "shapefile" && compressionType !== "zip") {
      setCompressionType("zip")
    }
  }, [filetype, compressionType])

  const updateFiletype: ChangeEventHandler<HTMLInputElement> = (e) => {
    const val = e.currentTarget.value
    setFiletype(val)
    setExtension((currentExtension) => {
      const ext =
        FILETYPES.find(({ value }) => value === val)?.extension ||
        FILETYPES[0].extension
      if (ext !== currentExtension) {
        setFilename((fn) => {
          if (fn) {
            if (fn.toLowerCase().endsWith(currentExtension)) {
              fn = fn.substr(0, fn.length - currentExtension.length)
            }
            if (!fn.toLowerCase().endsWith(ext)) {
              fn += ext
            }
          }
          return fn
        })
      }
      return ext
    })
  }

  const updateLayerIndex: ChangeEventHandler<HTMLSelectElement> = (value) => {
    setLayerIndex(Number(value))
  }

  const updateCompression: ChangeEventHandler<HTMLInputElement> = (e) => {
    setUseCompression(e.currentTarget.checked)
  }

  const updateFilename: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFilename(e.currentTarget.value)
  }

  const ensureFileExtension: FocusEventHandler<HTMLInputElement> = () => {
    setFilename((fn) => {
      if (fn && !fn.toLowerCase().endsWith(extension)) {
        fn += extension
      }
      return fn
    })
  }

  const updateLayername: ChangeEventHandler<HTMLInputElement> = (e) => {
    setLayername(e.currentTarget.value)
  }

  const fileNameTimeStamp = format(new Date(), `yyyy-MM-dd'T'HH-mm-ss`)

  const getFileNameValue = () => {
    if (filename || filename === "") {
      return filename
    }
    // Table chart
    if (chart.type === CHART_TYPES.TABLE) {
      return `chart${chartId}_table_${fileNameTimeStamp}${extension}`
    }

    // Is a layered chart
    if (layerIndex) {
      return `chart${chartId}_${chart.layers[layerIndex].type}${layerIndex}_${fileNameTimeStamp}${extension}`
    }

    // Single layer chart
    return `chart${chartId}_${chart.type}_${fileNameTimeStamp}${extension}`
  }

  const fileNameValue = getFileNameValue()

  const getLayerNameValue = () => {
    if (layername) {
      return layername
    }

    // Table chart
    if (chart.type === CHART_TYPES.TABLE) {
      return `chart${chartId}_table`
    }

    // Is layered chart
    if (layerIndex) {
      return `chart${chartId}_${chart.layers[layerIndex].type}${layerIndex}`
    }

    // Single layer chart
    return `chart${chartId}_${chart.type}`
  }
  const layerNameValue = getLayerNameValue()

  const layerOptions = layers.map(({ index, layer }) => ({
    label: `Layer ${index + 1}: ${layer.type}`,
    value: String(index),
    isDisabled: isLayerHidden(layer)
  }))

  const invalidCustomLimit =
    tableExportOption === TABLE_EXPORT_OPTION_VALUES.CUSTOM_EXPORT &&
    (!customTableExportLimit ||
      customTableExportLimit < 0 ||
      customTableExportLimit > TABLE_EXPORT_LIMIT_VALUE)

  const allowSubmit = !invalidCustomLimit && fileNameValue
  const submit = () => {
    if (!allowSubmit) {
      return
    }
    if (formRef.current) {
      if (getFeatureFlag(SQLLogging)) {
        // eslint-disable-next-line no-console
        console.log("Export query => ", process(sql, { trackUsage: false }))
      }
      formRef.current.submit()
    }
    if (chart.layers?.length <= 1) {
      onClose()
    }
  }

  return (
    <SimpleDialog
      title="Download Data"
      className="chart-export-modal"
      primaryAction={submit}
      primaryLabel="Download"
      secondaryAction={onClose}
      onCloseFromHeader={onClose}
      open
    >
      <form
        ref={formRef}
        action={`${APP_CONFIG.url}/export`}
        method="POST"
        target="_blank"
      >
        <input
          type="hidden"
          name="sql"
          value={process(sql, { trackUsage: false })}
        />
        <div className="chart-export-options">
          {chart.type === CHART_TYPES.TABLE ? (
            <>
              {TABLE_EXPORT_OPTIONS.map((option, i) => (
                <Radio
                  key={i}
                  {...{
                    value: tableExportOption,
                    checked: option.value === tableExportOption,
                    onChange: () => setTableExportOption(option.value),
                    ripple: { accent: false }
                  }}
                >
                  {option.label}
                  {option.value ===
                    TABLE_EXPORT_OPTION_VALUES.CUSTOM_EXPORT && (
                    <TextField
                      {...{
                        type: "number",
                        invalid: invalidCustomLimit,
                        value: customTableExportLimit,
                        disabled:
                          tableExportOption !==
                          TABLE_EXPORT_OPTION_VALUES.CUSTOM_EXPORT,
                        onChange: ({ target }) => {
                          setCustomTableExportLimit(target.value)
                        }
                      }}
                    />
                  )}
                </Radio>
              ))}
              <input
                {...{
                  type: "hidden",
                  name: "fileType",
                  value: CSV_FILE_TYPE.value
                }}
              />
            </>
          ) : (
            <>
              <span>Select the file format for download:</span>
              {FILETYPES.map(({ label, value }) => (
                <Radio
                  key={`filetype-${value}`}
                  name="filetype"
                  value={value}
                  checked={filetype === value}
                  onChange={updateFiletype}
                  ripple={{ accent: false }}
                >
                  {label}
                </Radio>
              ))}
            </>
          )}

          {}
        </div>

        {!isSafari && filetype !== "csv" && filetype !== "flatgeobuf" && (
          <div className="compression-options">
            <Checkbox
              label="Use Compression"
              checked={useCompression}
              onChange={updateCompression}
              ripple={false}
            />
            {useCompression && (
              <>
                <input
                  type="hidden"
                  name="compression"
                  value={compressionType}
                />
                <MultiSelect
                  placeholder="Compression Type"
                  value={COMPRESSION_TYPES.find(
                    (c) => c.value === compressionType
                  )}
                  options={
                    filetype === "shapefile"
                      ? [COMPRESSION_TYPES[0]]
                      : COMPRESSION_TYPES
                  }
                  onChange={(option) => setCompressionType(option.value)}
                />
              </>
            )}
          </div>
        )}
        {layers.length > 1 && (
          <MultiSelect
            value={layerOptions[layerIndex]}
            placeholder={"Layer"}
            options={layerOptions}
            onChange={(option) => updateLayerIndex(option.value)}
          />
        )}
        {layers.some((l) => isLayerHidden(l.layer)) && (
          <div className="hidden-layer-warning">
            <Icon icon="error" />
            <p>
              {
                "Export is disabled for hidden layers. To export a layer's data, ensure that layer is toggled to visible and that the current zoom level is within the layer's visible zoom level."
              }
            </p>
          </div>
        )}
        <TextField
          {...{
            name: "filename",
            label: "File name",
            value: fileNameValue,
            onChange: updateFilename,
            onBlur: ensureFileExtension,
            invalid: !fileNameValue
          }}
        />
        {filetype !== "csv" && (
          <TextField
            name="layername"
            label="GeoJSON Layer Name"
            value={layerNameValue}
            onChange={updateLayername}
          />
        )}
      </form>
    </SimpleDialog>
  )
}

const mapStateToProps = (state, props) => ({
  chart: state.charts[props.chartId]
})

const mapDispatchToProps = {
  hideModal
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartExportModal)
