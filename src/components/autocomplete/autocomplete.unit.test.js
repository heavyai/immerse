// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { KEYCODE } from "constants/keycode"
import { fireEvent, render, waitFor } from "@testing-library/react"

import AutocompleteParent from "components/autocomplete/autocomplete-parent"
import userEvent from "@testing-library/user-event"

describe("Autocomplete Component", () => {
  describe("Autocomplete Event Handlers", () => {
    let defaultProps
    beforeEach(() => {
      defaultProps = {
        testid: "autocomplete-parent",
        options: [{ value: "1" }, { value: "2" }, { value: "3" }]
      }
    })

    const renderComponent = (props) => {
      const mergedProps = { ...defaultProps, ...props }
      return render(<AutocompleteParent {...mergedProps} />)
    }

    it("should set open state and activate dropdown when input is clicked", () => {
      const props = {
        value: "test"
      }
      const {
        getByTestId,
        queryByTestId,
        queryAllByTestId,
        getByRole
      } = renderComponent(props)

      expect(queryByTestId("autocomplete-dropdown")).not.toBeInTheDocument()
      expect(queryAllByTestId("autocomplete-dropdown-item").length).toBe(0)

      fireEvent.click(getByRole("textbox"))

      expect(getByTestId("autocomplete-dropdown")).toBeInTheDocument()
      expect(queryAllByTestId("autocomplete-dropdown-item").length).toBe(3)
    })

    it("should call showCustomSQLSelector if passed a custom dimension", () => {
      const props = {
        value: "test",
        inputOnClick: jest.fn(),
        dimension: { custom: true }
      }
      const { getByRole } = renderComponent(props)
      fireEvent.click(getByRole("textbox"))
      expect(props.inputOnClick).toHaveBeenCalled()
    })

    it("should clear input value when clear input button is clicked", () => {
      const props = {
        selectedOption: { value: "test" }
      }
      const { getByRole } = renderComponent(props)

      expect(getByRole("textbox").value).toEqual(props.selectedOption.value)
      fireEvent.click(getByRole("button"))
      expect(getByRole("textbox").value).toEqual("")
    })

    it("should update inputValue when input value changed", () => {
      const props = {
        selectedOption: { value: "test" }
      }
      const { getByRole } = renderComponent(props)
      const newValue = "new"
      expect(getByRole("textbox").value).toEqual(props.selectedOption.value)
      fireEvent.change(getByRole("textbox"), { target: { value: newValue } })
      expect(getByRole("textbox").value).toEqual(newValue)
    })

    it("should set option highlight index on mouseenter and mouseleave", () => {
      const props = {
        openByDefault: true,
        selectedOption: { value: "test" },
        onEnter: jest.fn(),
        onLeave: jest.fn()
      }
      const { getByTestId, queryAllByTestId } = renderComponent(props)

      fireEvent.mouseMove(getByTestId("autocomplete-dropdown-list"))
      const allItems = queryAllByTestId("autocomplete-dropdown-item")
      const lastItem = allItems[allItems.length - 1]
      fireEvent.mouseEnter(lastItem)
      expect(props.onEnter).toHaveBeenCalledWith({ value: "3" })

      fireEvent.mouseLeave(lastItem)
      expect(props.onLeave).toHaveBeenCalled()
    })

    it("should submit value when option is clicked", async () => {
      const props = {
        openByDefault: true,
        selectedOption: { value: "1" },
        updateValue: jest.fn(),
        onExit: jest.fn()
      }

      const { queryAllByTestId } = renderComponent(props)
      const allItems = queryAllByTestId("autocomplete-dropdown-item")
      const lastItem = allItems[allItems.length - 1]
      fireEvent.click(lastItem)
      expect(props.updateValue).toHaveBeenCalledTimes(1)
      // multiSourceIndex is second param here (undefined)
      expect(props.updateValue).toHaveBeenCalledWith(
        expect.objectContaining({
          value: "3"
        }),
        undefined
      )
      expect(props.onExit).toHaveBeenCalled()
    })

    it("should submit correct value when forceComplete is disabled", () => {
      const newValue = "newvalue"
      const newOption = { value: newValue, label: newValue }
      const props = {
        openByDefault: true,
        forceComplete: false,
        selectedOption: { value: "test" },
        options: [...defaultProps.options, newOption],
        updateValue: jest.fn(),
        onExit: jest.fn()
      }

      const { getByText } = renderComponent(props)
      fireEvent.click(getByText(newValue))

      expect(props.updateValue).toHaveBeenCalledTimes(1)
      // multiSourceIndex is second param here (undefined)
      expect(props.updateValue).toHaveBeenCalledWith(
        expect.objectContaining({
          value: newValue
        }),
        undefined
      )
      expect(props.onExit).toHaveBeenCalled()
    })

    it("should submit correct value when forceComplete is enabled", async () => {
      const selectedOptionText = "testLabelMatchThis"
      const selectedOption = {
        value: selectedOptionText,
        label: selectedOptionText
      }
      const props = {
        openByDefault: true,
        forceComplete: true,
        selectedOption,
        options: [{ value: "anotherone" }, selectedOption],
        updateValue: jest.fn(),
        onExit: jest.fn()
      }
      const { getByRole } = renderComponent(props)
      const input = getByRole("textbox")

      // Updates the input, press enter to submit
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: "anothervalue" } })
      fireEvent.keyDown(input, {
        keyCode: KEYCODE.Enter
      })

      // It should _stay_ whatever the selected option was in props
      expect(input.value).toBe(selectedOptionText)
    })

    it("should select value when enter is pressed", async () => {
      const props = {
        openByDefault: true,
        updateValue: jest.fn(),
        onExit: jest.fn()
      }
      const { getByRole, queryAllByTestId } = renderComponent(props)
      const input = getByRole("textbox")
      fireEvent.focus(input)
      const allItems = queryAllByTestId("autocomplete-dropdown-item")
      const lastItem = allItems[allItems.length - 1]

      fireEvent.click(input)
      // Component tracks mouse moves for some UX reasons
      // Has to move before we mouseOver the item we want to select
      fireEvent.mouseMove(allItems[0])
      fireEvent.mouseOver(lastItem)
      await waitFor(() => {
        expect(lastItem).toHaveClass("highlight")
      })
      fireEvent.keyDown(lastItem, { keyCode: KEYCODE.Enter })
      expect(props.updateValue).toHaveBeenCalledWith({ value: "3" }, undefined)
    })

    it("should cancel input should revert inputValue", () => {
      const props = {
        selectedOption: { value: "test" },
        onExit: jest.fn()
      }

      const newValue = "new"
      const { getByRole } = renderComponent(props)
      const input = getByRole("textbox")

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: newValue } })
      expect(input.value).toBe(newValue)
      fireEvent.keyDown(input, { keyCode: KEYCODE.Esc })

      expect(input.value).toEqual(props.selectedOption.value)
      expect(props.onExit).toHaveBeenCalled()
    })

    it("should cancel input if clicked outside", async () => {
      const props = {
        selectedOption: { value: "test" },
        onExit: jest.fn()
      }
      const newValue = "new"
      const { getByRole } = renderComponent(props)
      const input = getByRole("textbox")
      fireEvent.change(input, { target: { value: newValue } })

      expect(input.value).toEqual(newValue)
      userEvent.click(document.body)
      await waitFor(() => {
        expect(props.onExit).toHaveBeenCalled()
      })
      expect(input.value).toEqual(props.selectedOption.value)
    })

    it("should highlight correct options on arrow keys press", () => {
      const props = {
        selectedOption: { value: "test" }
      }

      const { getByRole, queryAllByTestId } = renderComponent(props)
      const input = getByRole("textbox")
      fireEvent.focus(input)
      fireEvent.keyDown(input, { keyCode: KEYCODE.ArrowDown })
      fireEvent.keyDown(input, { keyCode: KEYCODE.ArrowDown })

      const allItems = queryAllByTestId("autocomplete-dropdown-item")
      expect(allItems[1]).toHaveClass("highlight")

      fireEvent.keyDown(input, { keyCode: KEYCODE.ArrowUp })
      expect(allItems[0]).toHaveClass("highlight")

      fireEvent.keyDown(input, { keyCode: KEYCODE.ArrowUp })
      expect(allItems[2]).toHaveClass("highlight")
    })

    it("should filter options on input change", () => {
      const props = {
        selectedOption: { value: "test" }
      }

      const { getByRole, queryAllByTestId } = renderComponent(props)
      const input = getByRole("textbox")

      fireEvent.change(input, { target: { value: "" } })
      expect(queryAllByTestId("autocomplete-dropdown-item").length).toEqual(3)
      fireEvent.change(input, { target: { value: "1" } })
      expect(queryAllByTestId("autocomplete-dropdown-item").length).toEqual(1)
    })

    it("should tab should autofill inputValue", () => {
      const props = {
        selectedOption: { value: "test" }
      }

      const { getByRole, queryAllByTestId, getByTestId } = renderComponent(
        props
      )
      const input = getByRole("textbox")
      fireEvent.click(input)
      fireEvent.focus(input)
      fireEvent.keyDown(input, { keyCode: KEYCODE.Tab })
      expect(input.value).toEqual(defaultProps.options[0].value)

      fireEvent.mouseMove(getByTestId("autocomplete-dropdown-list"))
      const allItems = queryAllByTestId("autocomplete-dropdown-item")
      const lastItem = allItems[allItems.length - 1]
      fireEvent.mouseEnter(lastItem)

      fireEvent.keyDown(input, { keyCode: KEYCODE.Tab })
      expect(input.value).toEqual(defaultProps.options[2].value)
    })
  })
})
