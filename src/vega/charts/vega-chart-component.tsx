// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { Config, Spec } from "vega"

import Vega from "vega/components/Vega/Vega"
import VegaChannel from "vega/components/Vega/VegaChannel"
import VegaLink from "vega/components/Vega/VegaLink"
import {
  DataListenersMap,
  SignalListenersMap,
  SignalValuesMap
} from "vega/components/Vega/VegaState"
import BinningHeaderComponent from "vega/components/BinningHeaderComponent/BinningHeaderComponent"
import ChartTooltip from "vega/components/ChartTooltip/ChartTooltip"
import { ComboTooltip } from "vega/components/ChartTooltip/ComboTooltip"
import DimensionDomainOverlay, {
  EditableDomain
} from "vega/components/DimensionDomainOverlay/DimensionDomainOverlay"
import MeasureDomainOverlay, {
  MeasureDomain
} from "vega/components/MeasureDomainOverlay/MeasureDomainOverlay"
import TitleOverlay from "vega/components/TitleOverlay/TitleOverlay"
import LayersLegend from "vega/components/LayersLegend"
import ContinuousLegend from "vega/components/ContinuousLegend/ContinuousLegend"
import { BaselineMenu } from "vega/components/BaselineMenu"
import Annotations from "components/annotations"
import ChartErrors from "components/chart-errors/chart-errors"
import { getPopoverOrientationFromAxis } from "components/parameter-selector-input/utils"

import {
  AxisOrientation,
  ComputedMinMax,
  BaseDimensionScaleSettings,
  GetChartBodySizeAndPosition
} from "./types"
import {
  CalcDefaultSettingsFunc,
  ChartDataSelection,
  PreprocessAnnotationFunc
} from "constants/annotations"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { ENABLE_ANNOTATIONS } = available_feature_flags
const PINNED_LEGEND_WIDTH = 160

import "./styles.scss"

/**
 * Additional vega chart component documentation can be found here:
 * https://heavyai.atlassian.net/wiki/spaces/FE/pages/464584843/New+Charts+With+Vega
 */
interface Props {
  /** Chart id */
  id: string

  /** Vega spec */
  spec: Spec

  /** Vega config */
  vegaConfig?: Config

  /** An object of data names and the associated data */
  data: Record<string, any>

  /** Whether or not data is empty (not loaded yet or length 0) */
  isEmptyData: boolean

  /** Whether or not data is loading */
  isLoadingData: boolean

  /** Error messages received for layer data, if any */
  dataError: string[] | undefined

  /**
   * signalValues can be used to copy "signals" into the vega view. When any of
   * the values change, the view is updated. This may be used to handle chart
   * options, such as row vs column view on the bar chart.
   */
  signalValues?: SignalValuesMap

  /**
   * An object of vega data names and associated listener functions. These
   * functions will be called any time the named vega data store changes.
   */
  dataListeners?: DataListenersMap

  /**
   * An object of vega signal names and associated listener functions. These
   * functions will be called any time the named vega signal changes.
   */
  signalListeners?: SignalListenersMap

  /**
   * A vegaChannel can be used *instead* of passing data, signals, and
   * listeners directly. This allows you to change vega state without causing a
   * react render.
   */
  vegaChannel?: VegaChannel

  /**
   * VegaLinks allow you to connect a handler to a single signal
   */
  vegaLinks?: VegaLink[]

  /** Title of the base dimension axis */
  dimensionTitle?: string

  /** Title of the primary measure axis */
  primaryMeasureTitle?: string

  /** Title of the secondary measure axis */
  secondaryMeasureTitle?: string

  binSettings?: BaseDimensionScaleSettings

  continuousDimensionDomain: ComputedMinMax | null

  /**
   * Measure domain object with min, max, and locked states for primary axis
   */
  primaryMeasureDomain?: MeasureDomain

  /**
   * Measure domain object with min, max, and locked states for secondary axis
   */
  secondaryMeasureDomain?: MeasureDomain

  /** Orientation of various axis-tied overlays */
  primaryMeasureDomainOrientation: AxisOrientation
  secondaryMeasureDomainOrientation: AxisOrientation
  baseDimensionDomainOrientation: AxisOrientation
  dimensionTitleOrientation: AxisOrientation
  primaryMeasureTitleOrientation: AxisOrientation
  secondaryMeasureTitleOrientation: AxisOrientation

