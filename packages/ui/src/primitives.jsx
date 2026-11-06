// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef
} from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as SliderPrimitive from "@radix-ui/react-slider"
import styles from "./primitives.module.css"

const classes = (...values) => values.filter(Boolean).join(" ")
function ButtonIcon({ icon }) {
  const value =
    icon && typeof icon === "object" && !React.isValidElement(icon)
      ? icon.icon
      : icon
  return value ? (
    <span
      className={classes(
        styles.icon,
        typeof value === "string" && "material-icons"
      )}
      aria-hidden="true"
    >
      {value}
    </span>
  ) : null
}
export const Button = forwardRef(function ButtonControl(
  {
    variant = "primary",
    tone,
    label,
    icon,
    trailingIcon,
    children,
    className,
    type = "button",
    ...props
  },
  ref
) {
  return (
    <button
      {...props}
      type={type}
      ref={ref}
      className={classes(styles.button, className)}
      data-variant={variant}
      data-tone={tone}
    >
      <ButtonIcon icon={icon} />
      {label ?? children}
      <ButtonIcon icon={trailingIcon} />
    </button>
  )
})
const buttonVariant = (variant, tone) =>
  forwardRef(function VariantButton(props, ref) {
    return <Button {...props} ref={ref} variant={variant} tone={tone} />
  })
export const PrimaryButton = buttonVariant("primary")
export const SecondaryButton = buttonVariant("secondary")
export const SecondaryButtonNoBorder = buttonVariant("quiet")
export const DangerButton = buttonVariant("primary", "danger")
export const WarningButton = buttonVariant("primary", "warning")
export const InfoButton = buttonVariant("primary")
export const SuccessButton = buttonVariant("primary", "success")

