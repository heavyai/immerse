// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sanitizeHtml from "sanitize-html"

/**
 * Options used by sanitizeHTML library to sanitize per our parameters.
 * Allows iframe and img tags, with specific attributes, you can find the
 * rest of the allowed tags and attributes here:
 * https://github.com/apostrophecms/sanitize-html?tab=readme-ov-file#default-options
 */
export const sanitizeOpts = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "iframe",
    "a",
    "p"
  ]),
  allowedAttributes: {
    iframe: ["src", "width", "height", "frameborder", "allowfullscreen"],
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    a: ["href", "name", "target"],
    "*": ["style", "class"]
  },
  selfClosing: ["img"],
  allowedStyles: {
    "*": {
      color: [
        /^#(?:[0-9a-fA-F]{3}){1,2}$/i,
        /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i,
        /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0|1|0?\.\d+)\s*\)$/i,
        /^hsl\(.*\)$/i
      ],
      "background-color": [
        /^#(?:[0-9a-fA-F]{3}){1,2}$/i,
        /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i,
        /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0|1|0?\.\d+)\s*\)$/i,
        /^hsl\(.*\)$/i
      ],
      "font-size": [/^(?:8|9|10|12|14|18|24|30|36|48|60|72|96)px$/],
      "font-family": [/^(?:roboto|arial|mono)$/i],
      "text-align": [/^(?:left|right|center|justify)$/]
    }
  },
  // Allow base64-encoded images
  allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(["data"])
}
