// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MapRef, StaticMap, ViewState } from "react-map-gl"
import DeckGL, { FlyToInterpolator, WebMercatorViewport } from "deck.gl"

import Services from "services/immerse"
import { DEFAULT_BASEMAP, INITIAL_VIEW_STATE, LAYER_TYPE } from "../constants"
import { clampLat, clampLon, getBounds } from "../utils"
import { debounce } from "lodash"
import { MapPopup } from "../map-popup/map-popup"
import { MapSettings, PopupResults, PopupState } from "../types"
import { MESSAGE_TYPES, Message } from "components/message/message"
import { HeavyBitmapLayer } from "../layers/heavy-bitmap-layer"
import { BASEMAP_OPTIONS } from "constants/charts"
import { currentTheme } from "utils/dark-mode-switcher"
import { DARK_THEME } from "utils/theme/types"

import "./vega-map.scss"
import { useVegaMetadata } from "../hooks/use-vega-metadata"
import { MapLegend } from "../map-legend/map-legend"

export type IVegaMap = {
  chartSettings: MapSettings
  mapId: number | string
  setLoading: (loading: boolean) => void
  showLegend?: boolean
}

type IVegaRasterMap = IVegaMap & {
  chartKey: LAYER_TYPE
  popupColumns: Array<string>
  children: JSX.Element
  viewState?: ViewState
  setViewState?: (vs: ViewState) => void
  vegaSpec: any
  error?: string
  dataBounds: any
}

export const VegaRasterMap = ({
  // Could do without these
  mapId,
  setLoading,
  // Try to get props down to this
  chartKey,
  vegaSpec,
  popupColumns,
  // Parent manages viewState
  viewState = INITIAL_VIEW_STATE,
  setViewState,
  dataBounds,
  error,
  showLegend = true
}: IVegaRasterMap) => {
  const [layers, setLayers] = useState<Array<any>>([])
  const [popup, setPopup] = useState<PopupState | null>(null)
  const [renderError, setRenderError] = useState(null)
  const [handleVegaMetadata, legendScales] = useVegaMetadata(chartKey)
  const [showPopup, setShowPopup] = useState(false)
  const mapRef = useRef<MapRef | null>(null)

  const getPopup = useMemo(() => {
    const getResultRow = (pixel: number[]) => {
      const pixelCoords = { x: pixel[0], y: viewState.height - pixel[1] }
      Services.get("DbCon")
        .getResultRowForPixelAsync(
          mapId,
          pixelCoords,
          {
            [chartKey]: popupColumns
          },
          2
        )
        .then((results: PopupResults) => {
          // Take the first result for our popup
          // Could easily get em all if needed
          if (results?.[0]?.row_set?.length) {
            setPopup({
              data: results[0].row_set[0],
              coords: pixelCoords
            })
          } else {
            setPopup(null)
          }
        })
    }
    return debounce(getResultRow, 200)
  }, [viewState, mapId, popupColumns, chartKey])

  const onHover = useCallback(
    ({ bitmap }) => {
      if (bitmap?.pixel) {
        const pixel = bitmap.pixel
        getPopup(pixel)
      }
    },
    [getPopup]
  )

  const renderVega = useCallback(
    (vs) => {
      setRenderError(null)
      setLoading(true)
      Services.get("DbCon")
        // One map per cell, is that a valid assumption?
        .renderVegaAsync(mapId, JSON.stringify(vegaSpec))
        .then((result: { image: string; vega_metadata: any }) => {
          const b64Img = `data:image/png;base64,${result.image}`
          handleVegaMetadata(result.vega_metadata, vegaSpec)

          const [nw, se] = getBounds(vs)
          const rasterLayer = new HeavyBitmapLayer({
            id: "bitmap-layer",
            bounds: [nw[0], se[1], se[0], nw[1]],
            image: b64Img,
            pickable: true,
            onHover
          })
          setLayers([rasterLayer])
        })
        .catch((e: any) => {
          setRenderError(e.error_msg || e.message || "Unknown error")
          // eslint-disable-next-line no-console
          console.error(e)
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [setLoading, mapId, vegaSpec, handleVegaMetadata, onHover]
  )
  const debouncedRender = useMemo(() => {
    return debounce(renderVega, 400)
  }, [renderVega])

  useEffect(() => {
    if (vegaSpec) {
      debouncedRender(viewState)
    }
    return () => debouncedRender.cancel()
  }, [debouncedRender, viewState, vegaSpec])

  const theme = currentTheme()
  const basemap = useMemo(() => {
    if (theme === DARK_THEME) {
      return BASEMAP_OPTIONS.find(({ label }) => label === "Dark")?.value
    } else {
      return BASEMAP_OPTIONS.find(({ label }) => label === "Light")?.value
    }
  }, [theme])

  // This manages the transition stuff or no? Could ditch dataBounds prop
  useEffect(() => {
    if (dataBounds && setViewState) {
      setViewState((vs) => {
        let newViewPort = new WebMercatorViewport(vs)
        newViewPort = newViewPort.fitBounds([
          [clampLon(dataBounds.minX), clampLat(dataBounds.minY)],
          [clampLon(dataBounds.maxX), clampLat(dataBounds.maxY)]
        ])
        const newViewState = {
          ...vs,
          ...newViewPort
        }
        return {
          ...newViewState,
          transitionDuration: 500,
          transitionInterpolator: new FlyToInterpolator({ speed: 0.8 })
        }
      })
    }
  }, [dataBounds, setViewState])

  // Check all the places. We could also do an array of errors, but these
  // are all very closely related to parsing the query ATM
  const errorMessage = error || renderError

  return (
    <div
      className="vega-map"
      onMouseOut={() => {
        setPopup(null)
        setShowPopup(false)
      }}
      onMouseOver={() => {
        setShowPopup(true)
      }}
    >
      <DeckGL
        initialViewState={viewState}
        onViewStateChange={(newView) => {
          setPopup(null)
          if (!error) {
            setViewState(newView.viewState)
          }
        }}
        controller={!errorMessage}
        layers={layers}
        width="100%"
        height="100%"
      >
        <StaticMap
          mapStyle={basemap || DEFAULT_BASEMAP}
          mapboxApiAccessToken={process.env.MAPBOX_TOKEN}
          ref={mapRef}
        />
        {popup && showPopup && (
          <MapPopup data={popup.data} x={popup.coords.x} y={popup.coords.y} />
        )}
        {errorMessage && (
          <Message
            className="vega-map-error"
            type={MESSAGE_TYPES.ERROR}
            message={errorMessage}
          />
        )}
      </DeckGL>
      {legendScales && showLegend && <MapLegend scales={legendScales} />}
    </div>
  )
}