function ToggleControl(
  { label, indeterminate, role, className, variant, ...props },
  ref
) {
  const input = useRef(null)
  useEffect(() => {
    if (input.current) {
      input.current.indeterminate = Boolean(indeterminate)
    }
  }, [indeterminate])
  const control = (
    <input
      {...props}
      type="checkbox"
      role={role}
      data-toggle-variant={variant}
      ref={(node) => {
        input.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      className={classes(
        styles.control,
        role === "switch" && styles.switch,
        className
      )}
    />
  )
  return label ? (
    <label className={styles.controlLabel}>
      {control}
      {label}
    </label>
  ) : (
    control
  )
}
export const Checkbox = forwardRef(ToggleControl)
export const Switch = forwardRef(function SwitchControl(props, ref) {
  return <Checkbox {...props} role="switch" ref={ref} />
})

export const Toggle = forwardRef(function PillToggleControl(props, ref) {
  return <Switch {...props} variant="pill" ref={ref} />
})

export function Tooltip({
  asChild = false,
  content,
  children,
  enterDelay = 500,
  open,
  align,
  showArrow,
  className,
  ...props
}) {
  if (!content) {
    return children
  }
  const side = ["left", "right", "top", "bottom"].includes(align)
    ? align
    : "top"
  return (
    <TooltipPrimitive.Provider delayDuration={enterDelay}>
      <TooltipPrimitive.Root
        {...props}
        open={open === undefined ? undefined : Boolean(open)}
      >
        <TooltipPrimitive.Trigger
          asChild
          className={asChild ? styles.tooltipChild : undefined}
        >
          {asChild ? (
            children
          ) : (
            <span className={styles.tooltipTrigger} tabIndex={0}>
              {children}
            </span>
          )}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={classes(styles.tooltip, className)}
            side={side}
            sideOffset={6}
          >
            {content}
            {showArrow && <TooltipPrimitive.Arrow />}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

const AnchorContext = createContext(null)
const MenuContext = createContext(null)
export function MenuSurfaceAnchor({ children, className, ...props }) {
  const anchor = useRef(null)
  return (
    <AnchorContext.Provider value={anchor}>
      <div
        {...props}
        ref={anchor}
        className={classes(styles.anchor, className)}
      >
        {children}
      </div>
    </AnchorContext.Provider>
  )
}
function moveMenuFocus(event) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    return
  }
  const items = [
    ...event.currentTarget.querySelectorAll('[role="menuitem"]:not(:disabled)')
  ]
  if (!items.length) {
    return
  }
  event.preventDefault()
  const index = items.indexOf(document.activeElement)
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
      ? items.length - 1
      : (index + (event.key === "ArrowUp" ? -1 : 1) + items.length) %
        items.length
  items[next].focus()
}
export function MenuSurface({
  open = false,
  onClose,
  children,
  className,
  focusOnOpen = true,
  hoistToBody,
  anchorCorner,
  fixed,
  fullwidth,
  onSelect,
  role = "dialog",
  ...props
}) {
  const anchor = useContext(AnchorContext)
  const content = useRef(null)
  const close = (event) => onClose?.(event || new Event("close"))
  return (
    <PopoverPrimitive.Root
      open={Boolean(open)}
      onOpenChange={(next) => {
        if (!next) {
          close()
        }
      }}
    >
      {anchor && <PopoverPrimitive.Anchor virtualRef={anchor} />}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          {...props}
          ref={content}
          role={role}
          className={classes(styles.menu, className)}
          sideOffset={0}
          align={/right|end/i.test(anchorCorner || "") ? "end" : "start"}
          onKeyDown={moveMenuFocus}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            if (focusOnOpen) {
              content.current
                ?.querySelector?.(
                  'button:not(:disabled), input:not(:disabled), [tabindex="0"]'
                )
                ?.focus()
            }
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            anchor?.current?.querySelector('button, [tabindex="0"]')?.focus()
          }}
        >
          <MenuContext.Provider value={{ close, onSelect }}>
            {children}
          </MenuContext.Provider>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
export function Menu(props) {
  return <MenuSurface {...props} role="menu" />
}
export const MenuItem = forwardRef(function MenuItemControl(
  { children, onClick, className, disabled, ...props },
  ref
) {
  const menu = useContext(MenuContext)
  return (
    <button
      {...props}
      type="button"
      role="menuitem"
      ref={ref}
      disabled={disabled}
      className={classes(styles.menuItem, className)}
      onClick={(e) => {
        onClick?.(e)
        e.stopPropagation()
        if (!e.defaultPrevented) {
          menu?.onSelect?.(e)
          menu?.close(e)
        }
      }}
    >
      {children}
    </button>
  )
})

export function Dialog({
  open = false,
  onOpenChange,
  onOpen,
  onClose,
  onOpenAutoFocus,
  preventOutsideDismiss,
  tone,
  children,
  className,
  ...props
}) {
  const previous = useRef(false)
  const returnFocus = useRef(null)
  useEffect(() => {
    if (open && !previous.current) {
      onOpen?.()
    }
    previous.current = open
  }, [open, onOpen])
  return (
    <DialogPrimitive.Root
      open={Boolean(open)}
      onOpenChange={(next) => {
        onOpenChange?.(next)
        if (!next) {
          onClose?.()
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content
          {...props}
          className={classes(styles.dialog, className)}
          data-tone={tone}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            returnFocus.current = document.activeElement
            onOpenAutoFocus?.(event)
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (returnFocus.current?.isConnected) {
              returnFocus.current.focus()
            }
          }}
          onInteractOutside={(e) => {
            if (preventOutsideDismiss) {
              e.preventDefault()
            }
          }}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
export const DialogTitle = forwardRef(function DialogTitleControl(
  { className, ...props },
  ref
) {
  return (
    <DialogPrimitive.Title
      {...props}
      ref={ref}
      data-ui="dialog-title"
      className={classes(styles.dialogTitle, className)}
    />
  )
})
export function DialogContent({ className, ...props }) {
  return (
    <div
      {...props}
      data-ui="dialog-content"
      className={classes(styles.dialogContent, className)}
    />
  )
}
export function DialogActions({ className, ...props }) {
  return (
    <div
      {...props}
      data-ui="dialog-actions"
      className={classes(styles.dialogActions, className)}
    />
  )
}

export const Slider = forwardRef(function SliderControl(
  {
    value,
    defaultValue = 0,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    onChangeCommitted,
    className,
    classes: oldClasses,
    valueLabelDisplay,
    valueLabelFormat,
    getAriaLabel,
    getAriaValueText,
    track,
    marks,
    color,
    orientation,
    ...props
  },
  ref
) {
  const values =
    value === undefined
      ? undefined
      : Array.isArray(value)
      ? value
      : [Number(value)]
  const initial = Array.isArray(defaultValue)
    ? defaultValue
    : [Number(defaultValue)]
  const current = values || initial
  const unpack = (next) =>
    Array.isArray(value ?? defaultValue) ? next : next[0]
  return (
    <SliderPrimitive.Root
      {...props}
      ref={ref}
      min={Number(min)}
      max={Number(max)}
      step={step === null ? 1 : Number(step)}
      value={values}
      defaultValue={initial}
      orientation={orientation}
      data-ui="slider"
      className={classes(styles.slider, className)}
      data-track={track}
      onValueChange={(next) => onChange?.(null, unpack(next))}
      onValueCommit={(next) => onChangeCommitted?.(null, unpack(next))}
    >
      <SliderPrimitive.Track className={styles.track}>
        {track !== false && <SliderPrimitive.Range className={styles.range} />}
      </SliderPrimitive.Track>
      {current.map((v, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={styles.thumb}
          aria-label={
            getAriaLabel?.(i) ||
            props["aria-label"] ||
            (current.length > 1 ? (i === 0 ? "Minimum" : "Maximum") : "Value")
          }
          aria-valuetext={getAriaValueText?.(v, i)}
        >
          {valueLabelDisplay && valueLabelDisplay !== "off" && (
            <span
              className={styles.valueLabel}
              data-always={valueLabelDisplay === "on" || undefined}
              aria-hidden="true"
            >
              {typeof valueLabelFormat === "function"
                ? valueLabelFormat(v, i)
                : v}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
})
