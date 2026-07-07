// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SignalListenerHandler } from "vega"

import VegaState from "./VegaState"

/**
 * A VegaLink allows you to connect a listener to a single signal
 */
export default class VegaLink {
  private state: VegaState | null = null
  private handler: SignalListenerHandler | null = null
  private signal: string

  /** @param signal The signal to listen to */
  constructor(signal: string) {
    this.signal = signal
  }

  /** Attach a VegaState to the Link */
  attachState(state: VegaState) {
    if (this.state) {
      this.detachState()
    }

    this.state = state
    this.connectListener()
  }

  /** Detach the VegaState */
  detachState() {
    this.removeListener()
    this.state = null
  }

  /**
   * Set a listener
   * @param handler The listener that will be called when the signal changes
   */
  setListener(handler: SignalListenerHandler) {
    this.removeListener()
    this.handler = handler
    this.connectListener()
  }

  /** Private function to connect the listener */
  private connectListener() {
    if (this.state && this.signal && this.handler) {
      this.state.addSignalListener(this.signal, this.handler)
    }
  }

  /** Remove the listener */
  removeListener() {
    if (this.state && this.signal && this.handler) {
      this.state.removeSignalListener(this.signal, this.handler)
    }
  }
}
