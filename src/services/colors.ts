// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import vega from "services/vega"
import { map } from "ramda"

import APP_CONFIG from "constants/app-config"
import { simulateColorBlindness } from "utils/color-blindness"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import {
  SimpleColorPalette,
  NestedColorPalette
} from "components/ui-config-panel/types"
import { DEFAULT_OTHER_DOMAIN } from "constants/colors"

const { COLOR_BLIND } = available_feature_flags

const COLOR_SERVICE_PREFIX = APP_CONFIG.COLOR_SERVICE_PREFIX || "immerse"

/**
 * The goal is, if possible, to discontinue using the colors service and start
 * getting this information from redux. We're now storing color palette
 * information in redux in the `userConfigurableUI` object. If possible, please
 * reference `src/reducers/user-configurable-ui-reducer.ts`
 */

function colorsToVega(colors) {
  const keys = Object.keys(colors)
  const blueIdx = keys.indexOf("blue")
  if (blueIdx >= 0) {
    // For some historical reason, blue is
    // always moved to the front of the list
    keys.splice(blueIdx, 1)
    keys.unshift("blue")
  }
  return keys.map((k) => colors[k][0])
}

export const HEAVYAI_SOLID_COLORS = {
  red: ["#ea5545"],
  pink: ["#f46a9b"],
  orange: ["#ef9b20"],
  yellow: ["#ede15b"],
  lime: ["#bdcf32"],
  green: ["#87bc45"],
  blue: ["#27aeef"],
  purple: ["#b33dc6"],
  magenta: ["#C10E66"],
  brown: ["#733700"]
}
vega.scheme(
  `${COLOR_SERVICE_PREFIX}-solid-colors`,
  colorsToVega(HEAVYAI_SOLID_COLORS)
)

export const HEAVY_SOLID_TERRAIN_COLORS = {
  black: ["#000000"],
  red: ["#ea5545"],
  pink: ["#f46a9b"],
  orange: ["#ef9b20"],
  yellow: ["#ede15b"],
  green: ["#87bc45"],
  blue: ["#27aeef"],
  purple: ["#b33dc6"],
  magenta: ["#C10E66"],
  brown: ["#733700"]
}

export const HEAVYAI_CUSTOM_COLORS = {
  red: ["#ea5545"],
  lime: ["#bdcf32"],
  purple: ["#b33dc6"],
  orange: ["#ef9b20"],
  green: ["#87bc45"],
  pink: ["#f46a9b"],
  silver: ["#ace5c7"],
  yellow: ["#ede15b"],
  purpleCool: ["#836dc5"],
  greenPastel: ["#86d87f"],
  blue: ["#27aeef"]
}
vega.scheme(
  `${COLOR_SERVICE_PREFIX}-custom-colors`,
  colorsToVega(HEAVYAI_CUSTOM_COLORS)
)

