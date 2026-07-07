// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const getNumberPrecision = (num) => {
  if (Math.floor(num.valueOf()) === num.valueOf()) {
    return 0
  }
  const str = num.toString()
  if (str.indexOf(".") !== -1 && str.indexOf("-") !== -1) {
    return str.split("-")[1] || 0
  } else if (str.indexOf(".") !== -1) {
    return str.split(".")[1].length || 0
  }
  return str.split("-")[1] || 0
}

export default getNumberPrecision
