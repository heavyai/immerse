// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  CSSProperties,
  ForwardRefRenderFunction,
  MutableRefObject,
  RefCallback,
  forwardRef,
  useEffect,
  useRef,
  useState
} from "react"
import { Config, Spec } from "vega"

import VegaState, {
  Data,
  DataListenersMap,
  SignalListenersMap,
  SignalValuesMap
} from "./VegaState"
import VegaChannel from "./VegaChannel"
import VegaLink from "./VegaLink"

export type Props = {
  /** Vega spec */
  spec: Spec

  /** Vega config, optional */
  config?: Config

  /** Data */
  data?: Data

  /** Data listeners, optional */
  dataListeners?: DataListenersMap

  /** Signal listeners, optional */
  signalListeners?: SignalListenersMap

  /** Signal values, optional */
  signalValues?: SignalValuesMap

  /** A vega "channel" - see VegaChannel.ts */
  channel?: VegaChannel

  /** Links provide listeners for single signals */
  links?: VegaLink[]

  /** Optional class name for the surrounding div */
  className?: string

  /** Optional style attributes */
  style?: CSSProperties

  /** Width of the chart */
  width?: number

  /** Height of the chart */
  height?: number
}

/**
 * A ref may either be a function, or, the newer style: an object with a
 * "current" property.
 * @returns true if the ref is a function
 */
function isRefCallback<T>(r: any): r is RefCallback<T> {
  return typeof r === "function"
}

/**
 * We want to use a ref inside our component, but we also want to expose it
 * using forwardRef. We can't just use the ref provided by forwardRef because if
 * the caller doesn't supply a ref, it'll be undefined. This little utility
 * function keeps the two refs in-sync.
 */
function useForwardedRef<T>(
  forwardedRef: RefCallback<T | null> | MutableRefObject<T | null> | null
): MutableRefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (forwardedRef) {
      if (isRefCallback(forwardedRef)) {
        forwardedRef(ref.current)
      } else {
        forwardedRef.current = ref.current
      }
    }
  }, [forwardedRef])

  return ref
}

const Vega: ForwardRefRenderFunction<HTMLDivElement, Props> = (
  {
    spec,
    config,
    data = null,
    dataListeners = null,
    signalListeners = null,
    signalValues = null,
    channel = null,
    links = null,
    className,
    style,
    width,
    height
  },
  ref
) => {
  const containerRef = useForwardedRef<HTMLDivElement>(ref)
  const [vegaState, setVegaState] = useState<VegaState | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      const newState = new VegaState(containerRef.current, spec, config)
      setVegaState(newState)

      return () => {
        newState.destroy()
      }
    }
    return undefined
  }, [containerRef, spec, config])

  useEffect(() => {
    if (vegaState && width && height) {
      vegaState.setDimensions(width, height)
    }
  }, [vegaState, width, height])

  useEffect(() => {
    if (vegaState) {
      vegaState.setDataListeners(dataListeners)
    }
  }, [vegaState, dataListeners])

  useEffect(() => {
    if (vegaState) {
      vegaState.setSignalListeners(signalListeners)
    }
  }, [vegaState, signalListeners])

  useEffect(() => {
    if (vegaState && signalValues) {
      vegaState.setSignalValues(signalValues)
    }
  }, [vegaState, signalValues])

  useEffect(() => {
    if (vegaState && channel) {
      channel.attachState(vegaState)

      return () => channel.detachState(vegaState)
    }
    return undefined
  }, [vegaState, channel])

  useEffect(() => {
    if (vegaState && links) {
      links.forEach((l) => l.attachState(vegaState))

      return () => links.forEach((l) => l.detachState())
    }
    return undefined
  }, [vegaState, links])

  useEffect(() => {
    if (vegaState && data) {
      vegaState.setData(data)
    }
  }, [vegaState, data])

  return <div ref={containerRef} className={className} style={style} />
}

export default React.memo(forwardRef(Vega))
