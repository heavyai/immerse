// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { mount, shallow } from "enzyme"
import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import chaiEnzyme from "chai-enzyme"

chai.use(spies)
chai.use(chaiEnzyme())

import HoverSelectorRow from "components/hover-selector/hover-selector-row"

describe("HoverSelectorRow Component", () => {
  let wrapper

  const props = {
    columnOption: { value: "followers", label: "followers" }
  }

  beforeEach(() => {
    props.getOptions = sinon.spy()
    wrapper = mount(<HoverSelectorRow {...props} />)
  })
})
