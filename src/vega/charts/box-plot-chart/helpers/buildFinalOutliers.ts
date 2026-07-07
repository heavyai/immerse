// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const buildFinalOutliers = (
  outliersData: Record<string, any>[],
  tableData: Record<string, any>[]
) => {
  const validDimensions = new Set(tableData.map((d) => d.dimension0))

  return outliersData.reduce((finalOutliers, outlier) => {
    if (!validDimensions.has(outlier.dimension0)) {
      return finalOutliers
    }

    const {
      dimension0,
      measure0,
      measure0_top_rank: topRank,
      measure0_bottom_rank: bottomRank
    } = outlier

    const isTopOutlier = topRank <= 10
    const isBottomOutlier = bottomRank <= 10

    // if data is ranked in top 10 in both (or neither), don't add to outliers
    if (isTopOutlier !== isBottomOutlier) {
      finalOutliers.push({ dimension0, measure0 })
    }
    return finalOutliers
  }, [])
}
