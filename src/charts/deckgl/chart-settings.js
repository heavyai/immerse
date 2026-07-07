// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import DeckGLBaseSettings from "./deckgl-base-settings"
import DeckGLPointmapSettings from "./deckgl-pointmap-settings"
import DeckGLLinemapSettings from "./deckgl-linemap-settings"
import DeckGLGeoheatSettings from "./deckgl-geoheat-settings"
import DeckGLChoroplethSettings from "./deckgl-choropleth-settings"

const DeckGLSettings = (props) => {
  const { currentLayer, type } = props.chart
  if (currentLayer === "master") {
    return <DeckGLBaseSettings chartId={props.id} />
  } else if (type === "deckgl" || type === "deckgl-pointmap") {
    return <DeckGLPointmapSettings />
  } else if (type === "deckgl-linemap") {
    return <DeckGLLinemapSettings />
  } else if (type === "deckgl-geoheat") {
    return <DeckGLGeoheatSettings />
  } else if (type === "deckgl-choropleth") {
    return <DeckGLChoroplethSettings />
  }
  return <div />
}

export default DeckGLSettings
