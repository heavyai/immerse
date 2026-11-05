// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { createDbTransport } = require("./index")
it("forwards the exact request/options and client receiver without promising backend cancellation", async () => {
  const options = { token: "fixture" }
  const client = {
    queryAsync: jest.fn(function queryStub(sql, requestOptions) {
      expect(this).toBe(client)
      expect(sql).toBe("SELECT 1")
      expect(requestOptions).toBe(options)
      return Promise.resolve([1])
    })
  }
  const transport = createDbTransport(client)
  expect(await transport.query("SELECT 1", options)).toEqual([1])
  expect(transport.cancellation).toBe("discard-results-only")
})
