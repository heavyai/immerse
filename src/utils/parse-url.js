// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { __, dropLast, reduce } from "ramda"

const protocolPorts = {
  http: "80",
  https: "443"
}

// if item ends in two forward slashes return everything before those slashes.
function toProtocol(result, item) {
  return /\/\/$/.test(item) ? dropLast("//".length, item) : result
}

// if item contains a period return everything.
function toHost(result, item) {
  return /\./.test(item) ? item : result
}

// if item starts with a colon, return everything after the colon.
function toPort(result, item) {
  return /^:/.test(item) ? item.slice(1) : result
}

function parseUrl(location) {
  return (server) => {
    const url = server.url
    // from start of string optionally capture all but forward slash followed by two forward slashes,
    // then capture all but colon, then optionally capture colon then numbers.
    const captures = url ? /^([^/]*\/\/)?([^:]*)(:[0-9]*)?/.exec(url) : []
    const reduceCaptures = reduce(__, "", captures)
    const rawProtocol =
      reduceCaptures(toProtocol) || server.protocol || location.protocol
    const protocol = /^([^:]*)/.exec(rawProtocol || "")[0]
    const host = reduceCaptures(toHost) || server.host || location.hostname
    const port =
      reduceCaptures(toPort) ||
      server.port ||
      location.port ||
      protocolPorts[protocol]
    return Object.assign({}, server, {
      protocol,
      host,
      port: typeof port === "undefined" ? port : parseInt(port, 10)
    })
  }
}

export default parseUrl
