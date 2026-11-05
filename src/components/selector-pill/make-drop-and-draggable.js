// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDrag, useDrop } from "react-dnd"
import {
  isD3ChartWithCategoricalColoring,
  resetD3ChartDomainRange
} from "reducers/charts/helpers/color-helpers"

export function drop(props, monitor) {
  const dragIndex = monitor.getItem().index
  if (
    props.selectorType === "dimensions" &&
    isD3ChartWithCategoricalColoring(props.chart)
  ) {
    resetD3ChartDomainRange(props.chart)
    props.resetCustomDomainRange()
  }
  props.swapSelectors(props.index, dragIndex)
}

export const connectElement = (connector) => (element) =>
  React.cloneElement(element, {
    ref: (node) => {
      connector(node)
      const previous = element.props.ref
      if (typeof previous === "function") {
        previous(node)
      } else if (previous) {
        previous.current = node
      }
    }
  })

export default function makeDropAndDraggable(Component) {
  return function DraggableSelector(props) {
    const [{ isDragging }, drag] = useDrag(
      () => ({
        type: props.selectorType,
        item: { index: props.index },
        collect: (monitor) => ({ isDragging: monitor.isDragging() })
      }),
      [props.selectorType, props.index]
    )
    const [{ isOver }, target] = useDrop(
      () => ({
        accept: props.selectorType,
        drop: (_item, monitor) => drop(props, monitor),
        collect: (monitor) => ({ isOver: monitor.isOver() })
      }),
      [props]
    )
    return (
      <Component
        {...props}
        connectDragSource={connectElement(drag)}
        connectDropTarget={connectElement(target)}
        isDragging={isDragging}
        isOver={isOver}
      />
    )
  }
}
