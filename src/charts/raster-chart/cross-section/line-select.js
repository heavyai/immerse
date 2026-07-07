// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import MultiSelect from "widgets/multi-select/Multi-select"
import { components as ReactSelectComponents } from "react-select"
import { useChart, useChartTitles } from "charts/utils/hooks"
import { getParameterDefinitions } from "components/parameters/selectors"
import {
  CoordinateIndex,
  ParameterTypes
} from "components/parameters/parameters-types"
import { varExtractRegex } from "components/parameters/validation"
import { addSelector } from "actions/charts-action-creators"
import {
  makeLineVertexParamName,
  addCrossSectionLineSelection
} from "charts/raster-chart/raster-chart-parameter-actions"
import { SINGLE_VALUE_STR_TYPE } from "constants/data-types"
import {
  needsLineSpecUpdate,
  addSelectorsFromLineSpec,
  getCrossSectionLonLatMinMax
} from "actions/selector-default-thunks"

import { EndpointDefaultOptions, EndpointSelectorNames } from "./constants"
import { CHART_TYPES } from "constants/chart-types"
import { makeDefaultEndpoints } from "./utils/make-default-endpoints"
import { hasMeasuresSet } from "charts/utils/has-measures-set"
import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"

const DISABLED_MESSAGE_LAT_LNG_REQUIRED =
  "Latitude and Longitude must be set before selecting a boundary section"
const MEASURE = "measures"
const TERRAIN_MEASURE = "terrainMeasure"
const findMeasureIndexByName = (selectorName, chart) =>
  chart.measures.findIndex((d) => d.name === selectorName)
const findLayerMeasureIndexByName = (selectorName, chart, layerIndex) =>
  chart?.layers[layerIndex]?.measures?.findIndex((d) => d.name === selectorName)

const defaultOptionsList = [
  {
    label: "Northern Boundary",
    defaultKey: EndpointDefaultOptions.NORTH,
    value: EndpointDefaultOptions.NORTH
  },
  {
    label: "Southern Boundary",
    defaultKey: EndpointDefaultOptions.SOUTH,
    value: EndpointDefaultOptions.SOUTH
  },
  {
    label: "Eastern Boundary",
    defaultKey: EndpointDefaultOptions.EAST,
    value: EndpointDefaultOptions.EAST
  },
  {
    label: "Western Boundary",
    defaultKey: EndpointDefaultOptions.WEST,
    value: EndpointDefaultOptions.WEST
  }
]

function getSelectedOption(options, parameterDefinitions, chart) {
  if (chart?.crossSectionLineSelection) {
    return chart.crossSectionLineSelection
  }

  const startLatIndex = findMeasureIndexByName(
    EndpointSelectorNames.START_LAT,
    chart
  )
  const startLatSelector = chart?.measures?.[startLatIndex] ?? {}

  if (startLatSelector.defaultKey || !startLatSelector.value) {
    return (
      options.find(
        (option) => option.defaultKey === startLatSelector?.defaultKey
      ) ?? options[0]
    )
  }

  const selectedChartId = getParentChartIdForSelectedLine(
    parameterDefinitions,
    startLatSelector
  )
  return (
    (selectedChartId &&
      options.find((option) => option.value === selectedChartId)) ||
    null
  )
}

function getParentChartIdForSelectedLine(
  parameterDefinitions,
  startLatSelector
) {
  const selectedOptionValue =
    startLatSelector.value === undefined
      ? undefined
      : startLatSelector.value.match(varExtractRegex)[1]

  return parameterDefinitions[selectedOptionValue]?.parentChartId
}

function makeDropdownOptionsList(
  chart,
  coordinateParametersForTab,
  chartTitles
) {
  const chartIdsWithPointParams = coordinateParametersForTab.reduce(
    (acc, param) => acc.add(param.parentChartId),
    new Set()
  )

  const titleCopies = {}

  const makeDedupedChartLabel = (chartId) => {
    const chartTitle = chartTitles[chartId]

    const label = titleCopies[chartTitle]
      ? `${chartTitle} (${titleCopies[chartTitle] + 1})`
      : chartTitle

    titleCopies[chartTitle] = titleCopies[chartTitle]
      ? titleCopies[chartTitle] + 1
      : 1

    return label
  }

  const disabled = !hasMeasuresSet(chart, ["lat", "lon"])
  const externalChartLines = Array.from(chartIdsWithPointParams).map((id) => ({
    label: makeDedupedChartLabel(id),
    value: id
  }))
  const defaultLines = disabled
    ? defaultOptionsList.map((option) => ({
        ...option,
        isDisabled: true,
        tooltip: DISABLED_MESSAGE_LAT_LNG_REQUIRED
      }))
    : defaultOptionsList
  return externalChartLines.concat(defaultLines)
}

const TooltipOption = (props) => {
  const { isDisabled, data, children } = props
  return (
    <TooltipIfContent align="right" content={isDisabled ? data.tooltip : null}>
      <div>
        <ReactSelectComponents.Option {...props}>
          {children}
        </ReactSelectComponents.Option>
      </div>
    </TooltipIfContent>
  )
}

