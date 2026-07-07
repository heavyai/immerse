// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { Icon } from "@rmwc/icon"
import { TextField } from "widgets/text-field/TextField"
import Services from "services/immerse"

import "./mock-connector-styles.css"

const connector = Services.get("DbCon")

function pruneMockMap(mockMap) {
  const prunedMap = { ...mockMap }
  const tablesToKeep = new Set(Object.keys(prunedMap.getFieldsAsync))
  if (tablesToKeep.size && prunedMap.getTablesAsync) {
    prunedMap.getTablesAsync = mockMap.getTablesAsync.filter((table) =>
      tablesToKeep.has(table.name)
    )
  }

  return prunedMap
}

const uploadFile = async (evt, setMessage, setHasMockedQueries) => {
  evt.preventDefault()
  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = e.target.result
    setMessage("uploaded mocks")
    connector.mockConnection(JSON.parse(text))
    setHasMockedQueries(true)
  }
  reader.readAsText(evt.target.files[0])
}

const MockContainer = () => {
  const [hasMockedQueries, setHasMockedQueries] = useState(false)
  const [paused, setPaused] = useState(false)
  const [pauseCount, setPauseCount] = useState(0)
  const [interrupts, setInterrupts] = useState("")
  const [interruptSelector, setInterruptSelector] = useState("")
  const [interruptValue, setInterruptValue] = useState([])
  const [message, setMessage] = useState("")

  return (
    <div
      className="mock-container"
      style={hasMockedQueries ? { color: "red" } : {}}
    >
      <div className="mock-container-visible">
        <Icon
          title={
            paused ? "Resume puppeteer recording" : "Pause puppeteer recording"
          }
          icon={paused ? "play_arrow" : "pause"}
          onClick={() => {
            if (paused) {
              setPauseCount(pauseCount + 1)
            }
            setPaused(!paused)
          }}
          data-testid={`pause-puppeteer-${pauseCount}`}
        />
        <Icon
          title="Add puppeteer interrupt"
          icon="bug_report"
          data-testid="puppeteer-add-interrupt-button"
          onClick={() => {
            setInterrupts([...interrupts, [interruptSelector, interruptValue]])
            setInterruptSelector("")
            setInterruptValue("")
          }}
        />
      </div>
      <div className="mock-container-invisible">
        <TextField
          id="mock-container-interrupt-selector-input"
          data-testid="puppeteer-interrupt-selector"
          type="text"
          placeholder="selector"
          value={interruptSelector}
          onChange={(e) => setInterruptSelector(e.target.value)}
        />
        <TextField
          id="mock-container-interrupt-value-input"
          data-testid="puppeteer-interrupt-value"
          type="text"
          placeholder="value"
          value={interruptValue}
          onChange={(e) => setInterruptValue(e.target.value)}
        />
        <Icon
          title="Download puppeteer interrupts"
          icon="get_app"
          data-testid="download-puppeteer-interrupts"
          onClick={() => {
            const interruptsFile = interrupts
              .reduce((file, line) => {
                return [...file, line.join("\t")]
              }, [])
              .join("\n")
            const dataStr = URL.createObjectURL(
              new Blob([interruptsFile], {
                type: "text/plain"
              })
            )
            const downloadAnchorNode = document.createElement("a")
            downloadAnchorNode.setAttribute("href", dataStr)
            downloadAnchorNode.setAttribute("download", "interrupts.txt")
            document.body.appendChild(downloadAnchorNode) // required for firefox
            downloadAnchorNode.click()
            downloadAnchorNode.remove()
          }}
        />
        <label>
          <Icon title="Upload query mocks" icon="publish" />
          <input
            type="file"
            onChange={(e) => uploadFile(e, setMessage, setHasMockedQueries)}
            data-testid="upload-query-mocks"
            style={{ display: "none" }}
          />
        </label>
        <Icon
          title="Clear uploaded query mocks"
          icon="settings_backup_restore"
          data-testid="clear-query-mocks"
          onClick={() => {
            connector.unmockConnection()
            setHasMockedQueries(false)
            setMessage("queries unmocked")
          }}
        />
        <Icon
          title="Clear recorded query mocks"
          icon="restore"
          data-testid="reset-query-mocks"
          onClick={() => {
            connector.clearMockedQueries()
            setMessage("cleared mocked queries")
          }}
        />
        <input
          type="hidden"
          name="query-mocks-file"
          value="queries.json"
          data-testid="query-mocks-file"
        />
        <Icon
          title="Download query mocks"
          icon="get_app"
          data-testid="download-query-mocks"
          onClick={() => {
            if (window.mockMap) {
              const dataStr = URL.createObjectURL(
                new Blob(
                  [JSON.stringify(pruneMockMap(window.mockMap), null, 2)],
                  {
                    type: "text/json"
                  }
                )
              )
              const downloadAnchorNode = document.createElement("a")
              downloadAnchorNode.setAttribute("href", dataStr)
              downloadAnchorNode.setAttribute(
                "download",
                document.querySelector("[data-testid='query-mocks-file']").value
              )
              document.body.appendChild(downloadAnchorNode) // required for firefox
              downloadAnchorNode.click()
              downloadAnchorNode.remove()
            }
          }}
        />
        {message && <span>{message}</span>}
      </div>
    </div>
  )
}

export default MockContainer