export const HEAVYAI_ORDINAL_COLORS = {
  blueRed: ["#ea5545", "#27aeef"],
  gauge: ["#ea5545", "#ede15b", "#87bc45"],
  mapD: ["#22A7F0", "#3ad6cd", "#d4e666"],
  alternate: ["#27aeef", "#edbf33", "#87bc45", "#ede15b"],
  rainbow: [
    "#ea5545",
    "#f46a9b",
    "#ef9b20",
    "#edbf33",
    "#ede15b",
    "#bdcf32",
    "#87bc45",
    "#27aeef",
    "#937BD9",
    "#b33dc6"
  ],
  Paired: [
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6"
  ],
  Pastel2: [
    "#fbb4ae",
    "#b3cde3",
    "#ccebc5",
    "#decbe4",
    "#fed9a6",
    "#ffffcc",
    "#e5d8bd",
    "#fddaec",
    "#f2f2f2"
  ],
  Set1: [
    "#e41a1c",
    "#377eb8",
    "#4daf4a",
    "#984ea3",
    "#ff7f00",
    "#ffff33",
    "#a65628",
    "#f781bf",
    "#999999"
  ],
  Set3: [
    "#8dd3c7",
    "#ffffb3",
    "#bebada",
    "#fb8072",
    "#80b1d3",
    "#fdb462",
    "#b3de69",
    "#fccde5",
    "#d9d9d9"
  ],
  Set2: [
    "#ea5545",
    "#bdcf32",
    "#b33dc6",
    "#ef9b20",
    "#87bc45",
    "#f46a9b",
    "#ace5c7",
    "#ede15b",
    "#836dc5",
    "#86d87f",
    "#27aeef"
  ],
  Color14: [
    "#FF2727",
    "#FF6F32",
    "#FFAF14",
    "#EBE35A",
    "#EBE35A",
    "#BCCF34",
    "#5CBFAF",
    "#28AEF0",
    "#937BD9",
    "#CA51E0",
    "#FF00A8",
    "#C10E66",
    "#733700",
    "#216423",
    "#0B5489"
  ],
  Color28: [
    "#FF2727",
    "#FF6F32",
    "#FFAF14",
    "#EBE35A",
    "#EBE35A",
    "#BCCF34",
    "#5CBFAF",
    "#28AEF0",
    "#937BD9",
    "#CA51E0",
    "#FF00A8",
    "#C10E66",
    "#733700",
    "#216423",
    "#0B5489",
    "#FFA4A4",
    "#FFBB9E",
    "#FFE2AB",
    "#FFFDD9",
    "#EAF0B9",
    "#B2EFE5",
    "#BAE1F4",
    "#D2C6F4",
    "#E1BEE8",
    "#F3ADDB",
    "#E08EB6",
    "#B29072",
    "#859C86",
    "#7595AC"
  ]
}
Object.keys(HEAVYAI_ORDINAL_COLORS).forEach((key) => {
  vega.scheme(
    `${COLOR_SERVICE_PREFIX}-${key}-colors`,
    HEAVYAI_ORDINAL_COLORS[key]
  )
})

