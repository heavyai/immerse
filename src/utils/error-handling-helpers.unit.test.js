// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getErrorMessageFromBackendError,
  DEFAULT_ERROR_MESSAGE
} from "./error-handling-helpers"

describe("Error handling helpers", () => {
  describe("getErrorMessageFromBackendError", () => {
    it("should return the error message stored in the error object", () => {
      const errorMessage = "Oh dear"

      expect(
        getErrorMessageFromBackendError({ message: errorMessage })
      ).toEqual(errorMessage)

      expect(
        getErrorMessageFromBackendError({ error_msg: errorMessage })
      ).toEqual(errorMessage)

      expect(getErrorMessageFromBackendError(errorMessage)).toEqual(
        errorMessage
      )
    })

    it("should return a custom default error message if provided, otherwise a generic default", () => {
      expect(getErrorMessageFromBackendError({})).toEqual(DEFAULT_ERROR_MESSAGE)

      expect(getErrorMessageFromBackendError(null)).toEqual(
        DEFAULT_ERROR_MESSAGE
      )

      const customDefault = "Oh my"
      expect(getErrorMessageFromBackendError({}, { customDefault })).toEqual(
        customDefault
      )
    })
  })
})
