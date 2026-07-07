// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import { expectSaga } from "redux-saga-test-plan"

import { setDashboardPrivileges } from "actions/dashboard-action-creators"
import Services from "services/immerse"
import proxyquire from "proxyquire"

describe("Privileges Sagas", () => {
  const connector = Services.get("DbCon")

  after(() => {
    Services.set("DbCon", connector)
  })

  describe("getDataSourcePrivileges Method", () => {
    const {getDataSourcePrivileges} = proxyquire("actions/privileges-thunks", {
      "services/session": {
        getTablePrivileges: async (table) => ({
          ok: true,
          json: async () => ([
            { privs: [false, false, false] },
            { privs: [true, false, true] }
          ])
        })
      }
    })
    it("should handle getting createDashboard privilege from any privilege set", async () =>
      expect((await getDataSourcePrivileges('foo')).create).to.be.true
    )
  })
})
