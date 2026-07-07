// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const IconSearch = (props) => (
  <svg
    width={18}
    height={18}
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <defs>
      <path
        d="M12.516 11.016l4.968 4.968-1.5 1.5-4.968-4.968v-.797l-.282-.281c-1.187 1.03-2.593 1.546-4.218 1.546-1.813 0-3.352-.625-4.618-1.875C.633 9.86 0 8.33 0 6.516c0-1.813.633-3.352 1.898-4.618C3.164.633 4.703 0 6.516 0c1.812 0 3.343.633 4.593 1.898 1.25 1.266 1.875 2.805 1.875 4.618 0 1.625-.515 3.03-1.546 4.218l.28.282h.798zm-6 0c1.25 0 2.312-.438 3.187-1.313s1.313-1.937 1.313-3.187c0-1.25-.438-2.313-1.313-3.188S7.766 2.016 6.516 2.016c-1.25 0-2.313.437-3.188 1.312S2.016 5.266 2.016 6.516c0 1.25.437 2.312 1.312 3.187s1.938 1.313 3.188 1.313z"
        id="icon-search-a"
      />
    </defs>
    <g transform="matrix(-1 0 0 1 18 0)" fill="none" fillRule="evenodd">
      <mask id="icon-search-b" fill="#fff">
        <use xlinkHref="#icon-search-a" />
      </mask>
      <use fill="#314054" xlinkHref="#icon-search-a" />
      <g mask="url(#icon-search-b)" fill="#AAA" opacity={0.88}>
        <path d="M-3-3h24v24H-3z" />
      </g>
    </g>
  </svg>
)

export default IconSearch
