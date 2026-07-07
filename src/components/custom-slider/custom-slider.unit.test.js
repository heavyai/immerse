// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent } from "@testing-library/react"
import CustomSlider from "components/custom-slider/custom-slider"

describe("Custom Slider Component", () => {
  const onValueChange = jest.fn()

  beforeEach(() => {
    onValueChange.mockClear()
  })

  it("sets values of slider if passed in", () => {
    const sliderRef = React.createRef()

    const { rerender } = render(
      <CustomSlider
        ref={sliderRef}
        testid="slider"
        defaultValue={1}
        onValueChange={onValueChange}
      />
    )

    // initial state comes from defaultValue
    expect(sliderRef.current.state).toMatchObject({
      inputValues: 1,
      sliderValue: 1,
      value: 1
    })

    rerender(
      <CustomSlider
        ref={sliderRef}
        testid="slider"
        range
        values={[2, 5]}
        onValueChange={onValueChange}
      />
    )

    expect(sliderRef.current.state).toStrictEqual({
      inputValues: [2, 5],
      sliderValue: [2, 5],
      value: [2, 5]
    })
  })

  it("should update value on blur", () => {
    const { getByTestId } = render(
      <CustomSlider
        testid="slider"
        range={false}
        values={[2]}
        onValueChange={onValueChange}
      />
    )
    const input = getByTestId("slider-input")

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: "8" } })
    expect(input.value).toEqual("8")

    fireEvent.blur(input)
    expect(onValueChange).toHaveBeenCalledWith(8)
  })

  it("should update value on submit", () => {
    const { container, getByTestId } = render(
      <CustomSlider
        testid="slider"
        range={false}
        values={[2]}
        onValueChange={onValueChange}
      />
    )
    const form = container.querySelector(".input-wrap.end form")
    const input = getByTestId("slider-input")
    input.value = "5"

    fireEvent.submit(form)
    expect(onValueChange).toHaveBeenCalledWith(5)
  })

  it("should revert value on submit if gibberish", () => {
    const sliderRef = React.createRef()

    const { container, getByTestId } = render(
      <CustomSlider
        ref={sliderRef}
        testid="slider"
        range={false}
        values={[2]}
        onValueChange={onValueChange}
      />
    )

    // Seed internal value to 2 to represent an existing slider value
    sliderRef.current.setState({
      inputValues: 2,
      sliderValue: 2,
      value: 2
    })

    const form = container.querySelector(".input-wrap.end form")
    const input = getByTestId("slider-input")
    input.value = "asdfasdfadsf"

    fireEvent.submit(form)

    expect(onValueChange).toHaveBeenCalledWith(2)
  })

  it("should submit range for range slider", () => {
    const sliderRef = React.createRef()

    const { container } = render(
      <CustomSlider
        ref={sliderRef}
        testid="slider"
        range
        values={[2, 10]}
        onValueChange={onValueChange}
      />
    )

    // Seed internal value to the current range
    sliderRef.current.setState({
      inputValues: [2, 10],
      sliderValue: [2, 10],
      value: [2, 10]
    })

    const form = container.querySelector(".input-wrap.start form")
    const startInput = container.querySelector(".start-input")
    startInput.value = "5"

    fireEvent.submit(form)

    expect(onValueChange).toHaveBeenCalledWith([5, 10])
  })

  it("should flip values on submit", () => {
    const sliderRef = React.createRef()

    const { container } = render(
      <CustomSlider
        ref={sliderRef}
        testid="slider"
        range
        values={[2, 10]}
        onValueChange={onValueChange}
      />
    )

    // Seed internal value to the current range
    sliderRef.current.setState({
      inputValues: [2, 10],
      sliderValue: [2, 10],
      value: [2, 10]
    })

    const form = container.querySelector(".input-wrap.start form")
    const startInput = container.querySelector(".start-input")
    startInput.value = "100"

    fireEvent.submit(form)

    expect(onValueChange).toHaveBeenCalledWith([10, 100])
  })

  it("should show start input if range", () => {
    const { container } = render(
      <CustomSlider
        testid="slider"
        range
        values={[2, 10]}
        onValueChange={onValueChange}
      />
    )
    expect(container.querySelector(".input-wrap.start")).not.toBeNull()
  })

  it("should update slidervalue on slider drag", () => {
    const sliderRef = React.createRef()

    render(
      <CustomSlider
        ref={sliderRef}
        testid="slider"
        range={false}
        values={[2]}
        onValueChange={onValueChange}
      />
    )

    sliderRef.current.onSliderChange(7)

    expect(sliderRef.current.state.sliderValue).toEqual(7)
  })

  it("should update value on slider change", () => {
    const sliderRef = React.createRef()

    render(
      <CustomSlider
        ref={sliderRef}
        testid="slider"
        range={false}
        values={[2]}
        onValueChange={onValueChange}
      />
    )

    sliderRef.current.onSliderAfter(10)

    expect(onValueChange).toHaveBeenCalledWith(10)
  })
})
