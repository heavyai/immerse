// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  CSSProperties,
  FC,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { debounce, kebabCase } from "lodash"
import cx from "classnames"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"

import Vega from "vega/components/Vega/Vega"
import { KEYCODE } from "constants/keycode"
import { GetChartBodySizeAndPosition } from "vega/charts/types"
import {
  Annotation,
  AnnotationKey,
  CalcDefaultSettingsFunc,
  SizedChartAnnotation
} from "constants/annotations"
import {
  buildAnnotationKey,
  sanitizeDataSelectionForSelector
} from "utils/annotation-helpers"

import SPEC from "./spec"

import "./style.scss"

const DEBOUNCE_TIMEOUT = 250

const POSITION_ATTRIBUTES = [
  "transform",
  "x",
  "x1",
  "x2",
  "y",
  "y1",
  "y2",
  "cx",
  "cy",
  "dx",
  "dy",
  "r",
  "rx",
  "ry",
  "width",
  "height",
  "style"
]

const DEFAULT_LABEL_TEXT = "Click to edit or drag to move"

export type StateProps = {
  /** Whether or not annotations are enabled. */
  annotationsEnabled: boolean

  /** Whether or not we're in edit mode. */
  editMode: boolean

  /** List of annotations for this chart */
  annotations: SizedChartAnnotation[]

  /** Size of the font to use for annotations */
  fontSize: number

  /** Weight of the font to use for annotations */
  fontWeight: number

  /**
   * Add a new annotation.
   * @param dataSource The dataSource associated with the annotation.
   * @param dimensions The dimensions+values to be annotated.
   * @param measure The measure to be annotated.
   * @param text The text of the new annotation.
   */
  addAnnotation(
    dataSource: Annotation["dataSource"],
    dimensions: Annotation["dimensions"],
    measure: Annotation["measure"],
    text: Annotation["text"]
  ): void

  /**
   * Edit an existing annotation.
   * @param id The id associated with the annotation.
   * @param text The new text for the annotation.
   */
  editAnnotationText(
    id: SizedChartAnnotation["id"],
    text: Annotation["text"]
  ): void

  /**
   * Delete an annotation.
   * @param id The id associated with the annotation.
   */
  deleteAnnotation(id: Annotation["id"]): void

  /**
   * Reposition an annotation's label, relative to the anchor.
   * @param id The annotation id.
   * @param xOffset The label's horizontal offset from the anchor.
   * @param yOffset The label's vertical offset from the anchor.
   */
  positionAnnotation(
    id: SizedChartAnnotation["id"],
    xOffset: NonNullable<SizedChartAnnotation["xOffset"]>,
    yOffset: NonNullable<SizedChartAnnotation["yOffset"]>
  ): void

  /**
   * Resize an annotation.
   * @param id The annotation id.
   * @param width New width of the annotation.
   * @param height New height of the annotation.
   */
  resizeAnnotation(
    id: SizedChartAnnotation["id"],
    width: SizedChartAnnotation["width"],
    height: SizedChartAnnotation["height"]
  ): void
}

export type OwnProps = {
  /** Reference to the top-most chart DOM node */
  chartNode: HTMLElement | null

  /**
   * The classname of the chart body inside chartNode. This is passed to
   * getElementsByClassName to detect when the chart body is added or removed
   * from the DOM. This classname should be used on exactly one element in the
   * chart's DOM and that element should be the container of all of the chart's
   * content _excluding_ axes.
   */
  chartBodyClassName: string

  /**
   * Optional function to compute size and position of the chart body. If
   * unspecified, getBoundingClientRect is used on the chart body node.
   */
  getChartBodySizeAndPosition?: GetChartBodySizeAndPosition

  /**
   * This function is used to calculate the default settings for an annotation.
   */
  calcDefaultSettings: CalcDefaultSettingsFunc
}

type Props = StateProps & OwnProps