export const HEAVYAI_QUANTITATIVE_COLORS = {
  mapDScale: [
    "#115f9a",
    "#1984c5",
    "#22a7f0",
    "#48b5c4",
    "#76c68f",
    "#a6d75b",
    "#c9e52f",
    "#d0ee11",
    "#d0f400"
  ],
  blueScale: [
    "#e2e2e2",
    "#c5dae5",
    "#a2d0e8",
    "#7ec6ec",
    "#5abbef",
    "#3eb3f0",
    "#22a7f0",
    "#1984c5",
    "#115f9a"
  ],
  heatScale: [
    "#1984c5",
    "#22a7f0",
    "#63bff0",
    "#a7d5ed",
    "#e2e2e2",
    "#e1a692",
    "#de6e56",
    "#e14b31",
    "#c23728"
  ],
  profitScale: [
    "#4d904f",
    "#5aa651",
    "#89bc55",
    "#bfd359",
    "#ede15b",
    "#edb34e",
    "#ec7c3f",
    "#e14b31",
    "#c23728"
  ],
  Greens: [
    "#f7fcfd",
    "#e5f5f9",
    "#ccece6",
    "#99d8c9",
    "#66c2a4",
    "#41ae76",
    "#238b45",
    "#006d2c",
    "#00441b"
  ],
  BuPu: [
    "#f7fcfd",
    "#e0ecf4",
    "#bfd3e6",
    "#9ebcda",
    "#8c96c6",
    "#8c6bb1",
    "#88419d",
    "#810f7c",
    "#4d004b"
  ],
  GnBu: [
    "#f7fcf0",
    "#e0f3db",
    "#ccebc5",
    "#a8ddb5",
    "#7bccc4",
    "#4eb3d3",
    "#2b8cbe",
    "#0868ac",
    "#084081"
  ],
  YlOrBr: [
    "#fff7ec",
    "#fee8c8",
    "#fdd49e",
    "#fdbb84",
    "#fc8d59",
    "#ef6548",
    "#d7301f",
    "#b30000",
    "#7f0000"
  ],
  Blues: [
    "#fff7fb",
    "#ece7f2",
    "#d0d1e6",
    "#a6bddb",
    "#74a9cf",
    "#3690c0",
    "#0570b0",
    "#045a8d",
    "#023858"
  ],
  PuBuGn: [
    "#fff7fb",
    "#ece2f0",
    "#d0d1e6",
    "#a6bddb",
    "#67a9cf",
    "#3690c0",
    "#02818a",
    "#016c59",
    "#014636"
  ],
  PuRd: [
    "#f7f4f9",
    "#e7e1ef",
    "#d4b9da",
    "#c994c7",
    "#df65b0",
    "#e7298a",
    "#ce1256",
    "#980043",
    "#67001f"
  ],
  Purples: [
    "#fff7f3",
    "#fde0dd",
    "#fcc5c0",
    "#fa9fb5",
    "#f768a1",
    "#dd3497",
    "#ae017e",
    "#7a0177",
    "#49006a"
  ],
  YlGn: [
    "#ffffe5",
    "#f7fcb9",
    "#d9f0a3",
    "#addd8e",
    "#78c679",
    "#41ab5d",
    "#238443",
    "#006837",
    "#004529"
  ],
  YlGnBu: [
    "#ffffd9",
    "#edf8b1",
    "#c7e9b4",
    "#7fcdbb",
    "#41b6c4",
    "#1d91c0",
    "#225ea8",
    "#253494",
    "#081d58"
  ],
  Oranges: [
    "#ffffe5",
    "#fff7bc",
    "#fee391",
    "#fec44f",
    "#fe9929",
    "#ec7014",
    "#cc4c02",
    "#993404",
    "#662506"
  ],
  YlOrRd: [
    "#ffffcc",
    "#ffeda0",
    "#fed976",
    "#feb24c",
    "#fd8d3c",
    "#fc4e2a",
    "#e31a1c",
    "#bd0026",
    "#800026"
  ],
  BrBG: [
    "#8c510a",
    "#bf812d",
    "#dfc27d",
    "#f6e8c3",
    "#f5f5f5",
    "#c7eae5",
    "#80cdc1",
    "#35978f",
    "#01665e"
  ],
  PiYG: [
    "#c51b7d",
    "#de77ae",
    "#f1b6da",
    "#fde0ef",
    "#f7f7f7",
    "#e6f5d0",
    "#b8e186",
    "#7fbc41",
    "#4d9221"
  ],
  PRGn: [
    "#762a83",
    "#9970ab",
    "#c2a5cf",
    "#e7d4e8",
    "#f7f7f7",
    "#d9f0d3",
    "#a6dba0",
    "#5aae61",
    "#1b7837"
  ],
  PuOr: [
    "#b35806",
    "#e08214",
    "#fdb863",
    "#fee0b6",
    "#f7f7f7",
    "#d8daeb",
    "#b2abd2",
    "#8073ac",
    "#542788"
  ],
  RdBu: [
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#f7f7f7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac"
  ],
  RdGy: [
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#ffffff",
    "#e0e0e0",
    "#bababa",
    "#878787",
    "#4d4d4d"
  ],
  RdYiBu: [
    "#d73027",
    "#f46d43",
    "#fdae61",
    "#fee090",
    "#ffffbf",
    "#e0f3f8",
    "#abd9e9",
    "#74add1",
    "#4575b4"
  ],
  RdYlGn: [
    "#d73027",
    "#f46d43",
    "#fdae61",
    "#fee08b",
    "#ffffbf",
    "#d9ef8b",
    "#a6d96a",
    "#66bd63",
    "#1a9850"
  ],
  Spectral: [
    "#d53e4f",
    "#f46d43",
    "#fdae61",
    "#fee08b",
    "#ffffbf",
    "#e6f598",
    "#abdda4",
    "#66c2a5",
    "#3288bd"
  ],
  Viridis: ["#8D17A9", "#4567C6", "#218C8D", "#64CB5D", "#FDE724"],
  Plasma: [
    "#0d0887",
    "#4c02a1",
    "#7e03a8",
    "#aa2395",
    "#cc4778",
    "#e66c5c",
    "#f89540",
    "#fdc527",
    "#f0f921"
  ],
  Turbo: [
    "#23171b",
    "#4569ee",
    "#26bce1",
    "#3ff393",
    "#95fb51",
    "#ecd12e",
    "#ff821d",
    "#cb2f0d",
    "#900c00"
  ]
}
Object.keys(HEAVYAI_QUANTITATIVE_COLORS).forEach((key) => {
  vega.scheme(
    `${COLOR_SERVICE_PREFIX}-${key}-colors`,
    HEAVYAI_QUANTITATIVE_COLORS[key]
  )
})

