// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { forwardRef, useId } from "react"
import ReactSelect from "react-select"
import ReactCreatableSelect from "react-select/creatable"
import styles from "./form-controls.module.css"

export const TextField = forwardRef(function NativeTextField(
  {
    label,
    error,
    helperText,
    inputProps,
    fullWidth,
    margin,
    variant,
    multiline,
    className,
    id,
    ...props
  },
  ref
) {
  const generated = useId()
  const inputId = id || generated
  const Input = multiline ? "textarea" : "input"
  return (
    <label
      className={[styles.field, className].filter(Boolean).join(" ")}
      htmlFor={inputId}
    >
      {label && <span>{label}</span>}
      <Input
        {...props}
        {...inputProps}
        id={inputId}
        ref={ref}
        className={styles.textInput}
        aria-invalid={error || undefined}
        aria-describedby={helperText ? `${inputId}-help` : undefined}
        aria-label={
          typeof label === "string"
            ? label
            : props["aria-label"] || props.placeholder
        }
      />
      {helperText && <span id={`${inputId}-help`}>{helperText}</span>}
    </label>
  )
})
export function InputLabel(props) {
  return <label {...props} />
}
export function Link({
  href,
  children,
  className,
  underline,
  color,
  component,
  ...props
}) {
  const Element = component || (href ? "a" : "button")
  return (
    <Element
      {...props}
      href={href}
      type={Element === "button" ? "button" : undefined}
      className={[styles.link, className].filter(Boolean).join(" ")}
    >
      {children}
    </Element>
  )
}
export function Chip({ label, className, size, color, variant, ...props }) {
  return (
    <span
      {...props}
      className={[styles.chip, className].filter(Boolean).join(" ")}
    >
      {label}
    </span>
  )
}
export function CircularProgress({
  size = 24,
  className,
  value,
  variant,
  color,
  ...props
}) {
  return (
    <span
      {...props}
      role="progressbar"
      aria-label={props["aria-label"] || "Loading"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={[styles.progress, className].filter(Boolean).join(" ")}
      style={{ width: size, height: size, ...props.style }}
    />
  )
}
export const DateTimeField = forwardRef(function NativeDateTimeField(
  { includeTime = true, value = "", onChange, label, ...props },
  ref
) {
  return (
    <input
      {...props}
      ref={ref}
      type={includeTime ? "datetime-local" : "date"}
      step={includeTime ? "0.001" : undefined}
      value={value || ""}
      onChange={(event) => onChange?.(event.target.value)}
      aria-label={
        label || (includeTime ? "Choose date and time" : "Choose date")
      }
      className={styles.textInput}
    />
  )
})
const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: 32,
    backgroundColor: "var(--ui-input)",
    color: "var(--ui-text)",
    borderColor: "var(--ui-border)"
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--ui-surface)",
    color: "var(--ui-text)",
    zIndex: "var(--ui-z-menu)"
  }),
  menuPortal: (base) => ({ ...base, zIndex: "var(--ui-z-menu)" }),
  input: (base) => ({ ...base, color: "var(--ui-text)" }),
  singleValue: (base) => ({ ...base, color: "var(--ui-text)" }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "var(--ui-hover)"
      : state.isSelected
      ? "var(--ui-accent)"
      : "transparent",
    color: state.isSelected ? "var(--ui-on-accent)" : "var(--ui-text)"
  })
}
export const Select = forwardRef(function SelectControl(props, ref) {
  return (
    <ReactSelect
      {...props}
      ref={ref}
      styles={{ ...selectStyles, ...props.styles }}
    />
  )
})
export const CreatableSelect = forwardRef(function CreatableSelectControl(
  props,
  ref
) {
  return (
    <ReactCreatableSelect
      {...props}
      ref={ref}
      styles={{ ...selectStyles, ...props.styles }}
    />
  )
})

export function FileDrop({
  onFile,
  accept = ".json,application/json",
  label = "Choose file",
  children,
  className
}) {
  const input = React.useRef(null)
  const cancel = React.useRef(null)
  React.useEffect(() => () => cancel.current?.(), [])
  const select = (file) => {
    if (!file) {
      return
    }
    cancel.current?.()
    cancel.current = onFile(file)
  }
  return (
    <div
      className={[styles.fileDrop, className].filter(Boolean).join(" ")}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        select(event.dataTransfer.files[0])
      }}
    >
      <input
        type="file"
        hidden
        accept={accept}
        aria-label={label}
        ref={input}
        onChange={(event) => {
          select(event.target.files[0])
          event.target.value = ""
        }}
      />
      <button
        type="button"
        className={styles.fileDropButton}
        onClick={() => input.current.click()}
        aria-label={label}
      >
        {children || label}
      </button>
    </div>
  )
}
