// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ColorService from "./colors"
import serversConfig from "servers.example.json"

describe("Color Service", () => {
  describe("getColors", () => {
    it("should return MapD defaults", () => {
      expect(ColorService.getColors(ColorService.SOLID_COLORS)).toEqual(
        ColorService.HEAVYAI_SOLID_COLORS
      )
      expect(ColorService.getColors(ColorService.CUSTOM_COLORS)).toEqual(
        ColorService.HEAVYAI_CUSTOM_COLORS
      )
      expect(ColorService.getColors(ColorService.ORDINAL_COLORS)).toEqual(
        ColorService.HEAVYAI_ORDINAL_COLORS
      )
      expect(ColorService.getColors(ColorService.QUANTITATIVE_COLORS)).toEqual(
        ColorService.HEAVYAI_QUANTITATIVE_COLORS
      )
      expect(
        ColorService.getColors(ColorService.MEASURE_DEFAULT_COLORS)
      ).toEqual(ColorService.HEAVYAI_MEASURE_DEFAULT_COLORS())
      expect(
        ColorService.getColors(ColorService.CHARTS_DEFAULT_COLORS)
      ).toEqual(ColorService.HEAVYAI_CHARTS_DEFAULT_COLORS())
    })
  })

  describe("partial applyColors", () => {
    it("should not cause an error and should apply partial set specified", () => {
      const userColors = {
        solid: serversConfig[0].customStyles.colors.solid
      }

      ColorService.applyColors(userColors)

      expect(ColorService.getColors(ColorService.SOLID_COLORS)).not.toEqual(
        ColorService.HEAVYAI_SOLID_COLORS
      )
      expect(ColorService.getColors(ColorService.SOLID_COLORS).red[0]).toEqual(
        userColors.solid[0]
      )
    })
  })

  describe("applyColors", () => {
    const userColors = serversConfig[0].customStyles.colors
    beforeEach(() => {
      ColorService.applyColors(userColors)
    })

    it("should set solid colors from config", () => {
      expect(ColorService.getColors(ColorService.SOLID_COLORS)).not.toEqual(
        ColorService.HEAVYAI_SOLID_COLORS
      )
      expect(ColorService.getColors(ColorService.SOLID_COLORS).red[0]).toEqual(
        userColors.solid[0]
      )
    })

    it("should set custom colors from config", () => {
      expect(ColorService.getColors(ColorService.CUSTOM_COLORS)).not.toEqual(
        ColorService.HEAVYAI_CUSTOM_COLORS
      )
      expect(ColorService.getColors(ColorService.CUSTOM_COLORS).red[0]).toEqual(
        userColors.custom[0]
      )
    })

    it("should set ordinal colors from config", () => {
      expect(ColorService.getColors(ColorService.ORDINAL_COLORS)).not.toEqual(
        ColorService.HEAVYAI_ORDINAL_COLORS
      )
      expect(
        ColorService.getColors(ColorService.ORDINAL_COLORS).blueRed[0]
      ).toEqual(userColors.ordinal[0][0])
    })

    it("should set quantitative colors from config", () => {
      expect(
        ColorService.getColors(ColorService.QUANTITATIVE_COLORS)
      ).not.toEqual(ColorService.HEAVYAI_QUANTITATIVE_COLORS)
      expect(
        ColorService.getColors(ColorService.QUANTITATIVE_COLORS).mapDScale[0]
      ).toEqual(userColors.quantitative[0][0])
    })
  })
})
