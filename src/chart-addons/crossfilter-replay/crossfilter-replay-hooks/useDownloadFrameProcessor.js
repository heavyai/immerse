// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useRef } from "react"
import html2canvas from "html2canvas"
import GIFEncoder from "gif-encoder-2"

function Uint8ToString(u8a) {
  const CHUNK_SZ = 0x8000
  const c = []
  for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)))
  }
  return c.join("")
}

export const useDownloadFrameProcessor = ({ downloadId, looping = false }) => {
  const gif = useRef(undefined)

  const downloader = useCallback(
    async (animationInfo, duration, frames) => {
      const elementId = `chart${downloadId}`

      const canvas = await html2canvas(document.getElementById(elementId))

      if (animationInfo.frame === 1) {
        gif.current = new GIFEncoder(canvas.width, canvas.height)
        gif.current?.setRepeat(looping ? -1 : 0) // eslint-disable-line
        gif.current?.setDelay(duration / frames) // eslint-disable-line
        gif.current?.start() // eslint-disable-line
      }

      gif.current?.addFrame(canvas.getContext("2d")) // eslint-disable-line

      if (animationInfo.frame === frames && gif.current) {
        gif.current.finish()
        const buffer = gif.current.out.getData()

        const b64encoded = btoa(Uint8ToString(buffer))

        const fileType = "image/gif"
        const b64Str = `data:${fileType};base64,${b64encoded}`

        const fakeLink = window.document.createElement("a")
        fakeLink.style = "display:none;"
        fakeLink.download = `${elementId}.gif`

        fakeLink.href = b64Str

        document.body.appendChild(fakeLink)
        fakeLink.click()
        document.body.removeChild(fakeLink)

        fakeLink.remove()
        gif.current = undefined
      }
    },
    [downloadId, looping]
  )

  return downloadId ? downloader : undefined
}
