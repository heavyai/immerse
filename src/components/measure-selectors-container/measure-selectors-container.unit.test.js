// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import MeasureSelectorsContainer from "./measure-selectors-container"

jest.mock("components/selector-container/selector-container", () => {
  const MockSelectorContainer = (props) => (
    <div
      className="mock-selector-container"
      data-index={props.index}
      data-selector={JSON.stringify(props.selector)}
    />
  )
  return {
    __esModule: true,
    default: MockSelectorContainer
  }
})

describe("MeasureSelectorsContainer", () => {
  const measures = [
    {
      value: "test",
      label: "test"
    },
    {
      value: "test1",
      label: "test1"
    },
    {}
  ]

  const baseProps = {
    measures,
    chartId: "1",
    addCustomMeasure: () => {},
    addSelector: () => {},
    clearSelector: () => {},
    removeSelector: () => {}
  }

  function createElement(overrideProps = {}) {
    const props = { ...baseProps, ...overrideProps }
    return MeasureSelectorsContainer(props)
  }

  it("should map over the measures", () => {
    const element = createElement()
    const rawChildren = Array.isArray(element.props.children)
      ? element.props.children
      : [element.props.children]

    const children = []
    rawChildren.forEach((child) => {
      if (!child) {
        return
      }
      if (Array.isArray(child)) {
        child.forEach((c) => c && children.push(c))
      } else {
        children.push(child)
      }
    })

    expect(children).toHaveLength(3)
    expect(children[0].props.selector).toStrictEqual(measures[0])
    expect(children[1].props.selector).toStrictEqual(measures[1])
    expect(children[2].props.selector).toStrictEqual(measures[2])
  })

  it("should show 'None Required' when there are no measures for text chart", () => {
    const element = createElement({ measures: [], chartType: "text" })
    const rawChildren = Array.isArray(element.props.children)
      ? element.props.children
      : [element.props.children]

    const children = []
    rawChildren.forEach((child) => {
      if (!child) {
        return
      }
      if (Array.isArray(child)) {
        child.forEach((c) => c && children.push(c))
      } else {
        children.push(child)
      }
    })

    expect(children).toHaveLength(1)
    const info = children[0]
    expect(info.props.className).toBe("available-without-select")
    expect(info.props.children).toBe("None Required")
  })
})
