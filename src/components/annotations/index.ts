// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import { createSelector } from "reselect"
import {
  Annotation,
  AnnotationState,
  ChartAnnotation,
  ChartDataSelection,
  PreprocessAnnotationFunc,
  SizedChartAnnotation
} from "constants/annotations"
import { getTextWidth, wordWrap } from "utils/word-wrap"

import {
  addAnnotation,
  editAnnotation,
  deleteAnnotation,
  positionAnnotation,
  resizeAnnotation
} from "actions/annotation-action-creators"
import {
  DEFAULT_DATABASE_STYLES,
  UI_CONFIG_ANNOTATION_LABEL,
  STYLE_PROPERTY_FONT_SIZE,
  STYLE_PROPERTY_FONT_WEIGHT
} from "components/ui-config-panel/constants"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"
import { filterAnnotationsForChart } from "utils/annotation-helpers"
import Annotations, { OwnProps as ComponentProps } from "./Annotations"

type StateProps = {
  annotations: AnnotationState
}

export type Props = ComponentProps & {
  /** The chart ID */
  chartId: string

  /**
   * A dictionary mapping the chart's data sources to an object describing the
   * dimensions of the chart. This is used to determine what annotations to
   * display.
   */
  chartDataSelections: ChartDataSelection[]

  /**
   * An optional function to preprocess an annotation to, for example, adjust
   * for binning.
   */
  preprocessAnnotationFunc?: PreprocessAnnotationFunc
}

const settingsSelector = ({ annotations }: StateProps, _) => annotations
const chartsSelector = ({ charts }, _) => charts
const chartIdSelector = (_, { chartId }: Props) => chartId
const uiConfigStylesSelector = (state) => getUserConfigurableUISettings(state)
const chartDataSelectionsSelector = (
  _: StateProps,
  { chartDataSelections }: Props
) => chartDataSelections
const preprocessAnnotationFuncSelector = (
  _: StateProps,
  { preprocessAnnotationFunc }: Props
) => preprocessAnnotationFunc

/** @returns whether or not annotations are globally enabled */
const enabledSelector = createSelector(settingsSelector, (settings) =>
  Boolean(settings?.enabled)
)

/** @returns whether or not we're in edit mode */
const editModeSelector = createSelector(settingsSelector, (settings) =>
  Boolean(settings?.editMode)
)

/** @returns an object mapping ids to annotations */
const annotationsSelector = createSelector(
  settingsSelector,
  (settings) => settings?.annotations || {}
)

/**
 * @returns the annotation font size configured in the config UI panel
 */
const fontSizeSelector = createSelector(
  uiConfigStylesSelector,
  (uiConfigStyles) =>
    uiConfigStyles.text[UI_CONFIG_ANNOTATION_LABEL][STYLE_PROPERTY_FONT_SIZE] ||
    DEFAULT_DATABASE_STYLES.text[UI_CONFIG_ANNOTATION_LABEL][
      STYLE_PROPERTY_FONT_SIZE
    ]
)

/**
 * @returns the annotation font weight configured in the config UI panel
 */
const fontWeightSelector = createSelector(
  uiConfigStylesSelector,
  (uiConfigStyles) =>
    uiConfigStyles.text[UI_CONFIG_ANNOTATION_LABEL][
      STYLE_PROPERTY_FONT_WEIGHT
    ] ||
    DEFAULT_DATABASE_STYLES.text[UI_CONFIG_ANNOTATION_LABEL][
      STYLE_PROPERTY_FONT_WEIGHT
    ]
)

const mapStateToProps = () => {
  /** @returns chart specific annotation settings */
  const chartSettingsSelector = createSelector(
    chartIdSelector,
    chartsSelector,
    (chartId, charts) => charts[chartId].annotations || {}
  )

  /** @returns all annotations that belong on this chart */
  const selectedAnnotationsSelector = createSelector(
    chartIdSelector,
    annotationsSelector,
    chartSettingsSelector,
    chartDataSelectionsSelector,
    preprocessAnnotationFuncSelector,
    filterAnnotationsForChart
  )

  const sizedAnnotationsSelector = createSelector(
    selectedAnnotationsSelector,
    fontSizeSelector,
    fontWeightSelector,
    (annotations, fontSize, fontWeight): SizedChartAnnotation[] =>
      annotations.map((annotation) => {
        if (annotation.text) {
          let text: string | string[] = annotation.text
          let width = annotation.width
          let height = fontSize + 2
          if (width) {
            text = wordWrap(
              text,
              width,
              `${fontWeight} ${fontSize}px Roboto, sans-serif`
            )
            height = height * text.length
          } else {
            width = getTextWidth(
              text,
              `${fontWeight} ${fontSize}px Roboto, sans-serif`
            )
          }
          return { ...annotation, text, width, height }
        }
        return { ...annotation, width: 0, height: 0 }
      })
  )

  return (state: StateProps, props: Props) => {
    const annotationsEnabled = enabledSelector(state, props)
    const editMode = editModeSelector(state, props)
    const annotations = sizedAnnotationsSelector(state, props)
    const fontSize = fontSizeSelector(state, props)
    const fontWeight = fontWeightSelector(state, props)

    return {
      annotationsEnabled,
      editMode,
      annotations,
      fontSize,
      fontWeight
    }
  }
}

const mapDispatchToProps = (dispatch, { chartId }: Props) => ({
  addAnnotation: (
    dataSource: Annotation["dataSource"],
    dimensions: Annotation["dimensions"],
    measure: Annotation["measure"],
    text: Annotation["text"]
  ) =>
    dispatch(
      addAnnotation({
        type: "POINT",
        chartId,
        dataSource,
        dimensions,
        measure,
        text
      })
    ),
  editAnnotationText: (id: ChartAnnotation["id"], text: Annotation["text"]) =>
    dispatch(
      editAnnotation(id, {
        text
      })
    ),
  deleteAnnotation: (id: Annotation["id"]) => dispatch(deleteAnnotation(id)),
  positionAnnotation: (
    id: ChartAnnotation["id"],
    xOffset: NonNullable<ChartAnnotation["xOffset"]>,
    yOffset: NonNullable<ChartAnnotation["yOffset"]>
  ) => dispatch(positionAnnotation(chartId, id, xOffset, yOffset)),
  resizeAnnotation: (
    id: ChartAnnotation["id"],
    width: NonNullable<ChartAnnotation["width"]>,
    height: NonNullable<ChartAnnotation["height"]>
  ) => dispatch(resizeAnnotation(chartId, id, width, height))
})

export default connect(mapStateToProps, mapDispatchToProps)(Annotations)
