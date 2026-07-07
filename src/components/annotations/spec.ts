// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Spec } from "vega"
import {
  DEFAULT_DATABASE_STYLES,
  UI_CONFIG_ANNOTATION_LABEL,
  STYLE_PROPERTY_FONT_SIZE,
  STYLE_PROPERTY_FONT_WEIGHT
} from "components/ui-config-panel/constants"

const LABEL_PADDING = 5

const SPEC: Spec = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  autosize: "none",
  padding: 0,

  data: [
    {
      name: "annotationAnchors",
      values: []
    },
    {
      name: "annotationLabels",
      values: [],
      on: [
        {
          trigger: "dragLabel",
          modify: "dragAnchor.datum",
          values: "dragLabel"
        }
      ]
    }
  ],

  signals: [
    {
      name: "fontSize",
      description: "Font size of annotations.",
      value:
        DEFAULT_DATABASE_STYLES.text[UI_CONFIG_ANNOTATION_LABEL][
          STYLE_PROPERTY_FONT_SIZE
        ]
    },
    {
      name: "fontWeight",
      description: "Font weight of annotations.",
      value:
        DEFAULT_DATABASE_STYLES.text[UI_CONFIG_ANNOTATION_LABEL][
          STYLE_PROPERTY_FONT_WEIGHT
        ]
    },
    {
      name: "dragAnchor",
      description: "Origin point when beginning to drag a label.",
      value: null,
      on: [
        {
          events: "@labelrect:mousedown",
          update:
            "{ xadj: x() - group().datum.x, yadj: y() - group().datum.y, xorig: group().datum.x, yorig: group().datum.y, datum: group().datum, bounds: group().bounds }"
        },
        {
          events: [{ signal: "dragEvent" }, { signal: "editAnnotation" }],
          update: "null"
        }
      ]
    },
    {
      name: "dragLabel",
      description: "Handle mouse movement while dragging a label.",
      value: null,
      on: [
        {
          events: "[@labelrect:mousedown, window:mouseup] > window:mousemove",
          update:
            "isValid(dragAnchor) ? { x: x() - dragAnchor.xadj, y: y() - dragAnchor.yadj } : dragLabel"
        },
        {
          events: [{ signal: "dragEvent" }, { signal: "editAnnotation" }],
          update: "null"
        }
      ]
    },
    {
      name: "dragEvent",
      description:
        "Communicates repositioning back to the component at mouseup.",
      on: [
        {
          events: "window:mouseup",
          update:
            "isValid(dragAnchor) && (dragAnchor.datum.x - dragAnchor.xorig !== 0 || dragAnchor.datum.y - dragAnchor.yorig !== 0) ? { id: dragAnchor.datum.annotation.id, xOffset: dragAnchor.datum.x - dragAnchor.xorig + dragAnchor.datum.annotation.xOffset, yOffset: dragAnchor.datum.y - dragAnchor.yorig + dragAnchor.datum.annotation.yOffset } : dragEvent"
        }
      ]
    },
    {
      name: "editAnnotation",
      description: "Triggers when user clicks on an annotation label.",
      on: [
        {
          events: "window:mouseup",
          update:
            "isValid(dragAnchor) && dragAnchor.datum.x - dragAnchor.xorig === 0 && dragAnchor.datum.y - dragAnchor.yorig === 0 ? { id: dragAnchor.datum.annotation.id, bounds: dragAnchor.bounds } : editAnnotation"
        }
      ]
    }
  ],

  marks: [
    {
      name: "anchors",
      type: "symbol",
      from: { data: "annotationAnchors" },
      encode: {
        update: {
          shape: { field: "annotation.shape" },
          x: { field: "x" },
          y: { field: "y" },
          width: { field: "width" },
          height: { field: "height" },
          stroke: { value: "#000" },
          strokeWidth: { value: 1 },
          fill: { field: "fill" }
        }
      }
    },
    {
      name: "labels",
      type: "group",
      from: { data: "annotationLabels" },
      encode: {
        update: {
          x: [
            {
              test: "datum.x < 0",
              value: 0
            },
            {
              test: "datum.x + datum.annotation.width + 5 > width",
              signal: "width - datum.annotation.width - 5"
            },
            { field: "x" }
          ],
          y: [
            {
              test: "datum.y - 5 < 0",
              value: 5
            },
            {
              test: "datum.y + datum.annotation.height > height",
              signal: "height - datum.annotation.height"
            },
            { field: "y" }
          ],
          opacity: [
            {
              test:
                "editAnnotation && editAnnotation.id === datum.annotation.id",
              value: 0
            },
            { value: 0.8 }
          ]
        }
      },
      marks: [
        {
          name: "labeltext",
          type: "text",
          zindex: 1,
          interactive: false,
          encode: {
            update: {
              baseline: { value: "line-top" },
              text: { field: { parent: "annotation.text" } },
              fontSize: { signal: "fontSize" },
              fontWeight: { signal: "fontWeight" },
              opacity: { field: { group: "opacity" } }
            }
          }
        },
        {
          name: "labelrect",
          type: "rect",
          from: { data: "labeltext" },
          encode: {
            update: {
              x: { field: "bounds.x1", offset: -LABEL_PADDING },
              x2: { field: "bounds.x2", offset: LABEL_PADDING },
              y: { field: "bounds.y1", offset: -LABEL_PADDING },
              y2: { field: "bounds.y2", offset: LABEL_PADDING },
              opacity: { field: { group: "opacity" } },
              omniAnnotation: {
                signal: "{ annotationId: parent.annotation.id }"
              },
              omniAnnotationType: { value: "label" }
            }
          }
        }
      ]
    },
    {
      name: "links",
      type: "rule",
      from: { data: "labels" },
      zindex: 1,
      encode: {
        update: {
          x: { field: "datum.annotationAnchor.x" },
          y: { field: "datum.annotationAnchor.y" },
          stroke: { value: "#ccc" },
          strokeWidth: { value: 1 }
        }
      },
      transform: [
        {
          type: "intersectrectangle",
          x: "x",
          y: "y",
          bounds: "datum.bounds",
          asX: "x2",
          asY: "y2"
        }
      ]
    }
  ]
}

export default SPEC