const LineSelect = ({ chartId, multiSourceIndex }) => {
  const dispatch = useDispatch()
  const chart = useChart(chartId)
  const currentLayer = chart.currentLayer
  const isSubType =
    chart?.layers?.length > 1 &&
    chart?.layers[currentLayer]?.type === CHART_TYPES.CROSS_SECTION_TERRAIN
  // with multi-layered CS/terrain, currently terrain must be second layer
  const hasTerrainSubType =
    chart?.layers?.length > 1 &&
    chart?.layers[1]?.type === CHART_TYPES.CROSS_SECTION_TERRAIN

  const currentTab = useSelector((state) => state.dashboard.selectedTabId)
  const coordinateParametersForTab = useSelector((state) =>
    Object.values(getParameterDefinitions(state)).filter(
      (param) =>
        param.parentChartTabId === currentTab &&
        param.type === ParameterTypes.COORDINATE
    )
  )
  const parameterDefinitions = useSelector((state) =>
    getParameterDefinitions(state)
  )
  const dataSource = useSelector((state) => state.charts[chartId].dataSource)

  const addEndpointSelector = (
    selectorName,
    option,
    vertexIndex,
    coordIndex,
    selectorType,
    layerId = null
  ) => {
    const isTerrainMeasure = selectorType === TERRAIN_MEASURE
    const layerIndex = isTerrainMeasure ? layerId : multiSourceIndex
    const selectorIndex =
      selectorType === TERRAIN_MEASURE
        ? findLayerMeasureIndexByName(selectorName, chart, layerId)
        : findMeasureIndexByName(selectorName, chart)

    if (selectorIndex === -1) {
      throw new Error(`Measure ${selectorName} not found`)
    }

    // need to update the measure in layers[terrainLayer].measure so that when we switch
    // to terrain layer, it renders with the updated line data
    dispatch(
      addSelector(selectorType)(
        chartId,
        chart.type,
        selectorIndex,
        {
          value: `\${${makeLineVertexParamName(
            option.value,
            currentTab,
            vertexIndex,
            coordIndex
          )}}`,
          type: SINGLE_VALUE_STR_TYPE,
          defaultKey: undefined
        },
        layerIndex
      )
    )
  }
  async function addDefaultSelectors(option) {
    try {
      // This bombs if we don't have lat/lng yet and an option is selected
      const [lonMinMax, latMinMax] = await dispatch(
        getCrossSectionLonLatMinMax(chartId)
      )

      const lineSpec = makeDefaultEndpoints(
        lonMinMax,
        latMinMax,
        option.defaultKey
      )

      if (
        needsLineSpecUpdate(
          chartId,
          chart?.measures,
          lineSpec,
          option.defaultKey
        )
      ) {
        dispatch(
          addSelectorsFromLineSpec(
            chartId,
            lineSpec,
            option.defaultKey,
            chart.type
          )
        )
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e)
    }
  }

  function handleSelectOption(option) {
    dispatch(addCrossSectionLineSelection(chartId, option))
    if (option.defaultKey) {
      addDefaultSelectors(option)
      return
    }

    const selectorTypes = hasTerrainSubType
      ? [MEASURE, TERRAIN_MEASURE]
      : [MEASURE]

    // if we have a multi-layered CS/terrain, we need to simultaneously update
    // the terrain chart's `layers[terrain].measures` in redux with the cross section.
    // This is because when we switch layers, the CREATE_GEOHEAT_CHART action is firing
    // off prior to the call to this function, which causes it to render with stale data
    for (const selectorType of selectorTypes) {
      const layerId = selectorType === TERRAIN_MEASURE ? 1 : undefined
      addEndpointSelector(
        EndpointSelectorNames.START_LAT,
        option,
        0,
        CoordinateIndex.LAT,
        selectorType,
        layerId
      )

      addEndpointSelector(
        EndpointSelectorNames.START_LON,
        option,
        0,
        CoordinateIndex.LON,
        selectorType,
        layerId
      )

      addEndpointSelector(
        EndpointSelectorNames.END_LAT,
        option,
        1,
        CoordinateIndex.LAT,
        selectorType,
        layerId
      )

      addEndpointSelector(
        EndpointSelectorNames.END_LON,
        option,
        1,
        CoordinateIndex.LON,
        selectorType,
        layerId
      )
    }
  }

  const chartTitles = useChartTitles()
  const options = makeDropdownOptionsList(
    chart,
    coordinateParametersForTab,
    chartTitles
  )

  const selectedOption = getSelectedOption(options, parameterDefinitions, chart)
  const isDisabled = options.every((option) => option.isDisabled) || isSubType

  // if lineSpec from another chart exists on first render, select it
  // disable eslint warning because no need to trigger useEffect on changes to
  // selectedOption (since MultiSelect callback handles that)
  useEffect(() => {
    handleSelectOption(selectedOption)
  }, [dataSource]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TooltipIfContent
      content={isDisabled ? DISABLED_MESSAGE_LAT_LNG_REQUIRED : null}
      align="right"
    >
      <div>
        <MultiSelect
          options={options}
          value={selectedOption}
          onChange={handleSelectOption}
          isDisabled={isDisabled}
          components={{
            Option: TooltipOption
          }}
          noLabel
        />
      </div>
    </TooltipIfContent>
  )
}

export default LineSelect
