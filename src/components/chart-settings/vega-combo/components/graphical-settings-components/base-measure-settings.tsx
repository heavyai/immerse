// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { connect, ConnectedProps, useDispatch, useSelector } from "react-redux"
import { Dispatch } from "redux"
import cx from "classnames"

import BarColumnIcon from "components/svg-icons/icon-bar-column"
import LineAreaIcon from "components/svg-icons/icon-line-area"

import AxisButtons from "components/chart-settings/vega-combo/components/inputs/axis-input"
import MarkTypesInput from "components/chart-settings/vega-combo/components/inputs/mark-types-input"
import LineMeasureSettings from "components/chart-settings/vega-combo/components/graphical-settings-components/line-measure-settings"
import TopNComponent from "vega/components/TopN"

import {
  setMeasureMarkColor,
  setMeasureMarkType
} from "vega/actions/mark-settings-action-creators"
import { AppState } from "vega/charts/types"
import {
  MarkSettings,
  VegaMarkTypes
} from "vega/constants/data-selection-types"
import {
  getLayerById,
  getLayerIndex,
  getMeasureLabel
} from "vega/utils/data-selection"
import SingleColorPicker from "vega/components/SingleColorPicker"
import FoldySection from "../widgets/foldy-section"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"
import { PaletteMappingSelector } from "components/shared-settings/palette-mapping/palette-mapping-selector"
import { useSharedSettingsEnabled } from "hooks/useSharedSettingsEnabled"
import { BaseDimOrMeasureTopN } from "vega/components/TopN/BaseDimOrMeasureTopN"
import { CategoricalColorPicker } from "vega/components/CategoricalColorPicker/CategoricalColorPicker"
import {
  COLOR_PALETTE_TYPES,
  DEFAULT_CATEGORICAL_PALETTE
} from "constants/colors"
import { CHART_TYPES } from "constants/chart-types"
import { noop } from "lodash"
import {
  setColorDimensionCategoricalPalette,
  setColorMeasureCategoricalPalette
} from "vega/actions/scale-settings-action-creators"
import { AdditionalColors } from "components/custom-colors/additional-colors"
import { getColorKey } from "vega/charts/top-n-utils"
import { getOrdinalOrSolidPalette } from "vega/charts/color-utils"
import { isBaseDimCategoricalColoringChart } from "reducers/charts/helpers/color-helpers"
import { BoxPlotIcon } from "components/svg-icons/icon-box-plot"
import { ViolinPlotIcon } from "components/svg-icons/icon-violin-plot"

const CHART_TYPES_ICONS = {
  bar: BarColumnIcon,
  line: LineAreaIcon,
  box: BoxPlotIcon,
  violin: ViolinPlotIcon
}

interface OwnProps {
  chartId: string
  layerId: string
  measureIndex: number
}

