// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const {
  decimalDegreesToMeters,
  METERS_PER_DECIMAL_DEGREE,
  metersPerPixelAtZoom
} = require("./geo")

describe("Geo Utils", () => {
  describe("decimalDegreesToMeters", () => {
    it("should be our ratio if 1", () => {
      expect(decimalDegreesToMeters(1)).toEqual(METERS_PER_DECIMAL_DEGREE)
    })
  })
  describe("metersPerPixelAtZoom", () => {
    it("should return null if no zoom provided", () => {
      expect(metersPerPixelAtZoom(45, null)).toBe(null)
    })
    it("should return null if no latitude provided", () => {
      expect(metersPerPixelAtZoom(null, 9)).toBe(null)
    })
    // Referencing this: https://docs.mapbox.com/help/glossary/zoom-level/
    it("should calculate meters per pixel at latitude 0", () => {
      expect(metersPerPixelAtZoom(0, 5)).toBe(2445.9849243164062)
    })
    it("should calculate meters per pixel at latitude 40", () => {
      expect(metersPerPixelAtZoom(40, 10)).toBe(58.55416122579303)
    })
    it("should throw error if latitude is invalid", () => {
      const invalidLatitude = () => {
        metersPerPixelAtZoom(900, 10)
      }
      expect(invalidLatitude).toThrow(/^Invalid latitude/)
    })
    it("should throw error if zoom above or below allowed level", () => {
      const invalidZoom = () => {
        metersPerPixelAtZoom(50, 25)
      }
      expect(invalidZoom).toThrow(/^Invalid zoom/)
    })
  })
})
