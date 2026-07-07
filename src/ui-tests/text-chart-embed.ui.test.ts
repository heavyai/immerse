// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createChart,
  createDashboard,
  saveChart,
  toggleFeatureFlag,
  waitForVisible,
  editChart,
  embedHtmlContent,
  chartEditCancel
} from "./utils"

describe("Text chart with the HTML content embedding", () => {
  beforeAll(async () => {
    await toggleFeatureFlag("ui/html-editor", true)
  })

  it("should be able to add the HTML content embedding to Text chart", async () => {
    await createDashboard("ui-test/creates-text-chart-embed")
    await createChart("text", {
      // Prevents Puppeteer from trying and failing to click these as none required for text chart
      dataSource: "",
      dimensions: [],
      measures: []
    })

    const YOUTUBE_SRC = 'src="https://www.youtube.com/embed/j3PwJhD7czs"'
    const expectedEmbedHtmlContent = `.ql-editor iframe[${YOUTUBE_SRC}]`
    const embedHtmlYoutubeContent = `<iframe width="560" height="315" ${YOUTUBE_SRC} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`

    await embedHtmlContent(embedHtmlYoutubeContent, true)
    await saveChart()
    await waitForVisible(expectedEmbedHtmlContent)
    await editChart("1")
    await waitForVisible(expectedEmbedHtmlContent)
    await chartEditCancel()
    await waitForVisible(expectedEmbedHtmlContent)
  })

  it("should be able to reject the HTML content embedding", async () => {
    const expectedEmptyEditorSelector = ".ql-blank"
    const YOUTUBE_SRC = 'src="https://www.youtube.com/embed/K36cB1RyK9o"'
    const embedHtmlYoutubeContent = `<iframe width="560" height="315" ${YOUTUBE_SRC} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`

    await createDashboard("ui-test/creates-text-chart-cancel-embedding")
    await createChart("text", {
      dataSource: "",
      dimensions: [],
      measures: []
    })
    await embedHtmlContent(embedHtmlYoutubeContent, false)
    await waitForVisible(expectedEmptyEditorSelector)
  })

  afterAll(async () => {
    await toggleFeatureFlag("ui/html-editor", false)
  })
})