type PositionedAnnotation = {
  annotation: SizedChartAnnotation
  x: number
  y: number
}

const getCenterRelativeTo = (
  node: Element,
  rect: DOMRect,
  adjTop = 0,
  adjLeft = 0
): { x: number; y: number; width: number; height: number } => {
  const nodeRect = node.getBoundingClientRect()
  const width = nodeRect.right - nodeRect.left
  const height = nodeRect.bottom - nodeRect.top
  return {
    x: nodeRect.left + width / 2.0 - rect.left - adjLeft,
    y: nodeRect.top + height / 2.0 - rect.top - adjTop,
    width,
    height
  }
}

/**
 * @param dict Key/value mapping of data attributes
 * @returns a CSS selector to find an annotation anchor with the given data
 *   attributes
 */
const buildSelector = (dict: Record<string, string | undefined>): string => {
  let selector = ".annotation-anchor"
  Object.entries(dict).forEach(([k, v]) => {
    if (v) {
      selector += `[data-${kebabCase(k)}='${sanitizeDataSelectionForSelector(
        v
      ).replace(/'/g, "\\'")}']`
    }
  })
  return selector
}

/**
 * @param annotation The annotation
 * @returns a CSS selector to find an anchor for the annotation
 */
const annotationToSelector = (annotation: AnnotationKey): string => {
  const key = buildAnnotationKey(annotation)
  return buildSelector(key)
}

/**
 * Given a point in client coordinates, find the DOM elements under it.
 * @param x
 * @param y
 * @returns all DOM elements under the point
 */
const getElementsFromPoint = (
  x: number,
  y: number
): Array<HTMLElement | SVGElement> | NodeListOf<HTMLElement | SVGElement> => {
  let elements = []
  if (document.elementsFromPoint) {
    elements = document.elementsFromPoint(x, y)
  } else if (document.msElementsFromPoint) {
    elements = document.msElementsFromPoint(x, y)
  }
  return elements
}

