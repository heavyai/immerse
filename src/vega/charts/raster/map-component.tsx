// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-underscore-dangle */
/* Variables coming from raster-draw-mixin */

import React, { FC, useEffect, useRef, useState } from "react"
import { VegaMapBounds, VegaMapSize } from "./types"
import ReactMapGL, {
  LinearInterpolator,
  Source,
  Layer,
  NavigationControl
} from "react-map-gl"
import WebMercatorViewport from "viewport-mercator-project"
import { debounce } from "lodash"

const mapboxToken = process.env.MAPBOX_TOKEN
const MAP_MOVE_DEBOUNCE_MS = 100
const EASE_DURATION_MS = 500

interface Props {
  basemapStyle: any
  dataBounds: VegaMapBounds | null
  width: number
  height: number
  layerData: string
  events: {
    updateSize: (size: VegaMapSize) => void
    updateBounds: (bounds: VegaMapBounds) => void
  }
}

const getCurrentMapBounds = (mapDivRef) => {
  // Can't seem to get bounds from viewport, so using the map ref to get the current bounding box
  const currentMapBounds = mapDivRef.current.getMap().getBounds()
  return {
    lonMin: currentMapBounds._sw.lng,
    lonMax: currentMapBounds._ne.lng,
    latMin: currentMapBounds._sw.lat,
    latMax: currentMapBounds._ne.lat
  }
}

const updateMapSize = (viewport, updateSize) => {
  const { width, height } = viewport
  updateSize({ width, height })
}

const updateMapBounds = (mapDivRef, updateBounds) => {
  if (mapDivRef && mapDivRef.current) {
    updateBounds(getCurrentMapBounds(mapDivRef))
  }
}

const handleUpdateMap = debounce((viewport, mapDivRef, events) => {
  updateMapBounds(mapDivRef, events.updateBounds)
  updateMapSize(viewport, events.updateSize)
}, MAP_MOVE_DEBOUNCE_MS)

const transitionInterpolator = new LinearInterpolator()

const MapComponent: FC<Props> = ({
  basemapStyle,
  width,
  height,
  dataBounds,
  layerData,
  events
}) => {
  const [viewPort, setViewPort] = useState(null)
  const mapDivRef = useRef(null)

  const pointLayer = {
    id: "overlay",
    source: "overlay",
    type: "raster",
    paint: { "raster-opacity": 0.85, "raster-fade-duration": 0 }
  }

  const [imageBounds, setImageBounds] = useState(null)

  const updateImageBounds = (bounds) => {
    const { lonMin, lonMax, latMin, latMax } = bounds
    const currentImageBounds = [
      [lonMin, latMax],
      [lonMax, latMax],
      [lonMax, latMin],
      [lonMin, latMin]
    ]
    setImageBounds(currentImageBounds)
  }

  const updateViewport = (viewport) => {
    setViewPort({
      ...viewport
    })
    handleUpdateMap(viewport, mapDivRef, events)
  }

  // Initial load
  useEffect(() => {
    const viewport = new WebMercatorViewport({ width, height })
    updateImageBounds(dataBounds)

    const { lonMin, lonMax, latMin, latMax } = dataBounds
    const { longitude, latitude, zoom } = viewport.fitBounds(
      [
        [lonMin, latMin],
        [lonMax, latMax]
      ],
      { padding: 0 }
    )
    setViewPort({
      ...viewport,
      longitude,
      latitude,
      zoom,
      transitionInterpolator,
      transitionDuration: EASE_DURATION_MS
    })
  }, [dataBounds, height, width])

  useEffect(() => {
    if (mapDivRef && mapDivRef.current) {
      updateImageBounds(getCurrentMapBounds(mapDivRef))
    }
  }, [mapDivRef, layerData])

  return (
    <ReactMapGL
      ref={mapDivRef}
      {...viewPort}
      width={width}
      height={height}
      mapStyle={basemapStyle}
      onViewportChange={updateViewport}
      mapboxApiAccessToken={mapboxToken}
    >
      {layerData && (
        <Source type="image" url={layerData} coordinates={imageBounds}>
          <Layer {...pointLayer} />
        </Source>
      )}
      <NavigationControl />
    </ReactMapGL>
  )
}
export default MapComponent
