// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FieldType } from "./custom-styles-field"

export const JSONBrandingElements = [
  {
    key: "title",
    name: "Title",
    description: "Text displayed in the browser tab.",
    type: FieldType.STRING,
    value: "",
    singleLine: true
  },
  {
    key: "loginText",
    name: "Login Text",
    description: "Specify custom text for the Immerse login page.",
    type: FieldType.STRING,
    value: ""
  },
  {
    key: "logoURL",
    name: "Logo URL",
    description:
      "URL to your logo. You can set different logos for light and dark mode. If a dark mode logo is configured in darkThemeLogoURL, the logo defined in logoURL is used for light mode only. If no dark mode logo is configured, the logo defined in logoURL is used for both light and dark mode. \n\nMust be a browser-accessible http(s) URL, not a file system path.",
    type: FieldType.STRING,
    value: "",
    singleLine: true
  },
  {
    key: "darkThemeLogoURL",
    name: "Dark Theme Logo URL",
    description:
      "URL to your dark mode logo. You can set different logos for light and dark mode. If no dark mode logo is configured, the logo defined in logoURL is used for both light and dark mode. \n\nMust be a browser-accessible http(s) URL, not a file system path.",
    type: FieldType.STRING,
    value: "",
    singleLine: true
  },
  {
    key: "disableHelpMenu",
    name: "Disable Help Menu",
    description: "Set to true to disable Help dropdown on the navigation bar.",
    type: FieldType.BOOLEAN,
    value: ""
  },
  {
    key: "buttonPrimaryColor",
    name: "Primary Button Color",
    description:
      "Primary button color used throughout Immerse. Must be a hexidecimal color value, beginning with '#' (i.e. #FF0000).",
    type: FieldType.STRING,
    value: "",
    singleLine: true
  }
]
