// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as HeavyAIDraw from "import-shims/heavyai-draw"
import * as LatLonUtils from "vega/charts/raster/utils-latlon"

export const INIT_VERTEX_LABEL_GEOJSON = {
  type: "FeatureCollection",
  features: []
}

const VERTEX_LABEL_LAYER_ID = "vertex-labels"
const VERTEX_LABEL_LAYER_SOURCE = "vertex-labels-source"

// Initialize mapbox layer for placing labels
export function addVertexLabelLayer(dcChart) {
  if (!dcChart.map().getSource(VERTEX_LABEL_LAYER_SOURCE)) {
    dcChart.map().addSource(VERTEX_LABEL_LAYER_SOURCE, {
      type: "geojson",
      data: INIT_VERTEX_LABEL_GEOJSON
    })
  }

  if (!dcChart.map().getLayer(VERTEX_LABEL_LAYER_ID)) {
    dcChart.map().addLayer({
      id: VERTEX_LABEL_LAYER_ID,
      type: "symbol",
      source: VERTEX_LABEL_LAYER_SOURCE,
      layout: {
        "text-field": "{title}",
        "text-offset": [0, 0.6],
        "text-anchor": "top"
      },
      paint: {
        "text-color": "orange"
      }
    })
  }
}

// For all 2-vertex lines on chart, labels start and endpoints as "A" and "B"
export function setEndpointLabelsFromLines(dcChart) {
  const lines = dcChart
    .filters()
    .filter((f) => f.type === "LatLonPolyLine" && f.verts.length === 2)
  setLineLabelData(dcChart, makeLineLabelFeaturesGeoJson(lines))
}

function makeLineLabelFeaturesGeoJson(lines) {
  const features = []

  Object.values(lines).forEach((line) => {
    const [start, end] = convertPolyLineFilterToLatLon(line)
    features.push(makePointGeoJson(start, "A"))
    features.push(makePointGeoJson(end, "B"))
  })

  return features
}

function convertPolyLineFilterToLatLon(filter) {
  const polyLine = new HeavyAIDraw.PolyLine(filter)
  const xform = polyLine.globalXform

  return polyLine.vertsRef.map((v) => {
    const transformed_pos = HeavyAIDraw.Point2d.clone(v)
    HeavyAIDraw.Point2d.transformMat2d(transformed_pos, transformed_pos, xform)
    LatLonUtils.conv900913To4326(transformed_pos, transformed_pos)
    return transformed_pos
  })
}

function makePointGeoJson(coordinates, text) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates
    },
    properties: {
      title: text
    }
  }
}

export function setLineLabelData(dcChart, labelPoints) {
  if (!dcChart.map()?.getSource) {
    return
  }

  const vertexLabelSource = dcChart.map().getSource(VERTEX_LABEL_LAYER_SOURCE)
  if (vertexLabelSource) {
    vertexLabelSource.setData({
      ...INIT_VERTEX_LABEL_GEOJSON,
      features: labelPoints
    })
  }
}
