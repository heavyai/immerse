// Adapted from https://github.com/mapbox/s3urls/releases/tag/v1.5.3

const parse = require("url").parse

const s3UrlParser = {
  fromUrl(url) {
    const uri = parse(url)
    uri.pathname = decodeURIComponent(uri.pathname || "")

    const hostMatch = uri.hostname.match(
      /(\.?)s3[.-](\w{2}-\w{4,9}-\d)?\.?amazonaws\.com/
    )

    let bucket = ""
    let key = ""

    if (uri.protocol === "s3:") {
      bucket = uri.hostname
      key = uri.pathname.slice(1)
    } else if (hostMatch && hostMatch[1] === "") {
      bucket = uri.pathname.split("/")[1]
      key = uri.pathname.split("/").slice(2).join("/")
    } else if (hostMatch && hostMatch[1] === ".") {
      const match = uri.hostname.replace(
        /\.s3[.-](\w{2}-\w{4,9}-\d\.)?amazonaws\.com(\.cn)?/,
        ""
      )
      if (match.length) {
        bucket = match
      } else {
        bucket = uri.hostname.split(".")[0]
      }
      key = uri.pathname.slice(1)
    }

    return {
      Region: hostMatch && hostMatch[2],
      Bucket: bucket,
      Key: key
    }
  },

  toUrl(bucket, key) {
    return {
      s3: ["s3:/", bucket, key].join("/"),
      "bucket-in-path": ["https://s3.amazonaws.com", bucket, key].join("/"),
      "bucket-in-host": ["https:/", `${bucket}.s3.amazonaws.com`, key].join("/")
    }
  },

  convert(url, to) {
    const params = s3UrlParser.fromUrl(url)
    return s3UrlParser.toUrl(params.Bucket, params.Key)[to]
  },

  valid(url) {
    const params = s3UrlParser.fromUrl(url)
    return params.Bucket && params.Key
  }
}

export default s3UrlParser
