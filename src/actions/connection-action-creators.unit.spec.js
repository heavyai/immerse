// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import {
  connectionSuccess,
  connectionRequest,
  initHeavyDBSession,
  disconnect,
  loadGeoJsonConfig,
  setDatabaseName
} from "actions/connection-action-creators"
import { hideModal, showModal } from "actions/ui-action-creators"
import { CONNECTION_SUCCESS, DROP_CONNECTION } from "constants/action-types"
import parseUrl from "utils/parse-url"
import { push } from "connected-react-router"
import proxyquire from "proxyquire"

chai.use(spies)

describe("Connection Actions", () => {
  const services = new Map()

  describe("connectionSuccess", () => {
    it("should return proper type and id in payload", () => {
      expect(connectionSuccess("id", { user: "USER", database: "DATABASE" }, [], "HEAVYAI")).to.deep.equal({
        type: CONNECTION_SUCCESS,
        sessionId: "id",
        sessionInfo: {
          user: "USER",
          database: "DATABASE"
        },
        statuses: [],
        GTM: "HEAVYAI"
      })
    })
  })

  describe("disconnect", () => {
    it("should return correct action type", () => {
      const action = disconnect()
      expect(action.type).to.eql("DROP_CONNECTION")
    })
  })

  describe("loadGeoJsonConfig", () => {
    it("should return correct action type", () => {
      const action = loadGeoJsonConfig({})
      expect(action.type).to.eql("LOAD_GEOJSON_CONFIG")
    })
  })

  describe("setDatabaseName", () => {
    it("setDatabaseName", () => {
      const action = setDatabaseName({})
      expect(action.type).to.eql("SET_DATABASE_NAME")
    })
  })
})