const Annotations: FC<Props> = ({
  annotationsEnabled,
  annotations,
  fontSize,
  fontWeight,
  chartNode,
  chartBodyClassName,
  getChartBodySizeAndPosition,
  calcDefaultSettings,
  editMode,
  addAnnotation,
  editAnnotationText,
  deleteAnnotation,
  positionAnnotation,
  resizeAnnotation
}) => {
  const [chartBodyNode, setChartBodyNode] = useState<SVGElement | null>(null)
  const [top, setTop] = useState<number | undefined>()
  const [left, setLeft] = useState<number | undefined>()
  const [width, setWidth] = useState<number | undefined>()
  const [height, setHeight] = useState<number | undefined>()
  const [vegaData, setVegaData] = useState<Record<string, any[]> | undefined>()
  const [editAnnotationId, setEditAnnotationId] = useState<string | null>(null)
  const [editLabelStyle, setEditLabelStyle] = useState<CSSProperties>({})
  const [editLabelValue, setEditLabelValue] = useState<string>("")
  const [editLabelInitialWidth, setEditLabelInitialWidth] = useState<number>(0)
  const [editLabelInitialHeight, setEditLabelInitialHeight] = useState<number>(
    0
  )
  const [deleteAnnotationId, setDeleteAnnotationId] = useState<string | null>(
    null
  )
  const [deleteIconPosition, setDeleteIconPosition] = useState<CSSProperties>(
    {}
  )
  const [dragging, setDragging] = useState<boolean>(false)
  const editLabelRef = useRef<HTMLInputElement | null>(null)
  const annotationOverlayRef = useRef<HTMLDivElement | null>(null)

  // This effect is watching for the chart to get added or removed from the dom
  useEffect(() => {
    if (
      chartNode &&
      annotationsEnabled &&
      (annotations.length > 0 || editMode)
    ) {
      // chartBodies is a "live" collection of nodes matching the
      // chartBodyClassName
      const chartBodies = chartNode.getElementsByClassName(chartBodyClassName)
      const update = () => {
        setChartBodyNode(chartBodies.item(0) as SVGElement | null)
      }

      const debouncedUpdate = debounce(update, DEBOUNCE_TIMEOUT)
      const mutationObserver = new MutationObserver(debouncedUpdate)
      mutationObserver.observe(chartNode, {
        childList: true,
        subtree: true
      })
      update()

      return () => {
        debouncedUpdate.cancel()
        mutationObserver.disconnect()
      }
    }

    setChartBodyNode(null)
    setVegaData(undefined)
    return undefined
  }, [annotationsEnabled, editMode, annotations, chartNode, chartBodyClassName])

  // This effect watches if the chart gets resized
  useEffect(() => {
    if (chartNode && chartBodyNode) {
      const resize = () => {
        const offsetRect = chartNode.getBoundingClientRect()
        const rect = getChartBodySizeAndPosition
          ? getChartBodySizeAndPosition(chartBodyNode)
          : chartBodyNode.getBoundingClientRect()
        setTop(rect.top - offsetRect.top)
        setLeft(rect.left - offsetRect.left)
        setWidth(rect.right - rect.left)
        setHeight(rect.bottom - rect.top)
      }

      const debouncedResize = debounce(resize, DEBOUNCE_TIMEOUT)

      // watch for size changes
      let resizeObserver = null
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(debouncedResize)
        resizeObserver.observe(chartBodyNode)
      }

      // watch for changes that would cause the position to change
      const mutationObserver = new MutationObserver(debouncedResize)
      for (
        let node: Element | null = chartBodyNode;
        node && node !== chartNode;
        node = node.parentElement
      ) {
        mutationObserver.observe(node, { attributeFilter: ["transform"] })
      }

      resize()

      return () => {
        debouncedResize.cancel()
        mutationObserver.disconnect()
        if (resizeObserver) {
          resizeObserver.disconnect()
        }
      }
    }

    return undefined
  }, [chartNode, chartBodyNode, getChartBodySizeAndPosition])

  // This effect watches for changes to the chart to reposition annotations
  useEffect(() => {
    if (chartNode && chartBodyNode && width && height) {
      const update = () => {
        setVegaData(() => {
          const chartRect = chartNode.getBoundingClientRect()
          const annotationAnchors: PositionedAnnotation[] = []
          const annotationLabels: PositionedAnnotation[] = []
          annotations.forEach((annotation) => {
            if (!annotation.hidden) {
              const selector = annotationToSelector(annotation)
              const anchor = chartBodyNode.querySelector(selector)
              if (anchor) {
                const anchorStyle = getComputedStyle(anchor)
                const center = getCenterRelativeTo(anchor, chartRect, top, left)
                const defaultSettings = calcDefaultSettings(
                  annotation,
                  width,
                  height,
                  center.x,
                  center.y
                )
                annotation = { ...defaultSettings, ...annotation }

                // Place the anchor
                const fill = anchorStyle.fill
                const annotationAnchor = { annotation, fill, ...center }
                annotationAnchors.push(annotationAnchor)

                // If the annotation has text, place the label and link the
                // anchor to the label
                if (annotation.text) {
                  const annotationLabel = {
                    annotation,
                    annotationAnchor,
                    x: center.x + (annotation.xOffset || 10),
                    y: center.y + (annotation.yOffset || -10)
                  }
                  annotationLabels.push(annotationLabel)
                }
              }
            }
          })

          // If there are any annotations to display, set the vega data. In
          // edit mode, we need to display the overlay even if there aren't any
          // annotations.
          if (annotationAnchors.length > 0 || editMode) {
            return {
              annotationAnchors,
              annotationLabels
            }
          }
          return undefined
        })
      }
      update()

      if (annotations.length > 0) {
        // watch for chart changes to reposition annotations
        const debouncedUpdate = debounce(update, DEBOUNCE_TIMEOUT)
        const mutationObserver = new MutationObserver(debouncedUpdate)
        mutationObserver.observe(chartBodyNode, {
          attributeFilter: POSITION_ATTRIBUTES,
          childList: true,
          subtree: true
        })

        return () => {
          debouncedUpdate.cancel()
          mutationObserver.disconnect()
        }
      }
    } else {
      setVegaData(undefined)
    }

    return undefined
  }, [
    annotations,
    chartNode,
    chartBodyNode,
    calcDefaultSettings,
    editMode,
    top,
    left,
    width,
    height
  ])

  // In edit mode, this will install an event listener to capture click events,
  // preventing any sort of crossfiltering on the chart and allowing the user
  // to add new annotations.
  useEffect(() => {
    if (editMode && chartBodyNode) {
      // handler for clicking on the chart
      const clickHandler = (evt: MouseEvent) => {
        // Figure out what was clicked on
        const elements = getElementsFromPoint(evt.clientX, evt.clientY)

        // we want to make sure the click doesn't fire anything on the chart
        // that would cause things like crossfiltering
        evt.stopPropagation()
        evt.preventDefault()

        // if an edit box is open, blur it
        if (editLabelRef.current) {
          editLabelRef.current.blur()
        }

        // Spec says elements should be an array, but IE/Edge return a
        // NodeList. So, for maximum compatibility, we'll use a for loop.
        for (let i = 0; i < elements.length; i++) {
          if (
            elements[i].classList.contains("annotation-anchor") ||
            elements[i].classList.contains("annotation-area")
          ) {
            // User clicked on an area or anchor - add a new annotation
            const dataSource = elements[i].dataset.annotationDataSource
            const dimensions = JSON.parse(
              elements[i].dataset.annotationDimensions || "{}"
            ) as Record<string, string>
            const measure = elements[i].dataset.annotationMeasure
            if (dataSource && dimensions && measure) {
              // If we decide to default to the dimension value instead, we can
              // use the following:
              //
              // const dimValues = Object.values(dimensions)
              // const value =
              //   elements[i].dataset.annotationFormatted ||
              //   (dimValues.length > 0 && dimValues[0]) ||
              //   "New Annotation"
              const value = DEFAULT_LABEL_TEXT
              addAnnotation(dataSource, dimensions, measure, value)
            }
            break
          } else if (!chartBodyNode.contains(elements[i])) {
            // we've checked all the elements inside the chart - bail
            break
          }
        }
      }

      const stylesheet = document.createElement("style")
      document.body.appendChild(stylesheet)

      const isAnchorOrArea = (e: EventTarget | null): e is SVGElement =>
        Boolean(
          e &&
            ((e as SVGElement).classList.contains("annotation-anchor") ||
              (e as SVGElement).classList.contains("annotation-area"))
        )

      // mousing over annotation anchors/areas - show annotation anchors
      const mouseOverHandler = (evt: MouseEvent) => {
        if (isAnchorOrArea(evt.target)) {
          const selector = buildSelector({
            annotationDataSource: evt.target.dataset.annotationDataSource,
            annotationDimensions: evt.target.dataset.annotationDimensions,
            annotationMeasure: evt.target.dataset.annotationMeasure
          })
          stylesheet.innerHTML = `${selector} { opacity: 1.0; }`
        }
      }

      // mousing out of annotation areas/anchors - hide them again
      const mouseOutHandler = (evt: MouseEvent) => {
        if (isAnchorOrArea(evt.target)) {
          stylesheet.innerHTML = ""
        }
      }

      // We set our click handler to "capture" events - this means it will have
      // a chance to intercept clicks before normal (bubbling) event handlers.
      chartBodyNode.addEventListener("click", clickHandler, true)
      chartBodyNode.addEventListener("mouseover", mouseOverHandler)
      chartBodyNode.addEventListener("mouseout", mouseOutHandler)

      // We want to block mousedown and mouseup as well since some charts may
      // use those events (brush filters, for example).
      const blockingHandler = (evt: MouseEvent) => {
        evt.stopPropagation()
        evt.preventDefault()
      }

      chartBodyNode.addEventListener("mousedown", blockingHandler, true)
      chartBodyNode.addEventListener("mouseup", blockingHandler, true)

      return () => {
        chartBodyNode.removeEventListener("click", clickHandler, true)
        chartBodyNode.removeEventListener("mouseover", mouseOverHandler)
        chartBodyNode.removeEventListener("mouseout", mouseOutHandler)
        chartBodyNode.removeEventListener("mousedown", blockingHandler, true)
        chartBodyNode.removeEventListener("mouseup", blockingHandler, true)
        document.body.removeChild(stylesheet)
      }
    }

    return undefined
  }, [editMode, chartBodyNode, addAnnotation])

  // if there's an annotation to edit, focus the textarea
  // and record its initial dimensions
  useEffect(() => {
    if (editAnnotationId && editLabelRef.current) {
      setEditLabelInitialWidth(editLabelRef.current.offsetWidth)
      setEditLabelInitialHeight(editLabelRef.current.offsetHeight)

      let text = annotations.find((a) => a.id === editAnnotationId)?.text || ""
      if (Array.isArray(text)) {
        text = text.join(" ")
      }

      setEditLabelValue(text)
    } else {
      setEditLabelValue("")
    }
  }, [editAnnotationId, annotations])

  // if there's an annotation to edit, focus the textarea
  // and record its initial dimensions
  useEffect(() => {
    if (editLabelRef.current) {
      editLabelRef.current.focus()
      if (editLabelValue === DEFAULT_LABEL_TEXT) {
        editLabelRef.current.select()
      }
    }
  }, [editLabelValue])

  const signalValues = useMemo(
    // we only need to inform vega when editAnnotationId goes null
    () => ({
      fontSize,
      fontWeight,
      ...(editAnnotationId === null ? { editAnnotation: null } : {})
    }),
    [fontSize, fontWeight, editAnnotationId]
  )

  const signalListeners = useMemo(
    () => ({
      dragAnchor: () => {
        // clear delete button so it doesn't linger when you drag
        setDeleteAnnotationId(null)

        // set the dragging flag
        setDragging(true)
      },
      dragEvent: (_, val) => {
        if (val) {
          positionAnnotation(val.id, val.xOffset, val.yOffset)
        }
        setDragging(false)
      },
      editAnnotation: (_, val) => {
        if (val && val.bounds) {
          setEditLabelStyle({
            fontWeight,
            fontSize: `${fontSize}px`,
            top: `${val.bounds.y1}px`,
            left: `${val.bounds.x1}px`,
            // We add a little more to the width to account for the input field padding
            width: `${Math.ceil(val.bounds.x2 - val.bounds.x1) + 4}px`,
            height: `${Math.ceil(val.bounds.y2 - val.bounds.y1) + 2}px`
          })

          setEditAnnotationId(val.id)
        }
        setDragging(false)
      }
    }),
    [fontSize, fontWeight, positionAnnotation]
  )

  // no chart? no data? no overlay!
  if (!chartNode || !chartBodyNode || !vegaData) {
    return <></>
  }

  // in edit mode, show the delete icon on hover
  let onMouseOver: MouseEventHandler | undefined = undefined
  let onMouseOut: MouseEventHandler | undefined = undefined

  if (editMode && !dragging) {
    const isLabel = (e: EventTarget | null): e is SVGElement =>
      Boolean(e && (e as SVGElement).classList.contains("annotation-label"))
    const isDelete = (e: EventTarget | null): e is HTMLElement =>
      Boolean(
        e &&
          ((e as HTMLElement).classList.contains(
            "annotation-overlay__delete"
          ) ||
            (e as HTMLElement).classList.contains(
              "annotation-overlay__delete-target"
            ) ||
            (e as HTMLElement).classList.contains(
              "annotation-overlay__delete-icon"
            ))
      )

    onMouseOver = (evt) => {
      if (isLabel(evt.target) && annotationOverlayRef.current) {
        // Because the edit label field is relative to the overlay while the
        // annotation label position is relative to the window, we subtract
        // the overlay x,y values from the label x,y values to position the field
        const labelClientRect = evt.target.getBoundingClientRect()
        const overlayClientRect = annotationOverlayRef.current.getBoundingClientRect()

        setDeleteIconPosition({
          top: `${labelClientRect.top - overlayClientRect.top}px`,
          left: `${
            labelClientRect.left -
            overlayClientRect.left +
            labelClientRect.width
          }px`
        })

        setDeleteAnnotationId(evt.target.dataset.annotationId || null)
      }
    }

    onMouseOut = (evt) => {
      // The delete button consists of a few elements (see class names in `isDelete`).
      //
      // If we're leaving a label and entering one of the delete elements, that's ok.
      // If we're leaving a delete element and entering another delete element or a label,
      // that's ok.
      //
      // Otherwise, the delete button needs to go away.
      if (
        (isLabel(evt.target) && !isDelete(evt.relatedTarget)) ||
        (isDelete(evt.target) &&
          !(isDelete(evt.relatedTarget) || isLabel(evt.relatedTarget)))
      ) {
        setDeleteAnnotationId(null)
      }
    }
  }

  // handle enter and esc when editing an annotation
  const handleLabelKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.keyCode === KEYCODE.Enter) {
      // blur handler will save the value
      e.currentTarget.blur()
    } else if (e.keyCode === KEYCODE.Esc) {
      setEditAnnotationId(null)
    }
  }

  // handle blurring the edit box
  const handleLabelBlur: FocusEventHandler<HTMLTextAreaElement> = (e) => {
    if (editAnnotationId) {
      if (
        editLabelInitialWidth !== e.currentTarget.offsetWidth ||
        editLabelInitialHeight !== e.currentTarget.offsetHeight
      ) {
        resizeAnnotation(
          editAnnotationId,
          e.currentTarget.offsetWidth,
          e.currentTarget.offsetHeight
        )
      }

      if (editLabelValue) {
        editAnnotationText(editAnnotationId, editLabelValue)
      }
    }

    setEditAnnotationId(null)
  }

  // handle clicking the delete annotation button
  const handleDeleteClick: MouseEventHandler = (e) => {
    e.stopPropagation()
    deleteAnnotation(deleteAnnotationId)
    setDeleteAnnotationId(null)
  }

  return (
    <div
      ref={annotationOverlayRef}
      className={cx("annotation-overlay", dragging && "dragging-annotation")}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      <Vega
        className="vega-wrapper"
        data={vegaData}
        spec={SPEC}
        width={width}
        height={height}
        signalListeners={signalListeners}
        signalValues={signalValues}
      />
      {editAnnotationId && (
        <textarea
          ref={editLabelRef}
          data-ui-config-id="annotation-label"
          className="annotation-overlay__edit-label"
          value={editLabelValue}
          onChange={(e) => setEditLabelValue(e.currentTarget.value)}
          style={editLabelStyle}
          onKeyDown={handleLabelKeyDown}
          onBlur={handleLabelBlur}
        />
      )}
      <Tooltip content="Delete this annotation" enterDelay={500}>
        <div
          className={cx("annotation-overlay__delete", {
            "is-shown": deleteAnnotationId && !editAnnotationId
          })}
          style={deleteIconPosition}
        >
          <div
            onClick={handleDeleteClick}
            data-ui-config-id="annotation-label"
            className="annotation-overlay__delete-target"
          >
            <Icon className="annotation-overlay__delete-icon" icon="close" />
          </div>
        </div>
      </Tooltip>
    </div>
  )
}

export default React.memo(Annotations)
