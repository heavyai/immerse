// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { mount } from "enzyme"

import LoginPanel from "./login-panel"

describe("Login Component", () => {
  let wrapper = null

  const props = {
    error: false,
    handleConnect: jest.fn(),
    user: {
      username: "jim",
      password: "jim",
      port: "9002",
      host: "kali.heavyai.com",
      protocol: "http",
      database: "heavyai"
    },
    shouldDisableDatabase: false,
    titleName: "test-login-title"
  }

  beforeEach(() => {
    wrapper = mount(<LoginPanel {...props} />)
  })

  it("should setState based on user proptypes", () => {
    expect(wrapper.state().userInputs).toStrictEqual(props.user)
  })

  it("should update state based on updated props", () => {
    const newInput = {
      user: {
        username: "jimsteve",
        password: "jimsteve",
        port: "9020",
        host: "kali.heavyai.com",
        protocol: "http",
        database: "heavyai"
      }
    }

    wrapper.setProps(newInput)

    expect(wrapper.state().userInputs).toStrictEqual(newInput.user)
  })
})