  /** Whether or not to show the measure color legend */
  showMeasureColorLegend?: boolean

  /** [Min, Max] for the color measure legend */
  measureColorDomain?: [number, number]

  /** Color range for the color measure legend */
  measureColorRange?: string[]

  /** Flag to check the color measure scheme reverse order */
  isMeasureColorPaletteReversed?: boolean

  /** Whether or not the legend is locked */
  legendLocked: boolean

  /** True if the chart is editing */
  isEditingChart: boolean

  /** True if this is the range chart */
  isRangeChart: boolean

  /** True if the grid whould be enabled */
  gridEnabled: boolean

  /** True if bar values should be enabled */
  barValuesEnabled: boolean

  /** Callback after signalListeners are installed */
  onSignalListenersInstalled?: (
    view: any,
    listeners: Record<string, Function>
  ) => void

  /** Chart width */
  width: number

  /** Chart height */
  height: number

  /** Legend height */
  legendHeight?: number

  /** Wether or not to show the layers legend */
  showLayersLegend?: boolean

  /** Data for the layers legend */
  layersLegendData?: object[]

  /** Whether or not to show the binning header */
  showBinningHeader?: boolean

  /** Whether or not to allow axis title editing */
  enableAxisTitleEditing?: boolean

  /** Whether or not to allow editing of the dimension domain */
  enableDimensionDomainEditing?: boolean

  /** Whether or not to allow axis domain editing */
  enableMeasureDomainEditing?: boolean

  /** legend pinned state in dashboard view */
  pinned?: boolean

  /** Whether or not to reverse TopN legend display order  */
  invertTopnLegend?: boolean

  /**
   * Function for computing the size and position of the chart body for
   * annotations support.
   */
  getChartBodySizeAndPosition: GetChartBodySizeAndPosition

  /** Function which calculates default annotation settings for the chart */
  calcDefaultAnnotationSettings?: CalcDefaultSettingsFunc

  /** Chart data selections, required for annotations. */
  chartDataSelections?: ChartDataSelection[]

  /**
   * Optional function to preprocess an annotation to, for example, adjust for
   * binning
   */
  preprocessAnnotation?: PreprocessAnnotationFunc

  /**
   * Normally, we prevent rendering a chart when all data is filtered out. But,
   * if a user zooms in to a range with no data points, we still need to render
   * it so they can zoom out and bail. The fix is to display the chart only if
   * we have a zoom/range chart filter on it, with the chart extents forced to
   * the range filter min/max (or manual min/max).
   */
  forceDisplayChart?: boolean

  colorDomains: Array<any>

  actions: {
    updateChart: (id: string, update: object) => Promise<void>
    setBaseDimensionTitle: (chartId: string, title: string) => void
    setPrimaryMeasureTitle: (chartId: string, title: string) => void
    setSecondaryMeasureTitle: (chartId: string, title: string) => void
    setManualPrimaryMeasureDomainMin: (chartId: string, min: number) => void
    clearManualPrimaryMeasureDomainMin: (chartId: string) => void
    setManualPrimaryMeasureDomainMax: (chartId: string, max: number) => void
    clearManualPrimaryMeasureDomainMax: (chartId: string) => void
    setManualSecondaryMeasureDomainMin: (chartId: string, min: number) => void
    clearManualSecondaryMeasureDomainMin: (chartId: string) => void
    setManualSecondaryMeasureDomainMax: (chartId: string, max: number) => void
    clearManualSecondaryMeasureDomainMax: (chartId: string) => void
    setColorDomain: (chartId: string, colorDomain: [number, number]) => void
    clearColorDomain: (chartId: string) => object
    topnToggle: (
      chartId: string,
      dataSourceIndex: number,
      propertyName: string,
      key: string
    ) => void
    topnToggleAllOthers: (
      chartId: string,
      dataSelectionIndex: number,
      propertyName: string
    ) => void
    topnSetColor: (
      chartId: string,
      dataSelectionIndex: number,
      propertyName: string,
      key: string,
      color: string,
      isAllOther?: boolean
    ) => void
    setBinningManualMin: (id: string, min: Date | number) => void
    setBinningManualMax: (id: string, max: Date | number) => void
    clearBinningManualMin: (id: string) => void
    clearBinningManualMax: (id: string) => void
    toggleLegendPinning: (chartId: string, pinned: boolean) => void
  }
}

