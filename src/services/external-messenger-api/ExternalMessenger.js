// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import {
  setUsingExternalListeners,
  setValidOrigins,
  isValidOrigin
} from "./usingExternalListeners"

// define our api. a key value mapping of call type -> function.
const api = {}

export function registerAPIMessages(endpoints = {}) {
  Object.entries(endpoints).forEach(([type, func]) => {
    if (api[type] !== undefined) {
      throw new Error(`Cannot re-register API endpoint : ${type}`)
    }
    api[type] = func
  })
}

export const exposedAPISchema = {}

export function registerExposedAPISchema(type, { input = {}, output = {} }) {
  if (exposedAPISchema[type] !== undefined) {
    throw new Error(`Cannot re-register API endpoint : ${type}`)
  }

  exposedAPISchema[type] = { input, output }
}

// the postMessage handler is given the event that generated the API call, as well
// as the handler to call for the response.
//
// it passes the event's data and a responseHandler
// If the API point needs to respond multiple times, it can call the responseHandler with the
// json blob as much as it wants. Otherwise, the API can just return the JSON blob and the
// responseHandler will be automatically invoked.

const getResponseHandler = (e) => {
  return (response) => {
    if (response) {
      Promise.resolve(response).then((r) => {
        const messageResponse = { ...r, responseKey: e.data.responseKey }
        if (getFeatureFlag(available_feature_flags.EMBEDDED_API_LOGGING)) {
          // eslint-disable-next-line
          console.log("OUTGOING IMMERSE IFRAME MESSAGE", messageResponse)
        }
        return e?.source?.postMessage(messageResponse, e.origin)
      })
    }
  }
}

const postMessageHandler = (e, handler) => {
  const responseHandler = getResponseHandler(e)
  const res = handler(e.data, responseHandler)
  responseHandler(res)
}

// createExternalListeners is called up in actions/connection-action-creators, for wont of a better location.
// We can easily move it somewhere else if there's a better location - it just needs to be after the servers.json
// file is parsed and loaded.
//
// the user is REQUIRED to set an event_origins array in their servers.json file that lists the valid URLs that
// immerse will accept API calls from. If that array is empty, then we won't expose any external API.
//
// from there it's easy - we accept messages sent in via postMessage. The expectation is that they'll look like redux
// actions - { type : API_KEY, payload : {...} } payload is optional, depending upon the function called.
//
// The listener confirms that the posted message is from a valid origin, and then hands it of to the API call.
// That's it. See the examples in the api folder for more specifics.

export function createExternalListeners(origins = []) {
  // if we're running in YOLO mode, accept any api hits from anywhere.
  // DO NOT RUN IN YOLO MODE.
  setValidOrigins(origins)

  if (
    !getFeatureFlag(available_feature_flags.EMBEDDED_API_SECURITY) ||
    origins.length
  ) {
    setUsingExternalListeners(true)

    const validEventOrigin = !getFeatureFlag(
      available_feature_flags.EMBEDDED_API_SECURITY
    )
      ? () => true
      : isValidOrigin

    window.addEventListener("message", (e) => {
      if (validEventOrigin(e.origin) && api[e.data.type]) {
        if (getFeatureFlag(available_feature_flags.EMBEDDED_API_LOGGING)) {
          // eslint-disable-next-line
          console.log("OUTGOING IMMERSE IFRAME MESSAGE", e.data)
        }
        postMessageHandler(e, api[e.data.type])
      }
    })
  }
}
