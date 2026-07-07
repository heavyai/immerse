// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useRef, useState } from "react"
import { Style as MapStyle } from "mapbox-gl"
import { StaticMap } from "react-map-gl"
import DeckGL, { Layer, TerrainLayer } from "deck.gl"
import { throttle } from "lodash"

import ChartErrors from "components/chart-errors/chart-errors"
import DataEventTarget, {
  DataEvent,
  ErrorEvent,
  LayerEvent
} from "./data-event-target"
import { PopupInfo, PopupSetter, buildLayer, updateLayerData } from "./layers"
import { OFFLINE_BASEMAP } from "constants/charts"
import { DeckGLLayerVisualSpec } from "./visual-spec"
import { autoFormat } from "services/vega"
import { resolveBasemapValue } from "charts/raster-chart/basemap"

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN
const TERRAIN_IMAGE = `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`
const TERRAIN_TEXTURE_IMAGE = `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`
const TERRAIN_LAYER_IDX = 0
const POPUP_THROTTLE = 500

// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb
// Note - the elevation rendered by this example is greatly exagerated!
const ELEVATION_DECODER = {
  rScaler: 6553.6,
  gScaler: 25.6,
  bScaler: 0.1,
  offset: -10000
}

enum TerrainDisplayMode {
  SATELLITE = "satellite",
  WIREFRAME = "wireframe",
  SURFACE = "surface",
  NONE = "none"
}

interface Props {
  basemap: string | MapStyle
  visualSpecs: DeckGLLayerVisualSpec[]
  dataNotifier: DataEventTarget
  initialViewState: object
  onViewStateChange(arg: object): void
  width: number
  height: number
}

function getTerrainDisplayMode(basemap: string | MapStyle): TerrainDisplayMode {
  switch (basemap) {
    case "3d_satellite":
      return TerrainDisplayMode.SATELLITE
    case "3d_wireframe":
      return TerrainDisplayMode.WIREFRAME
    case "3d_surface":
      return TerrainDisplayMode.SURFACE
    default:
      return TerrainDisplayMode.NONE
  }
}

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

function popupSetter(
  spec: DeckGLLayerVisualSpec,
  setter: PopupSetter
): PopupSetter {
  if (spec.popupColumns?.length) {
    const cols = spec.popupColumns
    return (info: any) => {
      if (info && info.object) {
        setter({
          x: info.x,
          y: info.y,
          data: cols.map(({ key, label, format }) => ({
            label,
            value: format
              ? autoFormat(info.object[key], format)
              : info.object[key]
          }))
        })
      } else {
        setter(null)
      }
    }
  }
  return () => setter(null)
}