const VegaChartComponent: FC<Props> = ({
  id,
  spec,
  vegaConfig,
  data,
  isEmptyData,
  isLoadingData,
  dataError,
  signalValues,
  dataListeners,
  signalListeners,
  vegaChannel,
  vegaLinks,
  dimensionTitle,
  primaryMeasureTitle,
  secondaryMeasureTitle,
  binSettings,
  continuousDimensionDomain,
  primaryMeasureDomain,
  secondaryMeasureDomain,
  primaryMeasureDomainOrientation,
  secondaryMeasureDomainOrientation,
  baseDimensionDomainOrientation,
  dimensionTitleOrientation,
  primaryMeasureTitleOrientation,
  secondaryMeasureTitleOrientation,
  showMeasureColorLegend,
  measureColorDomain,
  measureColorRange,
  isMeasureColorPaletteReversed,
  legendLocked,
  isEditingChart,
  width,
  height,
  legendHeight,
  actions,
  showLayersLegend,
  layersLegendData,
  showBinningHeader,
  enableAxisTitleEditing,
  enableDimensionDomainEditing,
  enableMeasureDomainEditing,
  isRangeChart,
  pinned,
  invertTopnLegend = false,
  getChartBodySizeAndPosition,
  calcDefaultAnnotationSettings,
  chartDataSelections,
  preprocessAnnotation,
  forceDisplayChart,
  scaleType
  // colorDomains - TODO: Use this to populate color picker + save chart eventually
}) => {
  const [allVegaLinks, setAllVegaLinks] = useState(vegaLinks)
  const vegaContainerRef = useRef<HTMLDivElement>(null)
  const vegaRef = useRef<HTMLDivElement | null>(null)
  const tooltipLink = useRef(new VegaLink("tooltip"))

  useEffect(() => {
    setAllVegaLinks(
      vegaLinks ? [...vegaLinks, tooltipLink.current] : [tooltipLink.current]
    )
  }, [vegaLinks])

  const onBaseDimensionTitleChange = useCallback(
    (title: string) => {
      actions.setBaseDimensionTitle(id, title)
    },
    [actions, id]
  )

  const onPrimaryMeasureTitleChange = useCallback(
    (title: string) => {
      actions.setPrimaryMeasureTitle(id, title)
    },
    [actions, id]
  )

  const onSecondaryMeasureTitleChange = useCallback(
    (title: string) => {
      actions.setSecondaryMeasureTitle(id, title)
    },
    [actions, id]
  )

  const onPrimaryMeasureDomainMinChange = useCallback(
    (min: number) => {
      actions.setManualPrimaryMeasureDomainMin(id, min)
    },
    [actions, id]
  )

  const onPrimaryMeasureDomainMinClear = useCallback(() => {
    actions.clearManualPrimaryMeasureDomainMin(id)
  }, [actions, id])

  const onPrimaryMeasureDomainMaxChange = useCallback(
    (max: number) => {
      actions.setManualPrimaryMeasureDomainMax(id, max)
    },
    [actions, id]
  )

  const onPrimaryMeasureDomainMaxClear = useCallback(() => {
    actions.clearManualPrimaryMeasureDomainMax(id)
  }, [actions, id])

  const onSecondaryMeasureDomainMinChange = useCallback(
    (min: number) => {
      actions.setManualSecondaryMeasureDomainMin(id, min)
    },
    [actions, id]
  )

  const onSecondaryMeasureDomainMinClear = useCallback(() => {
    actions.clearManualSecondaryMeasureDomainMin(id)
  }, [actions, id])

  const onSecondaryMeasureDomainMaxChange = useCallback(
    (max: number) => {
      actions.setManualSecondaryMeasureDomainMax(id, max)
    },
    [actions, id]
  )

  const onSecondaryMeasureDomainMaxClear = useCallback(() => {
    actions.clearManualSecondaryMeasureDomainMax(id)
  }, [actions, id])

  const onBaseDimensionDomainMinChange = useCallback(
    (min: Date | number) => {
      actions.setBinningManualMin(id, min)
    },
    [actions, id]
  )

  const onBaseDimensionDomainMaxChange = useCallback(
    (max: Date | number) => {
      actions.setBinningManualMax(id, max)
    },
    [actions, id]
  )

  const onBaseDimensionDomainMinClear = useCallback(() => {
    actions.clearBinningManualMin(id)
  }, [actions, id])

  const onBaseDimensionDomainMaxClear = useCallback(() => {
    actions.clearBinningManualMax(id)
  }, [actions, id])

  const onToggleLegendPinning = useCallback(
    (val) => {
      actions.toggleLegendPinning(id, val)
    },
    [actions, id]
  )

  let chartHeight = height
  if (showMeasureColorLegend) {
    chartHeight -= 32
  }
  if (showBinningHeader) {
    chartHeight -= 28
  }

  const dimensionDomain =
    (binSettings &&
      (binSettings.dimensionType === "binned_numeric" ||
        binSettings.dimensionType === "binned_time") &&
      continuousDimensionDomain &&
      ({
        min:
          binSettings.manualMin !== null && !isRangeChart
            ? binSettings.manualMin
            : continuousDimensionDomain.min,
        max:
          binSettings.manualMax !== null && !isRangeChart
            ? binSettings.manualMax
            : continuousDimensionDomain.max,
        minLocked: binSettings.manualMin !== null,
        maxLocked: binSettings.manualMax !== null
      } as EditableDomain)) ||
    null

  return (
    <div className="vega-container" ref={vegaContainerRef} id={`chart${id}`}>
      {showBinningHeader && <BinningHeaderComponent chartId={id} />}
      {(!isEmptyData || forceDisplayChart) && (
        <Vega
          ref={vegaRef}
          spec={spec}
          config={vegaConfig}
          data={data}
          dataListeners={dataListeners}
          signalListeners={signalListeners}
          signalValues={signalValues}
          channel={vegaChannel}
          links={allVegaLinks}
          className="vega-wrapper"
          width={
            pinned && !isEditingChart ? width - PINNED_LEGEND_WIDTH : width
          }
          height={chartHeight}
        />
      )}
      {calcDefaultAnnotationSettings &&
        chartDataSelections &&
        !isEmptyData &&
        vegaContainerRef.current &&
        getFeatureFlag(ENABLE_ANNOTATIONS) && (
          <Annotations
            chartId={id}
            chartDataSelections={chartDataSelections}
            chartNode={vegaContainerRef.current}
            chartBodyClassName="chart"
            getChartBodySizeAndPosition={getChartBodySizeAndPosition}
            calcDefaultSettings={calcDefaultAnnotationSettings}
            preprocessAnnotationFunc={preprocessAnnotation}
          />
        )}
      {enableMeasureDomainEditing && (
        <MeasureDomainOverlay
          container={vegaContainerRef.current}
          selector=".primary-measure-axis"
          measureDomain={primaryMeasureDomain}
          orientation={primaryMeasureDomainOrientation}
          onMeasureDomainMinChange={onPrimaryMeasureDomainMinChange}
          onMeasureDomainMinClear={onPrimaryMeasureDomainMinClear}
          onMeasureDomainMaxChange={onPrimaryMeasureDomainMaxChange}
          onMeasureDomainMaxClear={onPrimaryMeasureDomainMaxClear}
        />
      )}
      {enableMeasureDomainEditing && (
        <MeasureDomainOverlay
          container={vegaContainerRef.current}
          selector=".secondary-measure-axis"
          measureDomain={secondaryMeasureDomain}
          orientation={secondaryMeasureDomainOrientation}
          onMeasureDomainMinChange={onSecondaryMeasureDomainMinChange}
          onMeasureDomainMinClear={onSecondaryMeasureDomainMinClear}
          onMeasureDomainMaxChange={onSecondaryMeasureDomainMaxChange}
          onMeasureDomainMaxClear={onSecondaryMeasureDomainMaxClear}
        />
      )}
      {enableDimensionDomainEditing && (
        <DimensionDomainOverlay
          container={vegaContainerRef.current}
          selector=".base-dimension-axis"
          domain={dimensionDomain}
          isDateDomain={Boolean(binSettings?.dimensionType === "binned_time")}
          orientation={baseDimensionDomainOrientation}
          onDomainMinChange={onBaseDimensionDomainMinChange}
          onDomainMinClear={onBaseDimensionDomainMinClear}
          onDomainMaxChange={onBaseDimensionDomainMaxChange}
          onDomainMaxClear={onBaseDimensionDomainMaxClear}
        />
      )}
      {enableAxisTitleEditing && dimensionTitle && (
        <TitleOverlay
          container={vegaContainerRef.current}
          selector=".base-dimension-axis .mark-text.role-axis-title"
          title={dimensionTitle}
          orientation={dimensionTitleOrientation}
          parameterSelectorOrientation={getPopoverOrientationFromAxis(
            dimensionTitleOrientation
          )}
          onChange={onBaseDimensionTitleChange}
        />
      )}
      {enableAxisTitleEditing && primaryMeasureTitle && (
        <TitleOverlay
          container={vegaContainerRef.current}
          selector=".primary-measure-axis .mark-text.role-axis-title"
          title={primaryMeasureTitle}
          orientation={primaryMeasureTitleOrientation}
          parameterSelectorOrientation={getPopoverOrientationFromAxis(
            primaryMeasureTitleOrientation
          )}
          onChange={onPrimaryMeasureTitleChange}
        />
      )}
      {enableAxisTitleEditing && secondaryMeasureTitle && (
        <TitleOverlay
          container={vegaContainerRef.current}
          selector=".secondary-measure-axis .mark-text.role-axis-title"
          title={secondaryMeasureTitle}
          orientation={secondaryMeasureTitleOrientation}
          parameterSelectorOrientation={getPopoverOrientationFromAxis(
            secondaryMeasureTitleOrientation
          )}
          onChange={onSecondaryMeasureTitleChange}
        />
      )}
      {measureColorDomain && measureColorRange && showMeasureColorLegend && (
        <ContinuousLegend
          chartId={id}
          selectedColorRange={measureColorRange}
          isMeasureColorPaletteReversed={isMeasureColorPaletteReversed}
          colorDomain={measureColorDomain}
          legendLocked={legendLocked}
          setColorDomain={actions.setColorDomain}
          clearColorDomain={actions.clearColorDomain}
        />
      )}
      {showLayersLegend &&
      !isEditingChart &&
      !isRangeChart &&
      layersLegendData?.length ? (
        <LayersLegend
          chartId={id}
          pinned={pinned}
          onPin={() => onToggleLegendPinning(!pinned)}
          invertTopnLegend={invertTopnLegend}
          layersLegendData={layersLegendData}
          style={{ height: pinned ? `${legendHeight || height}px` : "initial" }}
        />
      ) : null}
      <BaselineMenu
        primaryMeasureDomain={primaryMeasureDomain}
        setManualPrimaryMeasureDomainMin={onPrimaryMeasureDomainMinChange}
        clearManualPrimaryMeasureDomainMin={onPrimaryMeasureDomainMinClear}
        primaryMeasureTitle={primaryMeasureTitle}
        secondaryMeasureDomain={secondaryMeasureDomain}
        setManualSecondaryMeasureDomainMin={onSecondaryMeasureDomainMinChange}
        clearManualSecondaryMeasureDomainMin={onSecondaryMeasureDomainMinClear}
        secondaryMeasureTitle={secondaryMeasureTitle}
        scaleType={scaleType}
      />
      <ChartTooltip
        vegaContainerRef={vegaRef}
        getChartBodySizeAndPosition={getChartBodySizeAndPosition}
        notifier={tooltipLink.current}
        invertOrder={invertTopnLegend}
        TooltipComponent={ComboTooltip}
      />
      {isLoadingData && (
        <div className="loading-spinner">
          <div className="loading-spinner-icon" />
        </div>
      )}
      {dataError &&
        !isLoadingData &&
        dataError.map((error, index) => (
          <div key={index} className="error-message-container">
            <ChartErrors errorMessage={error} />
          </div>
        ))}
    </div>
  )
}

export default React.memo(VegaChartComponent)
