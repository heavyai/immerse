// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Annotation,
  AnnotationKey,
  ChartAnnotation,
  ChartAnnotationSettings,
  ChartDataSelection,
  PreprocessAnnotationFunc,
  SerializedAnnotationKey
} from "constants/annotations"

/**
 * @param annotation The annotation to test
 * @param dimensions The dimensions to test
 * @returns true if the annotation is attached to the given dimensions.
 */
export function annotationHasDimensions(
  annotation: Annotation,
  dimensions: string[][]
): boolean {
  return dimensions.some(
    (dims) =>
      Object.keys(annotation.dimensions).length === dims.length &&
      dims.every(
        (d) => sanitizeDataSelectionForSelector(d) in annotation.dimensions
      )
  )
}

/**
 * @param dataSelection
 * @returns Data selection usable as a selector (replaces line breaks with spaces)
 */
export function sanitizeDataSelectionForSelector(
  dataSelection: string
): string {
  return dataSelection.replace(/(\r\n|\r|\n)/g, " ")
}

/**
 * @param chartId The id of the chart.
 * @param annotations A list of annotations.
 * @param chartSettings Chart-specific annotation settings.
 * @param chartDataSelections Information about the chart's datasource and
 *   dimensions.
 * @param preprocessFunc An optional function to preprocess annotations to, for
 *   example, adjust for binning.
 * @returns a filtered list of annotations for the chart.
 */
export function filterAnnotationsForChart(
  chartId: string,
  annotations: Record<string, Annotation>,
  chartSettings: Record<string, ChartAnnotationSettings>,
  chartDataSelections: ChartDataSelection[],
  preprocessFunc?: PreprocessAnnotationFunc
): ChartAnnotation[] {
  // a map of datasource to an array of matching ChartDataSelections
  const dsMap = chartDataSelections.reduce((m, ds) => {
    if (!(ds.dataSource in m)) {
      m[ds.dataSource] = []
    }
    m[ds.dataSource].push({
      ...ds,
      allDimensions: [...ds.axisDimensions, ...ds.additionalDimensions]
    })
    return m
  }, {} as Record<string, Array<ChartDataSelection & { allDimensions: string[] }>>)

  return Object.entries(annotations).flatMap(([id, annotation]) => {
    if (
      !annotation.hidden &&
      (annotation.chartId === undefined || annotation.chartId === chartId) &&
      annotation.dataSource in dsMap
    ) {
      let include = false
      if (annotation.type === "AXIS") {
        include = annotationHasDimensions(
          annotation,
          dsMap[annotation.dataSource].map((ds) => ds.axisDimensions)
        )
      } else {
        include =
          annotationHasDimensions(
            annotation,
            dsMap[annotation.dataSource].map((ds) => ds.allDimensions)
          ) &&
          (annotation.measure === undefined ||
            dsMap[annotation.dataSource].some((ds) =>
              ds.measures
                .map((m) => sanitizeDataSelectionForSelector(m))
                .includes(annotation.measure)
            ))
      }

      if (include) {
        const cs = chartSettings[id] || {}
        const ret = { id, ...annotation, ...cs }
        if (preprocessFunc) {
          const processed = preprocessFunc(ret)
          return processed ? [processed] : []
        }
        return [ret]
      }
    }
    return []
  })
}

/**
 * @param dataSource The datasource of the annotation.
 * @param values An object mapping dimensions to their values.
 * @returns a "key" for the annotation. This key is a string that can be used
 * to identify the datasource, dimensions, and values that correspond to the
 * annotation.
 *
 * Note that this function can accept an Annotation object, or any object
 * consisting of the dataSource and values properties.
 */
export function buildAnnotationKey({
  dataSource,
  dimensions,
  measure
}: AnnotationKey): SerializedAnnotationKey {
  const sanitizedDimensions = Object.keys(dimensions).reduce((dims, d) => {
    const key = sanitizeDataSelectionForSelector(d)
    return { ...dims, [key]: dimensions[d] }
  }, {})
  const key: SerializedAnnotationKey = {
    annotationDataSource: sanitizeDataSelectionForSelector(dataSource),
    annotationDimensions: JSON.stringify(sanitizedDimensions)
  }
  if (measure) {
    key.annotationMeasure = sanitizeDataSelectionForSelector(measure)
  }
  return key
}
