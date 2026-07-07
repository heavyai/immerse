// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import { act } from "react-dom/test-utils"
import {
  withStateContainer,
  onValueChange,
  SelectorPillContent
} from "./selector-container"
import { compose, setDisplayName, toClass } from "recompose"
import withHandlers from "recompose/withHandlers"
import {
  CUSTOM_DIMENSION_VALUE,
  CUSTOM_MEASURE_VALUE
} from "constants/magic-variables"
import { KEYCODE } from "constants/keycode"

jest.mock("components/selector-pill/selector-pill-parent", () => {
  const MockSelectorPillParent = () => (
    <div data-testid="selector-pill-parent" />
  )
  return {
    __esModule: true,
    default: MockSelectorPillParent
  }
})

jest.mock("components/selector-pill/make-drop-and-draggable", () => {
  const identity = (Component) => Component
  return {
    __esModule: true,
    default: identity
  }
})

describe("Selector Container Component", () => {
  let latestChildProps = null

  const StatefulElement = compose(
    withHandlers({
      createNewCustomSQL: () => () => {}
    }),
    withStateContainer,
    setDisplayName("Child"),
    toClass
  )((props) => {
    latestChildProps = props
    return <div className="root" />
  })

  describe("Selector State", () => {
    beforeEach(() => {
      latestChildProps = null
      render(<StatefulElement />)
    })
    it("should be initiaized correctly", () => {
      const props = latestChildProps
      expect(props.editMode).toEqual(false)
      expect(props.isDropdownOpen).toEqual(false)
      expect(props.showCustom).toEqual(false)
    })
    describe("Handlers", () => {
      function invokeHandler(name, arg) {
        act(() => {
          latestChildProps[name](arg)
        })
      }

      function getChildStateProps() {
        return latestChildProps
      }
      describe("onOpenChange", () => {
        it("should set editMode to the value passed in", () => {
          invokeHandler("onOpenChange", true)
          expect(getChildStateProps().isDropdownOpen).toEqual(true)
          invokeHandler("onOpenChange", false)
          expect(getChildStateProps().isDropdownOpen).toEqual(false)
        })
      })
      describe("stopEditingSelector", () => {
        it("should set", () => {
          act(() => {
            latestChildProps.setIsDropdownOpen(() => true)
            latestChildProps.setEditMode(() => true)
            latestChildProps.setShowCustom(() => true)
          })
          invokeHandler("stopEditingSelector")
          expect(getChildStateProps().editMode).toEqual(false)
          expect(getChildStateProps().isDropdownOpen).toEqual(false)
          expect(getChildStateProps().showCustom).toEqual(false)
        })
      })
      describe("showCustomSQLSelector", () => {
        it("should set", () => {
          act(() => {
            latestChildProps.setIsDropdownOpen(() => true)
            latestChildProps.setEditMode(() => false)
            latestChildProps.setShowCustom(() => false)
          })
          invokeHandler("showCustomSQLSelector")
          expect(getChildStateProps().isDropdownOpen).toEqual(false)
          expect(getChildStateProps().showCustom).toEqual(true)
        })
      })
      describe("closeCustomMeasure", () => {
        it("should set", () => {
          act(() => {
            latestChildProps.setShowCustom(() => true)
          })
          invokeHandler("closeCustomSelector")
          expect(getChildStateProps().isDropdownOpen).toEqual(true)
          expect(getChildStateProps().showCustom).toEqual(false)
        })
      })
      describe("startEditingSelector", () => {
        it("should set", () => {
          invokeHandler("startEditingSelector")
          expect(getChildStateProps().editMode).toEqual(false)
        })
      })
      describe("onKeyDown", () => {
        it("should stop editing selector when Enter is pressed", () => {
          act(() => {
            latestChildProps.setIsDropdownOpen(() => false)
            latestChildProps.setEditMode(() => true)
            latestChildProps.setShowCustom(() => true)
          })
          invokeHandler("onKeyDown", {
            preventDefault: () => {},
            keyCode: KEYCODE.Enter
          })
          expect(getChildStateProps().editMode).toEqual(false)
          expect(getChildStateProps().isDropdownOpen).toEqual(false)
          expect(getChildStateProps().showCustom).toEqual(false)
        })
        it("should stop editing selector when Esc is pressed", () => {
          act(() => {
            latestChildProps.setIsDropdownOpen(() => true)
            latestChildProps.setEditMode(() => true)
            latestChildProps.setShowCustom(() => true)
          })
          invokeHandler("onKeyDown", {
            preventDefault: () => {},
            keyCode: KEYCODE.Esc
          })
          expect(getChildStateProps().editMode).toEqual(false)
          expect(getChildStateProps().isDropdownOpen).toEqual(false)
          expect(getChildStateProps().showCustom).toEqual(false)
        })
      })
    })
  })
  describe("render", () => {
    function createElement(givenProps) {
      const props = {
        editMode: false,
        Popover: () => {},
        chartId: "0",
        closeCustomSelector: () => {},
        index: 0,
        onOpenChange: () => {},
        onValueChange: () => {},
        removeSelector: () => {},
        selector: {},
        setPropagation: () => {},
        showCustom: false,
        showCustomBinSettings: false,
        showCustomSQLSelector: () => {},
        startEditingSelector: () => {},
        stopEditingSelector: () => {},
        submitCustomDimension: () => {},
        type: "measure",
        ...givenProps
      }

      return SelectorPillContent(props)
    }
    describe("when editMode is true", () => {
      it("should render Popover component", () => {
        const Popover = ({ children }) => (
          <div className="react-popover">{children}</div>
        )
        const element = createElement({
          Popover,
          editMode: true
        })
        // when editMode is true, SelectorPillContent should render the Popover
        expect(element.type).toBe(Popover)
      })
    })
    describe("when selector has name, value, or is custom", () => {
      it("should render SelectorPillParent", () => {
        const byValue = createElement({ selector: { value: "test-value" } })
        expect(byValue.type).toBeTruthy()
        expect(byValue.props.selector.value).toBe("test-value")

        const byName = createElement({ selector: { name: "test-name" } })
        expect(byName.type).toBeTruthy()
        expect(byName.props.selector.name).toBe("test-name")

        const byCustom = createElement({ selector: { custom: true } })
        expect(byCustom.type).toBeTruthy()
        expect(byCustom.props.selector.custom).toBe(true)
      })
    })
    describe("when all the above conditions are false", () => {
      it("should render add buttono wrapper", () => {
        const element = createElement({ selector: {} })
        expect(element.type).toBe("div")
        expect(element.props.className).toContain("add-btn-wrap")
      })
    })
  })
  describe("onValueChange Handler", () => {
    describe("when option is undefined", () => {
      it("shoudl remove selector", () => {
        const index = 1
        const selector = { value: "test" }
        const removeSelector = jest.fn()
        const handler = onValueChange({ removeSelector, index, selector })
        handler()
        expect(removeSelector).toHaveBeenCalledWith(index, selector)
      })
    })
    describe("on measures", () => {
      describe("when options value is custom", () => {
        it("should invoke showCustomMeasure", () => {
          const showCustomSQLSelector = jest.fn()
          const createNewCustomSQL = jest.fn()
          const handler = onValueChange({
            showCustomSQLSelector,
            createNewCustomSQL
          })
          handler({ value: CUSTOM_MEASURE_VALUE })
          expect(showCustomSQLSelector).toHaveBeenCalled()
        })
        it("should invoke showCustomDimension", () => {
          const showCustomSQLSelector = jest.fn()
          const createNewCustomSQL = jest.fn()
          const handler = onValueChange({
            showCustomSQLSelector,
            createNewCustomSQL
          })
          handler({ value: CUSTOM_DIMENSION_VALUE })
          expect(showCustomSQLSelector).toHaveBeenCalled()
        })
      })
      describe("when option value is equal to selector value", () => {
        it("should call a noop when user selects same value", () => {
          const option = {
            value: "airtime"
          }
          const props = {
            chartType: "pie",
            selector: {
              value: "airtime"
            },
            stopEditingSelector: jest.fn(),
            addSelector: jest.fn(),
            type: "measure",
            index: 0
          }
          const handler = onValueChange(props)
          handler(option)
          expect(props.addSelector).not.toHaveBeenCalled()
          expect(props.stopEditingSelector).toHaveBeenCalled()
        })
      })
      describe("when should stop adding selector is true", () => {
        it("should call stopEditingSelector and addSelector", () => {
          const option = {
            value: "*"
          }
          const props = {
            chartType: "pie",
            stopEditingSelector: jest.fn(),
            addSelector: jest.fn(),
            type: "measure",
            index: 0
          }
          const handler = onValueChange(props)
          handler(option)
          expect(props.addSelector).toHaveBeenCalledWith(props.index, {
            ...option,
            custom: false
          })
          expect(props.stopEditingSelector).toHaveBeenCalled()
        })
      })
      describe("when all the above are false", () => {
        const option = {
          value: ""
        }
        const props = {
          chartType: "table",
          stopEditingSelector: jest.fn(),
          addSelector: jest.fn(),
          type: "measure",
          index: 0,
          hasActiveDimensions: true,
          isGroupBy: true
        }
        it("should call addSelector", () => {
          const handler = onValueChange(props)
          handler(option)
          expect(props.addSelector).toHaveBeenCalledWith(props.index, {
            ...option,
            custom: false
          })
          expect(props.stopEditingSelector).not.toHaveBeenCalled()
        })

        describe("when hasActiveDimensions is false", () => {
          it("should call stopEditingSelector and addSelector", () => {
            const handler = onValueChange(
              Object.assign({}, props, { hasActiveDimensions: false })
            )
            handler(option)
            expect(props.addSelector).toHaveBeenCalledWith(props.index, {
              ...option,
              custom: false
            })
            expect(props.stopEditingSelector).toHaveBeenCalled()
          })
        })
      })
    })

    describe("on dimensions", () => {
      let props = null
      beforeEach(() => {
        props = {
          chartType: "table",
          stopEditingSelector: jest.fn(),
          addSelector: jest.fn(),
          type: "dimension",
          index: 0
        }
      })
      describe("on string dimension option", () => {
        it("should call stopEditingSelector and addSelector", () => {
          const option = { value: "", type: "STR" }
          const handler = onValueChange(props)
          handler(option)
          expect(props.addSelector).toHaveBeenCalledWith(props.index, {
            ...option,
            custom: false
          })
          expect(props.stopEditingSelector).toHaveBeenCalled()
        })
      })
      describe("on numerical dimension option", () => {
        it("should call stopEditingSelector and addSelector", () => {
          const option = { value: "", type: "INT" }
          const handler = onValueChange(props)
          handler(option)
          expect(props.addSelector).toHaveBeenCalledWith(props.index, {
            ...option,
            custom: false
          })
          expect(props.stopEditingSelector).not.toHaveBeenCalled()
        })
      })
    })
  })
})