// Not an entire color palette per se, but a color palette extension used for
// TopN colors in Vega Combo
export const HEAVYAI_TOPN_COLORS = {
  allOthers: "#888888",
  disabled: "#aaaaaa"
}

export const ALL_OTHERS_LABEL = "All Others"

vega.scheme(
  `${COLOR_SERVICE_PREFIX}-topn-colors`,
  colorsToVega(HEAVYAI_TOPN_COLORS)
)

export const CUSTOM_COLORS = "CUSTOM_COLORS"
export const SOLID_COLORS = "SOLID_COLORS"
export const ORDINAL_COLORS = "ORDINAL_COLORS"
export const QUANTITATIVE_COLORS = "QUANTITATIVE_COLORS"
export const MEASURE_DEFAULT_COLORS = "MEASURE_DEFAULT_COLORS"
export const CHARTS_DEFAULT_COLORS = "CHARTS_DEFAULT_COLORS"
export const TOPN_COLORS = "TOPN_COLORS"
export const CS_TERRAIN_COLORS = "CS_TERRAIN_COLORS"

export const HEAVYAI_MEASURE_DEFAULT_COLORS = () => {
  const ordinalColors = getColors(ORDINAL_COLORS)
  const ordinalDefault = ordinalColors.mapD || Object.values(ordinalColors)[0]

  const quantitativeColors = getColors(QUANTITATIVE_COLORS)
  const quantitativeDefault =
    quantitativeColors.mapDScale || Object.values(quantitativeColors)[0]

  return {
    ordinal: {
      type: "ordinal",
      key: "mapD",
      val: ordinalDefault
    },
    quantitative: {
      type: "quantitative",
      key: "mapDScale",
      val: quantitativeDefault
    },
    solid: { type: "solid", key: "blue", val: getColors(SOLID_COLORS).blue },
    terrain: {
      type: "solid",
      key: "black",
      val: getColors(CS_TERRAIN_COLORS).black
    }
  }
}

const chartDefaultColors = {}

export function addChartDefaultColors(chartType, defaultColors) {
  chartDefaultColors[chartType] = defaultColors
}

export const HEAVYAI_CHARTS_DEFAULT_COLORS = () => {
  const solidColors = getColors(SOLID_COLORS)
  const solidBlue = solidColors.blue || Object.values(solidColors)[0]

  const customColors = getColors(CUSTOM_COLORS)

  const quantitativeColors = getColors(QUANTITATIVE_COLORS)
  const quantitativeDefault =
    quantitativeColors.mapDScale || Object.values(quantitativeColors)[0]

  return {
    ...chartDefaultColors,
    custom: {
      type: "custom",
      isCustom: true,
      customKey: "key0",
      customDomain: [],
      customRange: [],
      customPalette: customColors,
      defaultOtherDomain: DEFAULT_OTHER_DOMAIN,
      defaultOtherRange: HEAVYAI_TOPN_COLORS.allOthers
    },
    default: { type: "solid", key: "blue", val: solidBlue },
    defaultQuantitative: {
      type: "quantitative",
      key: "mapDScale",
      val: quantitativeDefault
    }
  }
}

