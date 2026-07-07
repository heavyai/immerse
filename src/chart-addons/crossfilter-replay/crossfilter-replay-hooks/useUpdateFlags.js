// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const useUpdateFlags = ({
  recalculatedFrames,
  locked,
  camera,
  userGeneratedFilter,
  filter,
  internalCrossFilter
}) => {
  const validFilterUpdate = !locked && userGeneratedFilter && !camera
  const needsToSetFrames = validFilterUpdate && recalculatedFrames !== frames
  const needsToUpdateCrossfilter =
    validFilterUpdate && filter !== internalCrossFilter

  return { needsToSetFrames, needsToUpdateCrossfilter }
}
