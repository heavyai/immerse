// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Config,
  DataListenerHandler,
  Datum,
  SignalListenerHandler,
  Spec,
  View
} from "vega"
import { shallowEqualObjects } from "shallow-equal"

import vega from "services/vega"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { VEGA_LOG_LEVEL } = available_feature_flags

export type DataListenersMap = Record<
  string,
  DataListenerHandler | null | undefined
>
export type SignalListenersMap = Record<
  string,
  SignalListenerHandler | null | undefined
>
export type SignalValuesMap = Record<string, any>
export type Data = Record<string, Datum[]>
export type ViewAction = (view: View) => void

export default class {
  private promise: Promise<View>
  private prevDataListeners: DataListenersMap | null = null
  private nextDataListeners: DataListenersMap | null = null
  private prevSignalListeners: SignalListenersMap | null = null
  private nextSignalListeners: SignalListenersMap | null = null
  private prevSignalValues: SignalValuesMap | null = null
  private nextSignalValues: SignalValuesMap | null = null
  private prevData: Data | null = null
  private nextData: Data | null = null
  private needsRun = false
  private finalized = false
  private actionId = 0

  /**
   * Initialize
   * @param container The container to render vega in
   * @param spec The spec to render
   * @param config Vega config, optional
   */
  constructor(container: HTMLDivElement, spec: Spec, config?: Config) {
    const view = new vega.View(vega.parse(spec, config), {
      container,
      logLevel: getFeatureFlag(VEGA_LOG_LEVEL),
      renderer: "svg"
    })

    // this can be super useful for debugging
    ;(container as any).getVegaView = () => view

    this.promise = view.runAsync()
  }

  /**
   * Queues some action on the view
   * @param needsRun If true, runAsync() will be called on the view
   * @param action The action to run
   */
  private queue(needsRun: boolean, action: ViewAction) {
    if (this.finalized) {
      return
    }

    const actionId = ++this.actionId
    this.needsRun = this.needsRun || needsRun
    this.promise = this.promise.then((view) => {
      // perform the action
      try {
        action(view)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Vega error", err)
      }

      // if we need to run, and this is the last queued action, do it
      if (this.needsRun && actionId === this.actionId) {
        this.needsRun = false
        return view.runAsync()
      }

      return view
    })
  }

  /**
   * Update the vega dimensions.
   * @param width
   * @param height
   */
  setDimensions(width: number, height: number) {
    this.queue(true, (view) => {
      view.width(width)
      view.height(height)
    })
  }

  /**
   * Update data listeners
   * @param dataListeners A new map of data listeners
   */
  setDataListeners(dataListeners: DataListenersMap | null) {
    if (shallowEqualObjects(dataListeners, this.nextDataListeners)) {
      return
    }

    const alreadyQueued = this.nextDataListeners !== this.prevDataListeners
    this.nextDataListeners = dataListeners
    if (!alreadyQueued) {
      this.queue(false, (view) => {
        // remove any listeners that have changed or been removed
        if (this.prevDataListeners) {
          Object.entries(this.prevDataListeners).forEach(([name, handler]) => {
            if (
              handler &&
              (!this.nextDataListeners ||
                handler !== this.nextDataListeners[name])
            ) {
              try {
                view.removeDataListener(name, handler)
              } catch (err) {
                // This can happen transiently, so just log it
                // eslint-disable-next-line no-console
                console.warn("Could not remove data listener", err)
              }
            }
          })
        }

        // add new listeners
        if (this.nextDataListeners) {
          Object.entries(this.nextDataListeners).forEach(([name, handler]) => {
            if (
              handler &&
              (!this.prevDataListeners ||
                handler !== this.prevDataListeners[name])
            ) {
              try {
                view.addDataListener(name, handler)
              } catch (err) {
                // This can happen transiently, so just log it
                // eslint-disable-next-line no-console
                console.warn("Could not add data listener", err)
              }
            }
          })
        }

        this.prevDataListeners = this.nextDataListeners
      })
    }
  }

