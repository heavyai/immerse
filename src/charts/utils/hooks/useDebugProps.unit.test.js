// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */
import { renderHook } from "@testing-library/react-hooks"

import { useDebugProps } from "./useDebugProps"

/* eslint-disable react/display-name */

describe("useDeebugProps test suite", () => {
  it("can useDeebugProps", () => {
    const savedLog = console.log

    console.log = jest.fn()
    const initialProps = {
      props: { a: "b", c: [1, 2, 3] },
      id: "test-hook-id"
    }
    const { rerender } = renderHook(
      ({ props, id }) => useDebugProps(props, id),
      initialProps
    )

    rerender(initialProps)
    expect(console.log).not.toHaveBeenCalled()

    const newProps = {
      props: { a: "b", c: [1, 2, 3] },
      id: "test-hook-id"
    }
    rerender(newProps)

    expect(console.log).toHaveBeenCalledWith(
      "CHANGE ON test-hook-id IN c : ",
      initialProps.props.c,
      newProps.props.c
    )

    console.log = savedLog
  })
})
