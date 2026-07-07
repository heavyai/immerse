// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import VegaState, {
  Data,
  DataListenersMap,
  SignalListenersMap,
  SignalValuesMap
} from "./VegaState"

/**
 * A VegaChannel implements a way to update vega without causing react to
 * rerender. You can use the channel instead of passing signals, data, and
 * listeners directly to the Vega component.
 */
export default class VegaChannel {
  private dataListeners: DataListenersMap | undefined = undefined
  private signalListeners: SignalListenersMap | undefined = undefined
  private signalValues: SignalValuesMap | undefined = undefined
  private data: Data | undefined = undefined
  private states: VegaState[] = []

  attachState(state: VegaState) {
    this.states.push(state)
    if (this.dataListeners !== undefined) {
      state.setDataListeners(this.dataListeners)
    }
    if (this.signalListeners !== undefined) {
      state.setSignalListeners(this.signalListeners)
    }
    if (this.signalValues !== undefined) {
      state.setSignalValues(this.signalValues)
    }
    if (this.data !== undefined) {
      state.setData(this.data)
    }
  }

  detachState(state: VegaState) {
    this.states = this.states.filter((s) => s !== state)
  }

  setDataListeners(dataListeners: DataListenersMap) {
    this.dataListeners = dataListeners
    for (let i = 0; i < this.states.length; i++) {
      this.states[i].setDataListeners(dataListeners)
    }
  }

  setSignalListeners(signalListeners: SignalListenersMap) {
    this.signalListeners = signalListeners
    for (let i = 0; i < this.states.length; i++) {
      this.states[i].setSignalListeners(signalListeners)
    }
  }

  setSignalValues(signalValues: SignalValuesMap) {
    this.signalValues = signalValues
    for (let i = 0; i < this.states.length; i++) {
      this.states[i].setSignalValues(signalValues)
    }
  }

  setData(data: Data) {
    this.data = data
    for (let i = 0; i < this.states.length; i++) {
      this.states[i].setData(data)
    }
  }
}