const colorMap = {
  [CUSTOM_COLORS]: HEAVYAI_CUSTOM_COLORS,
  [SOLID_COLORS]: HEAVYAI_SOLID_COLORS,
  [ORDINAL_COLORS]: HEAVYAI_ORDINAL_COLORS,
  [QUANTITATIVE_COLORS]: HEAVYAI_QUANTITATIVE_COLORS,
  [MEASURE_DEFAULT_COLORS]: HEAVYAI_MEASURE_DEFAULT_COLORS,
  [CHARTS_DEFAULT_COLORS]: HEAVYAI_CHARTS_DEFAULT_COLORS,
  [TOPN_COLORS]: HEAVYAI_TOPN_COLORS,
  [CS_TERRAIN_COLORS]: HEAVY_SOLID_TERRAIN_COLORS
}

const deepMapArrays = (fn, object) =>
  map((value) => {
    if (Array.isArray(value)) {
      return fn(value)
    } else if (typeof value === "object") {
      return deepMapArrays(fn, value)
    } else {
      return value
    }
  }, object)

export type OmniColorScheme =
  | typeof CUSTOM_COLORS
  | typeof SOLID_COLORS
  | typeof ORDINAL_COLORS
  | typeof QUANTITATIVE_COLORS
  | typeof MEASURE_DEFAULT_COLORS
  | typeof CHARTS_DEFAULT_COLORS
  | typeof TOPN_COLORS
  | typeof CS_TERRAIN_COLORS

/**
 * Please don't use this, and instead get your colors data from Redux
 * (`store.userConfigurableUI`). See the `user-configurable-ui` reducer for more
 * info
 * */
export function getColors(key: OmniColorScheme): Record<string, string[]> {
  const colorObj =
    typeof colorMap[key] === "function"
      ? (colorMap[key] as Function)()
      : colorMap[key]

  switch (getFeatureFlag(COLOR_BLIND)) {
    case "protanopia":
      return deepMapArrays(
        (colors) =>
          colors.map((color) => simulateColorBlindness(color, "protanopia")),
        colorObj
      )
    case "deuteranopia":
      return deepMapArrays(
        (colors) =>
          colors.map((color) => simulateColorBlindness(color, "deuteranopia")),
        colorObj
      )
    case "tritanopia":
      return deepMapArrays(
        (colors) =>
          colors.map((color) => simulateColorBlindness(color, "tritanopia")),
        colorObj
      )
    default:
      return colorObj
  }
}

function setColors(key: OmniColorScheme, val: string[][]) {
  const keys = Object.keys(colorMap[key])
  colorMap[key] = val.reduce((colors, v, i) => {
    const updateKey = keys[i] ? keys[i] : `custom_color_${i}`
    colors[updateKey] = v
    return colors
  }, {})
}

export interface OmniColorSchemes {
  custom?: SimpleColorPalette
  solid?: SimpleColorPalette
  ordinal?: NestedColorPalette
  quantitative?: NestedColorPalette
}

export function applyColors(colors: OmniColorSchemes) {
  const { custom, solid, ordinal, quantitative } = colors

  if (custom) {
    setColors(
      CUSTOM_COLORS,
      custom.map((v) => [v])
    )
    vega.scheme(
      `${COLOR_SERVICE_PREFIX}-custom-colors`,
      colorsToVega(getColors(CUSTOM_COLORS))
    )
  }

  if (solid) {
    setColors(
      SOLID_COLORS,
      solid.map((v) => [v])
    )
    vega.scheme(
      `${COLOR_SERVICE_PREFIX}-solid-colors`,
      colorsToVega(getColors(SOLID_COLORS))
    )
  }

  if (ordinal) {
    setColors(ORDINAL_COLORS, ordinal)
    Object.keys(ordinal).forEach((key) => {
      vega.scheme(`${COLOR_SERVICE_PREFIX}-${key}-colors`, ordinal[key])
    })
  }

  if (quantitative) {
    setColors(QUANTITATIVE_COLORS, quantitative)
    Object.keys(quantitative).forEach((key) => {
      vega.scheme(`${COLOR_SERVICE_PREFIX}-${key}-colors`, quantitative[key])
    })
  }
}
