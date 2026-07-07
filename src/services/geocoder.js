// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import { fetchJsonPromiseCrossOrigin } from "utils/fetch-json-promise"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode"

function createURL(query) {
  return `${GOOGLE_GEOCODE_URL}/json?address=${query}&key=${process.env.GOOGLE_API_KEY}`
}

function parseQuery(query) {
  if (/^\(.*\)$/.test(query)) {
    // strip surrounding parentheses
    query = query.substr(1, query.length - 2)
  }

  const result = { parsedQuery: query }
  const zoomRegex = /,\s*!(\d{1,2})$/
  const queryZoomParam = query.match(zoomRegex)

  if (queryZoomParam) {
    result.parsedQuery = query.substr(0, queryZoomParam.index)
    result.zoomLevel = parseInt(queryZoomParam[1], 10)
  }

  return result
}

function locate(query) {
  const { parsedQuery, zoomLevel } = parseQuery(query)

  if (getFeatureFlag(available_feature_flags.ENABLE_LOCAL_GEOCODER)) {
    return fetchJsonPromiseCrossOrigin(
      `${APP_CONFIG.url}/geocoder?location=${parsedQuery}`
    ).then((data) => {
      if (!data.location) {
        throw new Error("Location data not found")
      }
      if (!data.lat || !data.lng) {
        throw new Error("Location data incomplete")
      }

      const geojson = {
        bounds: {
          sw: [data.lng - 3, data.lat - 3],
          ne: [data.lng + 3, data.lat + 3]
        }
      }

      if (zoomLevel !== undefined) {
        geojson.center = [data.lng, data.lat]
        geojson.zoom = zoomLevel
      }

      return geojson
    })
  } else {
    return fetchJsonPromiseCrossOrigin(createURL(parsedQuery)).then((data) => {
      if (!data.results.length) {
        throw new Error(data.error_message)
      }

      const {
        geometry: {
          location,
          viewport: { northeast, southwest }
        }
      } = data.results[0]

      const geojson = {
        bounds: {
          sw: [southwest.lng, southwest.lat],
          ne: [northeast.lng, northeast.lat]
        }
      }

      if (zoomLevel !== undefined) {
        geojson.center = [location.lng, location.lat]
        geojson.zoom = zoomLevel
      }

      return geojson
    })
  }
}

export default function initGeocoder() {
  return {
    locate
  }
}
