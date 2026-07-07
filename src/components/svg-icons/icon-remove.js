// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const IconRemove = (props) => (
  <svg
    viewBox="0 0 16 16"
    version={1.1}
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={16}
    height={16}
    {...props}
  >
    <defs>
      <circle id="path-1" cx={8} cy={8} r={8} />
    </defs>
    <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
      <g id="Assets" transform="translate(-779.000000, -350.000000)">
        <g
          id="Remove-Delete/Solid/16/Remove"
          transform="translate(779.000000, 350.000000)"
        >
          <g id="Remove-Icon--Gray-Circle">
            <g id="Colors/77">
              <mask id="mask-2" fill="white">
                <use xlinkHref="#path-1" />
              </mask>
              <use id="Mask" fill="#9C9EA8" xlinkHref="#path-1" />
              <g id={77} mask="url(#mask-2)" fill="#777777">
                <g
                  id="Group"
                  transform="translate(8.000000, 8.000000) rotate(-270.000000) translate(-8.000000, -8.000000) translate(0.000000, 0.000000)"
                >
                  <rect id={77} x={0} y={0} width={16} height={16} />
                </g>
              </g>
            </g>
            <g
              id="Group-7"
              stroke="#F6F6F7"
              strokeLinecap="round"
              strokeWidth={2}
            >
              <path d="M10.872738,5.12726205 L5.12726205,10.872738" id="Line" />
              <path d="M5.12726205,5.12726205 L10.872738,10.872738" id="Line" />
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
)

export default IconRemove
