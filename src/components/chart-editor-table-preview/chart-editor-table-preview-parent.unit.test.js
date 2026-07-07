// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapDispatchToProps } from "components/chart-editor-table-preview/chart-editor-table-preview-parent"

describe("<TableChartPreviewParent />", () => {
  let dispatch = null
  let props = null

  beforeEach(() => {
    dispatch = jest.fn()
    props = mapDispatchToProps(dispatch)
  })

  describe("requestTablePreview action", () => {
    it("should dispatch the getDataSourcePreview action", () => {
      props.requestTablePreview("dsName")
      // cant test unless we dispatch a a plain action
      expect(dispatch).toHaveBeenCalled()
    })
  })
})
