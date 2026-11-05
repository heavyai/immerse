// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Browser-only fixture: never imported by the application entry point.
import React, { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  PrimaryButton,
  SecondaryButton,
  Checkbox,
  Switch,
  Tooltip,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuSurfaceAnchor,
  Menu,
  MenuItem
} from "@immerse/ui"
import "../../src/styles/base/_css-vars.scss"
import "../../src/styles/base/nexus/colors.scss"
import "@immerse/ui/tokens.css"

function Harness() {
  const [dialog, setDialog] = useState(false)
  const [menu, setMenu] = useState(false)
  const [selection, setSelection] = useState("None")
  const [range, setRange] = useState([2, 8])
  const [checked, setChecked] = useState(false)
  return (
    <main
      style={{
        padding: 32,
        color: "var(--ui-text)",
        background: "var(--grayDp1)",
        minHeight: "100vh",
        fontFamily: "sans-serif"
      }}
    >
      <h1>UI contract fixture</h1>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 24
        }}
      >
        <Tooltip content="Open export dialog" enterDelay={0}>
          <PrimaryButton onClick={() => setDialog(true)}>Export</PrimaryButton>
        </Tooltip>
        <SecondaryButton disabled>Unavailable</SecondaryButton>
        <Checkbox
          label="Include nulls"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
        <Switch label="Show legend" defaultChecked />
        <MenuSurfaceAnchor>
          <SecondaryButton
            onClick={() => setMenu(!menu)}
            aria-haspopup="menu"
            aria-expanded={menu}
          >
            Options
          </SecondaryButton>
          <Menu open={menu} onClose={() => setMenu(false)}>
            <MenuItem disabled>Unavailable option</MenuItem>
            <MenuItem onClick={() => setSelection("Download")}>
              Download
            </MenuItem>
            <MenuItem onClick={() => setSelection("Delete")}>Delete</MenuItem>
          </Menu>
        </MenuSurfaceAnchor>
      </div>
      <div style={{ width: 280 }}>
        <Slider
          value={range}
          onChange={(_event, values) => setRange(values)}
          min={0}
          max={10}
          valueLabelDisplay="auto"
        />
      </div>
      <output aria-label="Selected range">{range.join(" to ")}</output>
      <output aria-label="Selected menu action">{selection}</output>
      <Dialog open={dialog} onClose={() => setDialog(false)}>
        <DialogTitle>Export dashboard</DialogTitle>
        <DialogContent>
          <label>
            File name <input defaultValue="Dashboard" />
          </label>
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={() => setDialog(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={() => setDialog(false)}>
            Download file
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </main>
  )
}
document.body.style.fontFamily = "Arial, sans-serif"
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Harness />
  </StrictMode>
)
