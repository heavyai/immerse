#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

#
# Assuming your branch name is in one of the following formats, this
# prepare-commit-msg script will automatically prepend [JIRA-ID] to your commit
# message:
#   name/JIRA-ID_description
#   name/JIRA-ID
#   JIRA-ID
#
# Must be enabled with:
#   git config --type bool immerse.prepare-commit-msg.add-jira-id true
set -Eeuo pipefail


if [ "$(git config --type bool immerse.prepare-commit-msg.add-jira-id)" != "true" ]; then
  exit 0
fi

GITHOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
source "$GITHOOK_DIR/utils-error-logging.sh"


COMMIT_MSG_FILE=$1
COMMIT_SOURCE=${2-}

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" == "HEAD" ]; then
  # are we in a rebase?
  if [ -d "$(git rev-parse --git-path rebase-merge)" ] || [ -d "$(git rev-parse --git-path rebase-apply)" ]; then
    # in a rebase, git branch --list returns the branch being rebased
    BRANCH=$(git branch --list | head -n 1)
  fi
fi

if [[ "$BRANCH" =~ ^([^/]+/)?([A-Z]+-[0-9]+) ]]; then
  TICKET=${BASH_REMATCH[2]}

  case "$COMMIT_SOURCE" in
    "message")
      # git commit -m
      if ! grep -qEv "(^\s*$|\s*\t*#)" "$COMMIT_MSG_FILE" || grep -qv "$TICKET" "$COMMIT_MSG_FILE"; then
        # empty message or already has the ticket number
        # Note: it's important to exit with an empty message so that the user
        # will get an error if they used -m without supplying a message.
        exit
      fi
      sed -i.bak -e "1s/^/[$TICKET] /" "$COMMIT_MSG_FILE"
      rm ${COMMIT_MSG_FILE}.bak
      ;;

    "template")
      ;;

    "merge")
      ;;

    "squash")
      ;;

    "commit")
      # -c, -C, or --amend
      ;;

    *)
      # default message (ie, "git commit")
      sed -i.bak -e "1s/^/[$TICKET] /" "$COMMIT_MSG_FILE"
      rm ${COMMIT_MSG_FILE}.bak
      ;;
  esac
fi
