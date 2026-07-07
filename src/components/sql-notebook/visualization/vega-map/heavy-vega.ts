// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

interface IHeavyVegaAPI {
  width: (w: number) => IHeavyVegaAPI
  height: (h: number) => IHeavyVegaAPI
  viewRenderOptions: () => IHeavyVegaAPI
  mark: (type: string, d: any, properties: any, transform: any) => IHeavyVegaAPI
  projection: (name: string, type: string, bounds: any) => IHeavyVegaAPI
  data: (d: any | any[]) => IHeavyVegaAPI
  scale: (s: any | any[]) => IHeavyVegaAPI
  toSpec: () => any // TODO: Use vega or vega lite types?
}
export const HeavyVega: () => IHeavyVegaAPI = () => {
  // Type out spec
  const spec: any = {}
  let api: IHeavyVegaAPI = {} as IHeavyVegaAPI

  function width(w: number) {
    spec.width = w
    return api
  }
  function height(h: number) {
    spec.height = h
    return api
  }
  function viewRenderOptions() {
    spec.viewRenderOptions = { premultipliedAlpha: false }
    return api
  }
  function mark(type: string, d: any, properties: any, transform: any) {
    if (!spec.marks) {
      spec.marks = []
    }
    spec.marks.push({
      type,
      from: { data: d },
      properties,
      transform
    })
    return api
  }
  function projection(name: string, type: string, bounds: number[]) {
    if (!spec.projections) {
      spec.projections = []
    }
    spec.projections.push({
      name,
      type,
      bounds
    })
    return api
  }
  function data(d: any) {
    if (!d) {
      return api
    }
    if (!spec.data) {
      spec.data = []
    }
    if (Array.isArray(d)) {
      spec.data.push(...d)
    } else {
      spec.data.push(d)
    }
    return api
  }
  function scale(s: any) {
    if (!s) {
      return api
    }
    if (!spec.scales) {
      spec.scales = []
    }
    if (Array.isArray(s)) {
      spec.scales.push(...s)
    } else {
      spec.scales.push(s)
    }
    return api
  }
  function toSpec() {
    return spec
  }

  api = {
    width,
    height,
    viewRenderOptions,
    mark,
    projection,
    data,
    scale,
    toSpec
  }

  return api
}
