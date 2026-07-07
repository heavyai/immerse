// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapStateToProps, mergeProps } from "./share-link-parent"

describe("ShareLinkParent", () => {
  describe("mapStateToProps", () => {
    it.skip("should return linkId and database", () => {
      const state = {
        dashboard: {
          saveLinkState: {
            linkId: "D383DF3"
          }
        },
        connection: {
          user: {
            database: "heavyai"
          }
        }
      }
      const result = mapStateToProps(state)
      expect(result).toStrictEqual({
        database: "heavyai",
        linkId: "D383DF3"
      })
    })

    it.skip("should return a null linkId when saveLinkState is missing", () => {
      const state = {
        dashboard: {},
        connection: {
          user: {
            database: "heavyai"
          }
        }
      }
      const result = mapStateToProps(state)
      expect(result).toStrictEqual({
        database: "heavyai",
        linkId: null
      })
    })

    describe("mergeProps", () => {
      it.skip("should return linkId and database", () => {
        const state = {
          database: "heavyai",
          linkId: "12345"
        }
        const result = mergeProps(state)
        expect(result).toStrictEqual({
          formattedLink: "http://www.heavy.ai/demos#/link/heavyai/12345"
        })
      })

      it.skip("should return loading when linkId is undefined", () => {
        const state = {
          database: "heavyai"
        }
        const result = mergeProps(state)
        expect(result).toStrictEqual({
          formattedLink: "Loading..."
        })
      })
    })
  })
})
