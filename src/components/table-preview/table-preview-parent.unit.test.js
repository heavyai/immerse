// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapDispatchToProps } from "components/table-preview/table-preview-parent"

describe("TablePreview Parent Component", () => {
  let dispatch = null
  let props = null

  beforeEach(() => {
    dispatch = jest.fn()
    props = mapDispatchToProps(dispatch)
  })

  describe("requestTablePreview action", () => {
    it("dispatch the getDataSourcePreview action", () => {
      props.requestTablePreview()
      // cant test unless we dispatch a a plain action
      expect(dispatch).toHaveBeenCalled()
    })
  })
})
