// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Table as ArrowTable } from "apache-arrow"
import type { DeckGLLayerQuerySpec } from "./query-spec"

export type DeckGLData = {
  data: ArrowTable
  cardinality: number
  loading: boolean
  error?: Error
}

export class LayerEvent extends Event {
  readonly layerIndex: number

  constructor(type: string, layerIndex: number) {
    super(type)
    this.layerIndex = layerIndex
  }
}

export class ErrorEvent extends LayerEvent {
  readonly message: string

  constructor(layerIndex: number, message: string) {
    super("error", layerIndex)
    this.message = message
  }
}

export class DataEvent extends LayerEvent {
  readonly data: any[]
  readonly type: DeckGLLayerQuerySpec["type"]

  constructor(
    layerIndex: number,
    data: any[],
    type: DeckGLLayerQuerySpec["type"]
  ) {
    super("data", layerIndex)
    this.data = data
    this.type = type
  }
}

type LayerEventListener = (ev: LayerEvent) => void
type ErrorEventListener = (ev: ErrorEvent) => void
type DataEventListener = (ev: DataEvent) => void

interface EventMap {
  loading: LayerEventListener
  error: ErrorEventListener
  data: DataEventListener
  nodata: LayerEventListener
}

interface IDataEventTarget extends EventTarget {
  addEventListener<K extends keyof EventMap>(
    type: K,
    listener: null | EventMap[K] | { handleEvent: EventMap[K] },
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener<K extends keyof EventMap>(
    type: K,
    listener: null | EventMap[K] | { handleEvent: EventMap[K] },
    options?: boolean | EventListenerOptions
  ): void
}

const TypedEventTarget = EventTarget as {
  new (): IDataEventTarget
  prototype: IDataEventTarget
}

class DataEventTarget extends TypedEventTarget {
  loading(layerIndex: number) {
    this.dispatchEvent(new LayerEvent("loading", layerIndex))
  }

  error(layerIndex: number, message: string) {
    this.dispatchEvent(new ErrorEvent(layerIndex, message))
  }

  data(layerIndex: number, data: any[], type: DeckGLLayerQuerySpec["type"]) {
    this.dispatchEvent(new DataEvent(layerIndex, data, type))
  }

  nodata(layerIndex: number) {
    this.dispatchEvent(new LayerEvent("nodata", layerIndex))
  }
}

export default DataEventTarget
