// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { initialState } from "reducers/connection"
import { mapStateToProps } from "./login-parent"

describe("Login Parent", () => {
  describe("mapStateToProps", () => {
    describe("titleName", () => {
      it("should return Login (nothing) when loadlink is false and config not loaded", () => {
        const state = {
          connection: {
            ...initialState,
            loadLink: false
          }
        }

        expect(mapStateToProps(state).titleName).toEqual("Login")
      })
      it("should return Login Title when loadlink is false and config is loaded", () => {
        const state = {
          connection: {
            ...initialState,
            loadLink: false,
            serversJsonPending: false
          }
        }

        expect(mapStateToProps(state).titleName).toEqual("Login to Immerse")
      })
    })
    it("should return Load Link Title when loadlink is true", () => {
      const state = {
        connection: {
          ...initialState,
          loadLink: true
        }
      }

      expect(mapStateToProps(state).titleName).toEqual("Load Dashboard Link")
    })
  })
})
