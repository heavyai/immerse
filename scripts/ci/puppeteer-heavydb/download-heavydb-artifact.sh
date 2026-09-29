#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

readonly HEAVYDB_REPOSITORY="heavyai/heavydb"
readonly PRODUCT_WORKFLOW="rc-builder.yml"
readonly SCAN_REPOSITORY="heavyai/heavyai-binary-scan-testing"
readonly ARTIFACT_PATTERN='^heavyai-.*-ubuntu22\.04-x86_64-render-signed\.zip$'
readonly MINIMUM_ARTIFACT_BYTES=100000000

output_dir=""
requested_run_id=""

while (($#)); do
  case "$1" in
    --output-dir)
      output_dir="$2"
      shift 2
      ;;
    --run-id)
      requested_run_id="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

: "${output_dir:?--output-dir is required}"
: "${HEAVYAI_BINARY_SCAN_TOKEN:?HEAVYAI_BINARY_SCAN_TOKEN is required}"

api() {
  curl --fail --silent --show-error \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${HEAVYAI_BINARY_SCAN_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/$1"
}

find_artifact_for_run() {
  local run_id="$1"
  local run_json run_date directory_json artifact_name

  run_json="$(api "repos/${HEAVYDB_REPOSITORY}/actions/runs/${run_id}")"
  if [[ "$(jq -r '.path' <<<"${run_json}")" != ".github/workflows/${PRODUCT_WORKFLOW}" ]]; then
    echo "Run ${run_id} is not a Product Builder run" >&2
    return 1
  fi
  if [[ "$(jq -r '.head_branch' <<<"${run_json}")" != "master" ]] ||
    [[ "$(jq -r '.conclusion' <<<"${run_json}")" != "success" ]]; then
    echo "Run ${run_id} is not a successful master build" >&2
    return 1
  fi

  run_date="$(jq -r '.created_at[0:10]' <<<"${run_json}")"
  if ! directory_json="$(api "repos/${SCAN_REPOSITORY}/contents/runs/${run_date}/${run_id}" 2>/dev/null)"; then
    return 1
  fi

  artifact_name="$(
    jq -r '.[].name' <<<"${directory_json}" |
      awk -v pattern="${ARTIFACT_PATTERN}" '$0 ~ pattern { print; exit }'
  )"
  [[ -n "${artifact_name}" ]] || return 1

  printf '%s\t%s\t%s\n' "${run_id}" "${run_date}" "${artifact_name}"
}

resolve_artifact() {
  local candidate

  if [[ -n "${requested_run_id}" ]]; then
    find_artifact_for_run "${requested_run_id}"
    return
  fi

  while IFS= read -r candidate; do
    if find_artifact_for_run "${candidate}"; then
      return
    fi
    echo "Product Builder run ${candidate} has no published Ubuntu x86_64 bundle; trying the previous run" >&2
  done < <(
    api "repos/${HEAVYDB_REPOSITORY}/actions/workflows/${PRODUCT_WORKFLOW}/runs?branch=master&status=success&per_page=100" |
      jq -r '.workflow_runs[].id'
  )

  echo "No successful Product Builder run with a published Ubuntu x86_64 bundle was found" >&2
  return 1
}

IFS=$'\t' read -r run_id run_date artifact_name < <(resolve_artifact)
artifact_relative_path="runs/${run_date}/${run_id}/${artifact_name}"

mkdir -p "${output_dir}"
output_dir="$(cd "${output_dir}" && pwd)"
checkout_dir="${output_dir}/scan-repository"
bundle_dir="${output_dir}/bundle"

cleanup_credentials() {
  if [[ -d "${checkout_dir}/.git" ]]; then
    git -C "${checkout_dir}" remote set-url origin "https://github.com/${SCAN_REPOSITORY}.git" || true
  fi
}
trap cleanup_credentials EXIT

rm -rf "${checkout_dir}" "${bundle_dir}"
GIT_LFS_SKIP_SMUDGE=1 git clone --filter=blob:none --no-checkout \
  "https://x-access-token:${HEAVYAI_BINARY_SCAN_TOKEN}@github.com/${SCAN_REPOSITORY}.git" \
  "${checkout_dir}"
git -C "${checkout_dir}" sparse-checkout init --cone
git -C "${checkout_dir}" sparse-checkout set "runs/${run_date}/${run_id}"
git -C "${checkout_dir}" checkout
git -C "${checkout_dir}" lfs pull --include="${artifact_relative_path}" --exclude=""
cleanup_credentials

artifact_path="${checkout_dir}/${artifact_relative_path}"
artifact_size="$(wc -c <"${artifact_path}" | tr -d ' ')"
if ((artifact_size < MINIMUM_ARTIFACT_BYTES)); then
  echo "Downloaded artifact is only ${artifact_size} bytes; Git LFS content was not retrieved" >&2
  exit 1
fi

mkdir -p "${bundle_dir}"
unzip -q "${artifact_path}" -d "${bundle_dir}"
tarball_path="$(
  find "${bundle_dir}" -maxdepth 1 -type f -name '*.tar.gz' -print -quit
)"
if [[ -z "${tarball_path}" ]]; then
  echo "Signed bundle does not contain a product tarball" >&2
  exit 1
fi
bundle_path="${tarball_path}.bundle"
if [[ ! -f "${bundle_path}" ]]; then
  echo "Signed bundle does not contain $(basename "${bundle_path}")" >&2
  exit 1
fi

cosign verify-blob \
  --bundle="${bundle_path}" \
  --certificate-identity-regexp='https://github.com/heavyai/heavydb/.github/workflows/rc-builder.yml@refs/heads/.*' \
  --certificate-oidc-issuer='https://token.actions.githubusercontent.com' \
  "${tarball_path}"

rm -rf "${checkout_dir}"

echo "Verified HeavyDB product from run ${run_id}: $(basename "${tarball_path}")"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "run_id=${run_id}"
    echo "artifact_name=${artifact_name}"
    echo "tarball=${tarball_path}"
  } >>"${GITHUB_OUTPUT}"
fi
