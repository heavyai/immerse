// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import moment from "moment"
import { DATETIME_FORMAT } from "constants/magic-variables"

import { buildFilterLabel } from "vega/constants/filter-types"
import { hasBoundingBoxFilter, formatCoordinate } from "vega/utils/filter"
import * as LatLonUtils from "vega/charts/raster/utils-latlon"
import * as HeavyAIDraw from "import-shims/heavyai-draw"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

import "../filter-component.scss"

const PrettyPrintFilter = ({ filter }) => {
  if (filter === null) {
    return <li>null</li>
  } else if (filter.type === "LatLonCircle") {
    return (
      <li>
        LatLon Circle centered at (
        {[
          LatLonUtils.conv900913To4326X(filter.position[0]),
          LatLonUtils.conv900913To4326Y(filter.position[1])
        ]
          .map((c) => formatCoordinate(c))
          .join(",")}
        ) with radius {filter.radius}
      </li>
    )
  } else if (filter.type === "Circle") {
    return (
      <li>
        Circle centered at (
        {filter.position.map((c) => formatCoordinate(c)).join(",")}) with radius{" "}
        {filter.radius}
      </li>
    )
  } else if (filter.type === "LatLonPoly") {
    const poly = new HeavyAIDraw.Poly(filter)
    const xform = poly.globalXform
    return (
      <li>
        LatLon Polygon with vertices at
        <ul>
          {poly.vertsRef
            .map((pos) => {
              const transformed_pos = HeavyAIDraw.Point2d.clone(pos)
              HeavyAIDraw.Point2d.transformMat2d(
                transformed_pos,
                transformed_pos,
                xform
              )
              LatLonUtils.conv900913To4326(transformed_pos, transformed_pos)
              return transformed_pos
            })
            .map((v, i) => (
              <li key={i}>({v.map((c) => formatCoordinate(c)).join(", ")})</li>
            ))}
        </ul>
      </li>
    )
  } else if (filter.type === "Poly") {
    const poly = new HeavyAIDraw.Poly(filter)
    const xform = poly.globalXform
    return (
      <li>
        Polygon with vertices at
        <ul>
          {poly.vertsRef
            .map((pos) => {
              const transformed_pos = HeavyAIDraw.Point2d.clone(pos)
              HeavyAIDraw.Point2d.transformMat2d(
                transformed_pos,
                transformed_pos,
                xform
              )
              return transformed_pos
            })
            .map((v, i) => (
              <li key={i}>({v.map((c) => formatCoordinate(c)).join(", ")})</li>
            ))}
        </ul>
      </li>
    )
  } else if (Array.isArray(filter)) {
    return <li>{filter.join(" ; ")}</li>
  } else if (
    typeof filter === "object" &&
    Object.prototype.toString.call(filter) === "[object Date]"
  ) {
    return <li>{moment.utc(filter).format(DATETIME_FORMAT)}</li>
  } else if (typeof filter === "object") {
    return <li>[Object]</li>
  } else {
    return <li>{filter}</li>
  }
}

PrettyPrintFilter.displayName = "PrettyPrintFilter"
PrettyPrintFilter.propTypes = {
  filter: PropTypes.object.isRequired,
  filterMetaData: PropTypes.object.isRequired
}

const BoundingBoxFilter = ({ mapZoomCenter }) => {
  return (
    <div>
      <div>
        Bounding box centered at ({formatCoordinate(mapZoomCenter.center.lat)},{" "}
        {formatCoordinate(mapZoomCenter.center.lng)})
      </div>
      <ul>
        <li>
          Between latitudes : ({formatCoordinate(mapZoomCenter.bounds.latMin)}{" "}
          to {formatCoordinate(mapZoomCenter.bounds.latMax)})
        </li>
        <li>
          Between longitudes : ({formatCoordinate(mapZoomCenter.bounds.lonMin)}{" "}
          to {formatCoordinate(mapZoomCenter.bounds.lonMax)})
        </li>
      </ul>
    </div>
  )
}

BoundingBoxFilter.displayName = "BoundingBoxFilter"
BoundingBoxFilter.propTypes = {
  mapZoomCenter: PropTypes.object.isRequired
}

const FilterLabel = ({ filterMetaData }) => {
  const hasBoundingBox = hasBoundingBoxFilter(filterMetaData)

  if (
    filterMetaData.chartFilters &&
    (hasBoundingBox ||
      (filterMetaData.chartFilters.length > 0 &&
        filterMetaData.chartFilters.some(
          (f) => typeof f === "object" && !Array.isArray(f) && f !== null
        )))
  ) {
    return (
      <div className="filter-component-label">
        <div>Any of:</div>
        <ul>
          {hasBoundingBox && (
            <li>
              <BoundingBoxFilter mapZoomCenter={filterMetaData.mapZoomCenter} />
            </li>
          )}
          {filterMetaData.chartFilters.map((filter, i) => (
            <PrettyPrintFilter
              key={i}
              filter={filter}
              filterMetaData={filterMetaData}
            />
          ))}
        </ul>
      </div>
    )
  }

  return process(buildFilterLabel(filterMetaData), { trackUsage: false })
}

FilterLabel.displayName = "FilterLabel"
FilterLabel.propTypes = {
  filterMetaData: PropTypes.object.isRequired
}

export default FilterLabel