const DeckGLChartComponent: FC<Props> = ({
  basemap,
  visualSpecs,
  dataNotifier,
  initialViewState,
  onViewStateChange,
  width,
  height
}) => {
  const loadingLayers = useRef(new Set<number>())
  const errorByLayer = useRef<Record<number, string>>({})
  const [layers, setLayers] = useState<Array<Layer<any> | null>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const [popup, setPopup] = useState<PopupInfo | null>(null)

  const terrainDisplayMode = getTerrainDisplayMode(basemap)
  useEffect(() => {
    setLayers((lyrs) => {
      const newLayers = [...lyrs]
      newLayers[TERRAIN_LAYER_IDX] = new TerrainLayer({
        id: "terrain_layer",
        minZoom: 0,
        maxZoom: 15,
        strategy: "no-overlap",
        elevationDecoder: ELEVATION_DECODER,
        // Need to set terrain and texture sources to null if layer is invisible, otherwise tiles get pulled
        elevationData:
          terrainDisplayMode !== TerrainDisplayMode.NONE ? TERRAIN_IMAGE : null,
        texture:
          terrainDisplayMode === TerrainDisplayMode.SATELLITE
            ? TERRAIN_TEXTURE_IMAGE
            : null,
        wireframe: terrainDisplayMode === TerrainDisplayMode.WIREFRAME,
        color: [200, 200, 200],
        visible: terrainDisplayMode !== TerrainDisplayMode.NONE
      })
      return newLayers
    })
  }, [terrainDisplayMode])

  useEffect(() => {
    setLayers((lyrs) => {
      // +1 because first layer is terrain
      const newLayers = new Array(visualSpecs.length + 1)
      const throttledSetPopup = throttle(setPopup, POPUP_THROTTLE)
      newLayers[0] = lyrs[0]
      visualSpecs.forEach((spec, idx) => {
        if (spec) {
          const id = `layer_${idx}`
          const onHover = popupSetter(spec, throttledSetPopup)
          newLayers[idx + 1] = buildLayer(id, spec, onHover, lyrs[idx + 1])
        } else {
          newLayers[idx + 1] = null
        }
      })
      return newLayers
    })
  }, [visualSpecs, setPopup])

  useEffect(() => {
    const updateLoadingAndErrors = () => {
      setErrors(Object.values(errorByLayer.current))
      setLoading(loadingLayers.current.size > 0)
    }

    const loadingListener = (ev: LayerEvent) => {
      loadingLayers.current.add(ev.layerIndex)
      delete errorByLayer.current[ev.layerIndex]
      updateLoadingAndErrors()
    }

    const errorListener = (ev: ErrorEvent) => {
      loadingLayers.current.delete(ev.layerIndex)
      errorByLayer.current[ev.layerIndex] = ev.message
      updateLoadingAndErrors()
    }

    const noDataListener = (ev: LayerEvent) => {
      loadingLayers.current.delete(ev.layerIndex)
      delete errorByLayer.current[ev.layerIndex]
      updateLoadingAndErrors()

      setLayers((lyrs) => {
        // +1 because first layer is terrain
        const layer = lyrs[ev.layerIndex + 1]
        if (isDefined(layer)) {
          const newLayers = [...lyrs]
          newLayers[ev.layerIndex + 1] = layer.clone({
            data: []
          })
          return newLayers
        }
        return lyrs
      })
    }

    const dataListener = (ev: DataEvent) => {
      loadingLayers.current.delete(ev.layerIndex)
      delete errorByLayer.current[ev.layerIndex]
      updateLoadingAndErrors()

      setLayers((lyrs) => {
        // +1 because first layer is terrain
        const id = `layer_${ev.layerIndex}`
        const newLayer = updateLayerData(
          id,
          ev.type,
          ev.data,
          lyrs[ev.layerIndex + 1]
        )
        const newLayers = [...lyrs]
        newLayers[ev.layerIndex + 1] = newLayer
        return newLayers
      })
    }

    dataNotifier.addEventListener("loading", loadingListener)
    dataNotifier.addEventListener("error", errorListener)
    dataNotifier.addEventListener("data", dataListener)
    dataNotifier.addEventListener("nodata", noDataListener)

    return () => {
      dataNotifier.removeEventListener("loading", loadingListener)
      dataNotifier.removeEventListener("error", errorListener)
      dataNotifier.removeEventListener("data", dataListener)
      dataNotifier.removeEventListener("nodata", noDataListener)
    }
  }, [dataNotifier])

  const mapStyle =
    terrainDisplayMode === TerrainDisplayMode.NONE
      ? basemap
      : terrainDisplayMode === TerrainDisplayMode.SATELLITE
      ? "mapbox://styles/mapbox/satellite-v9"
      : resolveBasemapValue(OFFLINE_BASEMAP[0].value)
  return (
    <div>
      {errors.length === 0 && (
        <DeckGL
          initialViewState={initialViewState}
          onViewStateChange={onViewStateChange}
          controller
          layers={layers.filter(Boolean)}
          width={width}
          height={height}
        >
          <StaticMap mapStyle={mapStyle} mapboxApiAccessToken={MAPBOX_TOKEN} />
          {popup && (
            <div
              className="deckgl-popup"
              style={{
                left: popup.x,
                top: popup.y
              }}
            >
              {popup.data.map(({ label, value }) => (
                <div className="deckgl-popup-item" key={label}>
                  <span className="deckgl-popup-key">{label}:</span>&nbsp;
                  <span className="deckgl-popup-value">{value}</span>
                </div>
              ))}
            </div>
          )}
        </DeckGL>
      )}
      {loading && (
        <div className="loading-spinner">
          <div className="loading-spinner-icon" />
        </div>
      )}
      {errors.length > 0 &&
        errors.map((err, index) => (
          <div key={index} className="error-message-container">
            <ChartErrors errorMessage={err} />
          </div>
        ))}
    </div>
  )
}

export default React.memo(DeckGLChartComponent)