const mapStateToProps = (
  { charts }: AppState,
  { chartId, layerId, measureIndex }: OwnProps
) => {
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)

  const tableName = dataSelection?.table?.name
  const measure = dataSelection?.measures.size[measureIndex]
  const colorByBaseDimension =
    isBaseDimCategoricalColoringChart(chart.type) &&
    !dataSelection?.dimensions?.color &&
    !dataSelection?.measures?.color &&
    Boolean(dataSelection?.dimensions?.xAxis?.length > 0)
  const colorDimension = dataSelection?.dimensions.color
  const colorMeasure = dataSelection?.measures.color
  const showTableNameInMeasureHeader = chart.dataSelections.length > 1

  return {
    tableName,
    measure,
    colorDimension,
    colorMeasure,
    colorByBaseDimension,
    showTableNameInMeasureHeader,
    timeLagSettings: chart.timeLagSettings
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch,
  { chartId, layerId, measureIndex }: OwnProps
) => ({
  actions: {
    setMarkType(markType: MarkSettings["markType"]) {
      dispatch(setMeasureMarkType(chartId, layerId, measureIndex, markType))
    },
    setMarkColor(markColor: MarkSettings["markColor"]) {
      dispatch(setMeasureMarkColor(chartId, layerId, measureIndex, markColor))
    }
  }
})

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  OwnProps,
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const BaseMeasureSettings: FC<Props> = ({
  chartId,
  layerId,
  measureIndex,
  measure,
  colorDimension,
  tableName = "",
  colorMeasure,
  actions,
  showTableNameInMeasureHeader,
  timeLagSettings,
  colorByBaseDimension
}) => {
  const dispatch = useDispatch()
  const joinDataSource = useJoinFromParameter(tableName)
  const displayName = joinDataSource?.name ?? tableName
  const chart = useSelector((state: AppState) => state.charts[chartId])
  const allMappings = useSelector(
    (state: AppState) => state.sharedSettings?.mappings
  )
  const sharedColorSettingsEnabled = useSharedSettingsEnabled()

  if (measure) {
    const layerIndex = getLayerIndex(chart.dataSelections, layerId)
    const layer = chart.dataSelections[layerIndex]
    const paletteMappingId =
      (colorDimension
        ? layer.dimensions.color?.paletteMappingId
        : layer.measures.color?.paletteMappingId) ?? layer.paletteMappingId
    const selectedPaletteMapping = allMappings.find(
      (m) => m.id === paletteMappingId
    )
    // Use the palette from the mapping if using a mapping
    // Otherwise get the categorical palette set in top n options
    const topNOptions = colorMeasure
      ? layer?.measureTopNOptions
      : layer?.topNoptions
    const selectedPalette =
      selectedPaletteMapping?.mapping.palette ?? topNOptions?.palette
    const colorKey = getColorKey(topNOptions, selectedPaletteMapping)
    const paletteColors =
      selectedPalette?.val ??
      getOrdinalOrSolidPalette(colorKey, selectedPalette?.type)
    const customRange =
      selectedPaletteMapping?.mapping?.customRange ??
      topNOptions?.dynamicValues?.map((dv) => dv.color)
    const additionalColors = [
      ...new Set(customRange?.filter((r) => r && !paletteColors?.includes(r)))
    ].sort()
    const markType = measure.markSettings.markType
    const Icon = CHART_TYPES_ICONS[markType]
    const iconColor = measure.markSettings.markColor
    const markTypeOptions =
      chart.type === CHART_TYPES.BOX_PLOT
        ? [
            {
              label: "Box Plot",
              value: VegaMarkTypes.BOX,
              icon: CHART_TYPES_ICONS.box
            },
            {
              label: "Violin Plot",
              value: VegaMarkTypes.VIOLIN,
              icon: CHART_TYPES_ICONS.violin
            }
          ]
        : [
            {
              label: "Bar",
              value: VegaMarkTypes.BAR,
              icon: CHART_TYPES_ICONS.bar
            },
            {
              label: "Line/Area",
              value: VegaMarkTypes.LINE,
              icon: CHART_TYPES_ICONS.line
            }
          ]

    const useCategoricalColoring =
      colorMeasure?.column?.value && colorMeasure.aggregate === "Mode"

    // This is the icon that appears in the measure settings header to the left
    // of the column name. Typically, this icon will be whatever color the user
    // has selected for that measure. If there is a color dimension on the
    // chart, then the measure icon's color will be a default color instead
    // (determined by .measure-with-color-dimension class)
    const icon = (
      <Icon
        fillColor={!colorDimension ? iconColor : undefined}
        className={cx(colorDimension && "measure-with-color-dimension")}
      />
    )

    const axis = measure.markSettings.axis
    const columnName = getMeasureLabel(measure, timeLagSettings)
    const showDimensionPaletteMapping =
      sharedColorSettingsEnabled && colorDimension && !colorMeasure

    return (
      <div className="vega-measure-settings">
        <FoldySection
          label={columnName}
          secondaryLabel={
            showTableNameInMeasureHeader ? displayName : undefined
          }
          icon={icon}
        >
          <MarkTypesInput
            setMarkType={actions.setMarkType}
            selected={markType}
            markTypes={markTypeOptions}
          />
          {!colorDimension && !colorMeasure && !colorByBaseDimension && (
            /** Per measure color picker NOT visible: 1. When group by dimension
                 selected for the layer (layer level) OR 2. If any of the layers has
                 color measure (chart level) */
            <SingleColorPicker
              selectedColor={measure.markSettings.markColor}
              onColorChange={actions.setMarkColor}
            />
          )}
          {markType === "line" && (
            <LineMeasureSettings
              chartId={chartId}
              layerId={layerId}
              measureIndex={measureIndex}
              measure={measure}
            />
          )}
          {showDimensionPaletteMapping && (
            <>
              <PaletteMappingSelector
                chartId={chartId}
                chart={chart}
                layerId={layerId}
              />
              <CategoricalColorPicker
                selectedColorScheme={
                  selectedPalette ?? {
                    type: COLOR_PALETTE_TYPES.ORDINAL,
                    name: DEFAULT_CATEGORICAL_PALETTE
                  }
                }
                paletteReversed={false}
                handleToggleColorScheme={noop}
                handleSelectColorScheme={(palette) => {
                  dispatch(
                    setColorDimensionCategoricalPalette(
                      chartId,
                      layerId,
                      palette
                    )
                  )
                }}
              />
              {additionalColors.length > 0 && (
                <AdditionalColors colors={additionalColors} />
              )}
            </>
          )}
          {colorDimension && (
            <TopNComponent
              chartId={chartId}
              layerId={layerId}
              propertyName="topNoptions"
            />
          )}
          {chart.type !== CHART_TYPES.BOX_PLOT && (
            <AxisButtons
              chartId={chartId}
              layerId={layerId}
              measureIndex={measureIndex}
              selected={axis}
            />
          )}
          {(useCategoricalColoring || colorByBaseDimension) &&
            sharedColorSettingsEnabled && (
              <>
                <PaletteMappingSelector
                  chartId={chartId}
                  chart={chart}
                  layerId={layerId}
                  isMeasure={!colorByBaseDimension}
                />
                <CategoricalColorPicker
                  selectedColorScheme={
                    selectedPalette ?? {
                      type: COLOR_PALETTE_TYPES.ORDINAL,
                      name: DEFAULT_CATEGORICAL_PALETTE
                    }
                  }
                  paletteReversed={false}
                  handleToggleColorScheme={noop}
                  handleSelectColorScheme={(palette) => {
                    dispatch(
                      colorByBaseDimension
                        ? setColorDimensionCategoricalPalette(
                            chartId,
                            layerId,
                            palette
                          )
                        : setColorMeasureCategoricalPalette(
                            chartId,
                            layerId,
                            palette
                          )
                    )
                  }}
                />
                {additionalColors.length > 0 && (
                  <AdditionalColors colors={additionalColors} />
                )}
                <BaseDimOrMeasureTopN
                  chartId={chartId}
                  layerId={layerId}
                  propertyName={
                    colorByBaseDimension ? "topNoptions" : "measureTopNOptions"
                  }
                />
              </>
            )}
        </FoldySection>
      </div>
    )
  } else {
    return null
  }
}

export default connector(BaseMeasureSettings)
