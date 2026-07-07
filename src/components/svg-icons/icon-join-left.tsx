// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const IconJoinLeft = ({
  className = "icon-join-left",
  testId = "icon-join-left"
}: {
  className: string
  testId: string
}) => (
  <svg
    width="20"
    height="14"
    viewBox="0 0 20 14"
    className={className}
    data-testid={testId}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.2 11.7333C16.0351 11.7333 18.3333 9.43506 18.3333 6.6C18.3333 3.76494 16.0351 1.46667 13.2 1.46667C10.3649 1.46667 8.06667 3.76494 8.06667 6.6C8.06667 9.43506 10.3649 11.7333 13.2 11.7333ZM13.2 13.2C16.8451 13.2 19.8 10.2451 19.8 6.6C19.8 2.95492 16.8451 0 13.2 0C9.55492 0 6.6 2.95492 6.6 6.6C6.6 10.2451 9.55492 13.2 13.2 13.2Z"
    />
    <path d="M8.70944 0.344287C8.04707 0.121017 7.33767 0 6.6 0C2.95492 0 0 2.95492 0 6.6C0 10.2451 2.95492 13.2 6.6 13.2C7.33767 13.2 8.04707 13.079 8.70944 12.8557C6.76575 11.458 5.5 9.17682 5.5 6.6C5.5 4.02318 6.76575 1.74199 8.70944 0.344287Z" />
  </svg>
)

export default IconJoinLeft
