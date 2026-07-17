#!/bin/bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0



# BUILD_NUMBER and ghprbPullId are provided by Jenkins

set -ex

ENV=dev
BASE_DIR=$PWD

while (( $# )); do
    case "$1" in
        --production)
            ENV=prod
            ;;
        --branch)
            shift
            BRANCH_NAME=$1
            ;;
        *)
            break ;;
    esac
    shift
done

DIST_DIR="frontend-$ENV"
GIT_HASH=$(git log -1 --format=%h)

npm run build:"$ENV"

case "${BRANCH_NAME}" in
    '')
        BUILD="${GIT_HASH}-unofficial"
        ;;
    'pr')
        BUILD="${BUILD_NUMBER}-pr${ghprbPullId}"
        ;;
    *)
        BUILD="${BUILD_NUMBER}-${BRANCH_NAME}"
        ;;
esac

SUFFIX=$BUILD-$ENV

rm -rf packages
mkdir -p packages

echo "$SUFFIX" > version.txt
echo "$GIT_HASH" >> version.txt

rm -f dist/servers.json
rm -rf $DIST_DIR
cp -R dist $DIST_DIR
cp "$BASE_DIR/version.txt" $DIST_DIR
zip -r "$BASE_DIR/packages/mapd2-dashboard-v2-$SUFFIX.zip" $DIST_DIR
