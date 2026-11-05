// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { StrictMode, useEffect } from "react"
import { act } from "@testing-library/react"
import { mountApplication } from "runtime/mount-application"
import HeavyServicesProvider from "./heavy-services-provider"
import connectToMapDServices from "utils/connect-to-mapd-services"

it("cleans effects on repeated root mounts and supplies the current services context", () => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  let active = 0
  const services = new Map([["label", "First"]])
  const Child = connectToMapDServices(({ MapD }) => {
    useEffect(() => {
      active += 1
      return () => {
        active -= 1
      }
    }, [])
    return <span>{MapD.get("label")}</span>
  })
  for (let iteration = 0; iteration < 2; iteration += 1) {
    let unmount = null
    act(() => {
      unmount = mountApplication(
        container,
        <StrictMode>
          <HeavyServicesProvider services={services}>
            <Child />
          </HeavyServicesProvider>
        </StrictMode>
      )
    })
    expect(container.textContent).toBe("First")
    expect(active).toBe(1)
    act(() => unmount())
    expect(active).toBe(0)
  }
  container.remove()
})
