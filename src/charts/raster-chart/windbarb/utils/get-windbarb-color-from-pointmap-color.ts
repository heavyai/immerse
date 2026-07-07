// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const getWindbarbColorFromPointmapColor = (colorSpec) =>
  colorSpec.field
    ? {
        field: colorSpec.field,
        type: colorSpec.type,
        scale: {
          range: colorSpec.range,
          type: colorSpec.range?.length > 2 ? "quantize" : colorSpec.type
        }
      }
    : {
        value: colorSpec.range?.[0] || colorSpec.value
      }
