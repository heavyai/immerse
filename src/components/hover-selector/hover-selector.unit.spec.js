// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { HoverSelector } from "components/hover-selector/hover-selector"
import { render } from "@testing-library/react"

describe("HoverSelector Component", () => {
  const props = {
    allColumns: [
      { value: "followees", label: "followees" },
      { value: "followers", label: "followers" },
      { value: "join_time", label: "join_time" },
      { value: "tweet_text", label: "tweet_text" }
    ],
    selectedColumns: [
      { value: "followers", label: "followers" },
      { value: "tweet_text", label: "tweet_text" }
    ],
    addColumn: () => {},
    clearPopup: () => {},
    editColumn: () => {},
    options: [],
    changeSelectedColumns: () => {}
  }

  beforeEach(() => {
    render(<HoverSelector {...props} />)
  })

  // it("loads saved selectedColumn", () => {
  //   expect(wrapper.find(".hover-selector-value")).to.have.length(2)
  // })
  //
  // it("can remove a column", () => {
  //   wrapper.find(".hover-selector-value-close").first().simulate("click")
  //   expect(props.removeColumn).to.have.been.called
  // })
})
