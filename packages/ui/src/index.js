// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const React = require("react")
const { Button } = require("@rmwc/button")

function PrimaryButton(props) {
  return React.createElement(
    Button,
    { unelevated: true, ripple: false, ...props },
    props.children
  )
}
function SecondaryButton(props) {
  return React.createElement(
    Button,
    { outlined: true, ripple: false, ...props },
    props.children
  )
}
function SecondaryButtonNoBorder(props) {
  return React.createElement(
    Button,
    { dense: true, ripple: false, ...props },
    props.children
  )
}
function DangerButton(props) {
  return React.createElement(
    PrimaryButton,
    { className: "danger", ...props },
    props.children
  )
}
function WarningButton(props) {
  return React.createElement(
    PrimaryButton,
    { className: "warning", ...props },
    props.children
  )
}
function InfoButton(props) {
  return React.createElement(
    PrimaryButton,
    { className: "info", ...props },
    props.children
  )
}
function SuccessButton(props) {
  return React.createElement(
    PrimaryButton,
    { className: "success", ...props },
    props.children
  )
}
const buttons = {
  PrimaryButton,
  SecondaryButton,
  SecondaryButtonNoBorder,
  DangerButton,
  WarningButton,
  InfoButton,
  SuccessButton
}
module.exports = { ...buttons, default: buttons }

Object.defineProperty(module.exports, "__esModule", { value: true })