  /**
   * Update signal listeners
   * @param signalListeners A new map of signal listeners
   */
  setSignalListeners(signalListeners: SignalListenersMap | null) {
    if (shallowEqualObjects(signalListeners, this.nextSignalListeners)) {
      return
    }

    const alreadyQueued = this.nextSignalListeners !== this.prevSignalListeners
    this.nextSignalListeners = signalListeners
    if (!alreadyQueued) {
      this.queue(false, (view) => {
        // remove any listeners that have changed or been removed
        if (this.prevSignalListeners) {
          Object.entries(this.prevSignalListeners).forEach(
            ([name, handler]) => {
              if (
                handler &&
                (!this.nextSignalListeners ||
                  handler !== this.nextSignalListeners[name])
              ) {
                try {
                  view.removeSignalListener(name, handler)
                } catch (err) {
                  // This can happen transiently, so just log it
                  // eslint-disable-next-line no-console
                  console.warn("Could not remove signal listener", err)
                }
              }
            }
          )
        }

        // add new listeners
        if (this.nextSignalListeners) {
          Object.entries(this.nextSignalListeners).forEach(
            ([name, handler]) => {
              if (
                handler &&
                (!this.prevSignalListeners ||
                  handler !== this.prevSignalListeners[name])
              ) {
                try {
                  view.addSignalListener(name, handler)
                } catch (err) {
                  // This can happen transiently, so just log it
                  // eslint-disable-next-line no-console
                  console.warn("Could not add signal listener", err)
                }
              }
            }
          )
        }

        this.prevSignalListeners = this.nextSignalListeners
      })
    }
  }

  /**
   * Add a single signal listener - used by VegaLink
   * @param name Signal to listen to
   * @param handler The listener
   */
  addSignalListener(name: string, handler: SignalListenerHandler) {
    this.queue(false, (view) => {
      view.addSignalListener(name, handler)
    })
  }

  /**
   * Remove a single signal listener - used by VegaLink
   * @param name Signal to remove listener from
   * @param handler The listener to remove
   */
  removeSignalListener(name: string, handler: SignalListenerHandler) {
    this.queue(false, (view) => {
      view.removeSignalListener(name, handler)
    })
  }

  /**
   * Update signal values
   * @param signalValues A new map of signal values
   */
  setSignalValues(signalValues: SignalValuesMap) {
    if (shallowEqualObjects(signalValues, this.nextSignalValues)) {
      return
    }

    const alreadyQueued = this.nextSignalValues !== this.prevSignalValues
    this.nextSignalValues = signalValues
    if (!alreadyQueued) {
      this.queue(true, (view) => {
        if (this.nextSignalValues) {
          Object.entries(this.nextSignalValues).forEach(([name, value]) => {
            if (
              !this.prevSignalValues ||
              value !== this.prevSignalValues[name]
            ) {
              try {
                view.signal(name, value)
              } catch (e) {
                // eslint-disable-next-line no-console
                console.warn("Could not set signal value", name)
              }
            }
          })
        }

        this.prevSignalValues = this.nextSignalValues
      })
    }
  }

  /**
   * Update data.
   * @param data The new data
   */
  setData(data: Data) {
    if (shallowEqualObjects(data, this.nextData)) {
      return
    }

    const alreadyQueued = this.nextData !== this.prevData
    this.nextData = data
    if (!alreadyQueued) {
      this.queue(true, (view) => {
        if (this.nextData) {
          Object.entries(this.nextData).forEach(([name, values]) => {
            if (!this.prevData || values !== this.prevData[name]) {
              view.data(name, values)
            }
          })
        }

        this.prevData = this.nextData
      })
    }
  }

  /** Destroy the vega instance */
  destroy() {
    this.queue(false, (view) => {
      view.finalize()
    })
    this.finalized = true
    this.needsRun = false
  }
}
