// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DragSource, DropTarget } from "react-dnd"
import compose from "recompose/compose"
import {
  isD3ChartWithCategoricalColoring,
  resetD3ChartDomainRange
} from "reducers/charts/helpers/color-helpers"

function type(props) {
  return props.selectorType
}

function beginDrag({ index }) {
  return {
    index
  }
}

function collect(dragType) {
  if (dragType === "target") {
    return (dragConnect, monitor) => ({
      connectDropTarget: dragConnect.dropTarget(),
      isOver: monitor.isOver()
    })
  } else if (dragType === "source") {
    return (dragConnect, monitor) => ({
      connectDragSource: dragConnect.dragSource(),
      isDragging: monitor.isDragging()
    })
  } else {
    return () => {
      "no-op"
    }
  }
}

export function drop(props, monitor) {
  const dragIndex = monitor.getItem().index
  const hoverIndex = props.index
  if (
    props.selectorType === "dimensions" &&
    isD3ChartWithCategoricalColoring(props.chart)
  ) {
    resetD3ChartDomainRange(props.chart)
    props.resetCustomDomainRange()
  }
  props.swapSelectors(hoverIndex, dragIndex)
}

export default compose(
  DropTarget(type, { drop }, collect("target")),
  DragSource(type, { beginDrag }, collect("source"))
)
