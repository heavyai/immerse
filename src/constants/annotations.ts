// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type ValueType =
  | string
  | number
  | Date
  | boolean
  | null
  | { allOthers: true }

/**
 * Annotations are tied to a data source, a set of data expressions (typically
 * columns from the data source, but could be custom sql), and the values of
 * those expressions. An AnnotatedValue represents the map of data expressions
 * and their values.
 */
export type AnnotatedValue = Record<string, ValueType>

/** Primary values that determine what data an annotation is connected to. */
export type AnnotationKey = {
  /** Data-Source annotation is connected to */
  dataSource: string

  /**
   * A map of dimensions to their values that this annotation is connected to.
   */
  dimensions: AnnotatedValue

  /** The measure that this annotation is connected to. */
  measure?: string
}

/** A serialized version of the annotation key */
export type SerializedAnnotationKey = {
  /** Data-Source */
  annotationDataSource: string

  /** Dimensions */
  annotationDimensions: string

  /** Measure */
  annotationMeasure?: string
}

/** An annotation */
export type Annotation = AnnotationKey & {
  /** Type of the annotation */
  type: "AXIS" | "POINT"

  /**
   * A chart ID if this annotation is only connected to a single chart. Unset
   * otherwise.
   */
  chartId?: string

  /** Shape of the anchor (defaults to circle) */
  shape?:
    | "circle"
    | "square"
    | "cross"
    | "diamond"
    | "triangle-up"
    | "triangle-down"
    | "triangle-right"
    | "triangle-left"

  /** Text of the annotation. */
  text?: string

  /** True if the annotation is hidden */
  hidden?: boolean
}

/** Per-chart annotation settings */
export type ChartAnnotationSettings = {
  /** If manually positioned, this is the x-offset relative to the anchor */
  xOffset?: number

  /** If manually positioned, this is the y-offset relative to the anchor */
  yOffset?: number

  /** If manually resized, this is the width in pixels */
  width?: number

  /** If manually resized, this is the height in pixels */
  height?: number

  /** True if the annotation is hidden on this chart */
  hidden?: boolean
}

/** An annotation merged with chart-specific settings */
export type ChartAnnotation = Annotation &
  ChartAnnotationSettings & {
    /** Annotation id */
    id: string
  }

/** An annotation with chart-specific settings and calculated width/height */
export type SizedChartAnnotation = Omit<
  ChartAnnotation,
  "text" | "width" | "height"
> & {
  /** Text of the annotation. */
  text?: string | string[]

  /** Either the manual width or a calculated width */
  width: number

  /** A calculated height */
  height: number
}

/** Redux state for annotations. Existing dashboards will be undefined */
export type AnnotationState =
  | undefined
  | {
      /** Maps an id to an Annotation */
      annotations: Record<string, Annotation>

      /** Whether or not annotations are globally enabled */
      enabled: boolean

      /** True if in edit mode */
      editMode: boolean
    }

export type ChartDataSelection = {
  /** The source for this selection */
  dataSource: string

  /** Dimensions that make up the chart's main axis. */
  axisDimensions: string[]

  /** Additional dimensions (such as top-n). */
  additionalDimensions: string[]

  /** Measures on the chart. */
  measures: string[]
}

/**
 * This function is used to calculate the default settings for an annotation.
 * @param annotation The annotation
 * @param width The width of the chart
 * @param height The height of the chart
 * @param x The x position of the annotation anchor
 * @param y The y position of the annotation anchor
 * @returns default settings
 */
export type CalcDefaultSettingsFunc = (
  annotation: Readonly<SizedChartAnnotation>,
  width: number,
  height: number,
  x: number,
  y: number
) => ChartAnnotationSettings

/**
 * Allows a chart to do some preprocessing on an Annotation, such as adjusting
 * for binning.
 * @param annotation The annotation to process
 * @returns the adjusted annotation - do not mutate the received annotation!
 * The function may also return null, indicating that the annotation should be
 * discarded.
 */
export type PreprocessAnnotationFunc = (
  annotation: Readonly<ChartAnnotation>
) => ChartAnnotation | null

export const RESET_ANNOTATIONS = "RESET_ANNOTATIONS"
export const TOGGLE_ANNOTATIONS = "TOGGLE_ANNOTATIONS"
export const TOGGLE_ANNOTATIONS_EDIT_MODE = "TOGGLE_ANNOTATIONS_EDIT_MODE"
export const ADD_ANNOTATION = "ADD_ANNOTATION"
export const COPY_CHART_ANNOTATION = "COPY_CHART_ANNOTATION"
export const EDIT_ANNOTATION = "EDIT_ANNOTATION"
export const TOGGLE_ANNOTATION = "TOGGLE_ANNOTATION"
export const TOGGLE_CHART_ANNOTATION = "TOGGLE_CHART_ANNOTATION"
export const POSITION_ANNOTATION = "POSITION_ANNOTATION"
export const RESIZE_ANNOTATION = "RESIZE_ANNOTATION"
export const DELETE_ANNOTATION = "DELETE_ANNOTATION"
export const DELETE_ANNOTATIONS_FOR_CHART = "DELETE_ANNOTATIONS_FOR_CHART"
