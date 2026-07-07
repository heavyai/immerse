// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  available_feature_flags,
  setFeatureFlag
} from "components/control-panel/featureflags"
import { IMMERSE_EXPORT_DISABLED_ROLE } from "constants/roles"

const { isUserExportDisabled } = require("./user")

describe("User Utilities", () => {
  describe("isUserExportDisabled", () => {
    const { USER_EXPORT_DISABLED } = available_feature_flags
    it("should return true when export disabled role FF is on and user has export disabled role", () => {
      setFeatureFlag(USER_EXPORT_DISABLED, true)
      const exportDisabled = isUserExportDisabled([
        IMMERSE_EXPORT_DISABLED_ROLE
      ])
      expect(exportDisabled).toBe(true)
    })
    it("should return false when export disabled role FF is on but user doesnt have export disabled role", () => {
      setFeatureFlag(USER_EXPORT_DISABLED, true)
      const exportDisabled = isUserExportDisabled(["other_role"])
      expect(exportDisabled).toBe(false)
    })
    it("should return false when export disabled role FF is off but user has export disabled role", () => {
      setFeatureFlag(USER_EXPORT_DISABLED, false)
      const exportDisabled = isUserExportDisabled([
        IMMERSE_EXPORT_DISABLED_ROLE
      ])
      expect(exportDisabled).toBe(false)
    })
  })
})
