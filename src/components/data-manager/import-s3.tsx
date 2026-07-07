// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  FC,
  useEffect,
  useState,
  MouseEvent,
  ChangeEvent,
  useCallback
} from "react"
import { connect } from "react-redux"
import { Dispatch } from "redux"
import { Link } from "react-router-dom"
import { isEmpty, isNil } from "lodash"
import { Checkbox } from "@rmwc/checkbox"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import { TextField } from "widgets/text-field/TextField"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { useParams, generatePath } from "react-router"
import { TSourceType } from "@heavyai/connector/dist/browser-connector"
import s3Regions from "components/table-importer/s3-regions"
import s3UrlParser from "components/table-importer/s3-url-parser"
import SegmentedControl from "components/segmented-control/segmented-control"
import ImportS3Icon from "components/svg-icons/import-s3"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import { ROUTE_DATA_MANAGEMENT_IMPORT } from "routes/paths"
import { noop } from "utils/helpers"
import { useSourceType } from "./hooks/use-source-type"
import { submitS3Connector as submitS3ConnectorAction } from "../../actions/importer-action-creators"
import { IMPORT_ACTIONS, RegionOption, SOURCE_TYPE_OPTIONS } from "./constants"
import "./import-form.scss"
import "./import-s3.scss"

import { DataManagerImportRouteParams } from "./import-table"
import {
  useConnectPreviewPath,
  useImportPreviewPath
} from "./hooks/use-preview-path"

const mapStateToProps = () => ({})

type SubmitS3ConnectorArg = {
  filenames: string[]
  region: string
  requiresCredentials: boolean
  accessKey: string
  secretKey: string
  bucket: string
  path: string
  sourceType: TSourceType
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  submitS3Connector: ({
    filenames,
    region,
    requiresCredentials,
    accessKey,
    secretKey,
    bucket,
    path,
    sourceType
  }: SubmitS3ConnectorArg) => {
    dispatch(
      submitS3ConnectorAction(
        filenames,
        region,
        bucket,
        path,
        requiresCredentials,
        accessKey,
        secretKey,
        sourceType
      )
    )
  }
})

enum S3FormType {
  LINK = "LINK",
  PIECEWISE = "PIECEWISE"
}

type ImportS3Props = {
  submitS3Connector: ({
    filenames,
    region,
    requiresCredentials,
    accessKey,
    secretKey
  }: {
    filenames: string[]
    region: string | null
    requiresCredentials: boolean
    accessKey: string
    secretKey: string
  }) => void
}

export type S3FormFields = {
  url: string
  region: string
  bucket: string
  path: string
  accessKey: string
  secretKey: string
}

type S3FormFieldsValidation = {
  url: boolean
  region: boolean
  bucket: boolean
  path: boolean
  accessKey: boolean
  secretKey: boolean
}

type S3ConnectorUrlParams = {
  Region: string | null
  Bucket: string
  Key: string
}

const DEFAULT_INPUTS_VALID: S3FormFieldsValidation = {
  url: false,
  region: false,
  bucket: false,
  // An empty path field is valid (imports entire bucket)
  path: true,
  accessKey: false,
  secretKey: false
}

const ImportS3: FC<ImportS3Props> = ({ submitS3Connector }) => {
  const [subform, setSubform] = useState<S3FormType>(S3FormType.PIECEWISE)
  const [requiresCredentials, setRequiresCredentials] = useState<boolean>(true)
  const [formInputs, setFormInputs] = useState({
    url: "",
    region: "",
    bucket: "",
    path: "",
    accessKey: "",
    secretKey: ""
  })
  const [formInputsValid, setFormInputsValid] = useState<
    S3FormFieldsValidation
  >(DEFAULT_INPUTS_VALID)
  const [filesToImport, setFilesToImport] = useState<string[]>([])
  const params = useParams<DataManagerImportRouteParams>()
  const [fieldsValid, setFieldsValid] = useState<boolean>(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [parsedRegion, setParsedRegion] = useState("")
  const { sourceType, setSourceType, disableSourceTypeField } = useSourceType(
    subform === S3FormType.PIECEWISE ? formInputs.path : formInputs.url
  )

  const validateFields = useCallback(() => {
    const inputsValid: S3FormFieldsValidation = { ...DEFAULT_INPUTS_VALID }

    if (subform === S3FormType.LINK) {
      inputsValid.url = !isEmpty(formInputs.url)
      inputsValid.region = inputsValid.region = !(
        isNil(formInputs.region) || isEmpty(formInputs.region)
      )
      inputsValid.bucket = true
    } else if (subform === S3FormType.PIECEWISE) {
      inputsValid.url = true
      inputsValid.region = !(
        isNil(formInputs.region) || isEmpty(formInputs.region)
      )
      inputsValid.bucket = !isEmpty(formInputs.bucket)
    }

    if (requiresCredentials) {
      inputsValid.accessKey = !isEmpty(formInputs.accessKey)
      inputsValid.secretKey = !isEmpty(formInputs.secretKey)
    } else {
      inputsValid.accessKey = true
      inputsValid.secretKey = true
    }

    setFieldsValid(
      Object.keys(inputsValid).every((field) => inputsValid[field]) &&
        sourceType !== null
    )
    return inputsValid
  }, [
    subform,
    requiresCredentials,
    formInputs.url,
    formInputs.region,
    formInputs.bucket,
    formInputs.accessKey,
    formInputs.secretKey,
    sourceType
  ])

  useEffect(() => {
    validateFields()
  }, [
    formInputs.url,
    formInputs.region,
    formInputs.bucket,
    formInputs.path,
    formInputs.accessKey,
    formInputs.secretKey,
    validateFields
  ])

  const parseS3Url = (url: string) => {
    const urlParams: S3ConnectorUrlParams = s3UrlParser.fromUrl(url)
    const region = urlParams?.Region || ""
    const bucket = urlParams?.Bucket || ""
    const path = urlParams?.Key || ""

    const formInputsUpdate = {
      ...formInputs,
      url,
      bucket,
      path
    }

    if (region) {
      formInputsUpdate.region = region
    }

    const formInputsValidityUpdate = {
      ...formInputsValid,
      region: Boolean(region || formInputsUpdate.region),
      bucket: Boolean(bucket),
      path: Boolean(path),
      url: Boolean(url)
    }

    setFormInputs(formInputsUpdate)
    setFormInputsValid(formInputsValidityUpdate)
    setParsedRegion(region)

    return bucket && s3UrlParser.toUrl(bucket, path || "").s3
  }

  const setS3Url = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.currentTarget.value

    try {
      const s3Url = parseS3Url(url)
      setFilesToImport(s3Url ? [s3Url] : [])
    } catch {
      setFormInputs({ ...formInputs, url })
      setParsedRegion("")
      setFormInputsValid({ ...formInputsValid, url: false })
    }
  }

  const setS3Region = (region: RegionOption) => {
    setFormInputs({ ...formInputs, region: region.label })
    setFormInputsValid({ ...formInputsValid, region: true })
  }

  const stripTrailingSlash = (str = "") =>
    str.charAt(str.length - 1) === "/" ? str.slice(0, str.length - 1) : str

  const setS3Bucket = (e: ChangeEvent<HTMLInputElement>) => {
    const bucket = stripTrailingSlash(e.currentTarget.value)
    const path = formInputs.path

    const s3Url = bucket && s3UrlParser.toUrl(bucket, path || "").s3

    setFormInputs({ ...formInputs, bucket })
    setFilesToImport(s3Url ? [s3Url] : [])
  }

  const setS3Path = (e: ChangeEvent<HTMLInputElement>) => {
    const bucket = formInputs.bucket
    const rawPath = e.currentTarget.value
    const path = rawPath[0] === "/" ? rawPath.slice(1) : rawPath

    const s3Url = bucket && s3UrlParser.toUrl(bucket, path || "").s3

    setFormInputs({ ...formInputs, path })
    setFilesToImport(s3Url ? [s3Url] : [])
  }

  const setS3RequiresCredentials = (e: ChangeEvent<HTMLInputElement>) => {
    setRequiresCredentials(e.currentTarget.checked)
  }

  const setS3AccessKey = (e: ChangeEvent<HTMLInputElement>) => {
    const accessKey = e.currentTarget.value

    setFormInputs({ ...formInputs, accessKey })
  }

  const setS3SecretKey = (e: ChangeEvent<HTMLInputElement>) => {
    const secretKey = e.currentTarget.value

    setFormInputs({ ...formInputs, secretKey })
  }

  const submitForm = (e: MouseEvent): boolean | void => {
    setFormSubmitted(true)
    setFormInputsValid(validateFields())
    if (!fieldsValid) {
      return e.preventDefault()
    }

    const filenames =
      subform === S3FormType.PIECEWISE
        ? [s3UrlParser.toUrl(formInputs.bucket, formInputs.path || "").s3]
        : filesToImport
    submitS3Connector({
      filenames,
      region: formInputs.region,
      requiresCredentials,
      accessKey: formInputs.accessKey,
      secretKey: formInputs.secretKey,
      bucket: formInputs.bucket,
      path: formInputs.path,
      sourceType: sourceType?.value
    })
    return true
  }

  const connectSupportedForFileType = [
    TSourceType.DELIMITED_FILE,
    TSourceType.PARQUET_FILE
  ].includes(sourceType?.value)

  const connectButton = (
    <Link
      to={useConnectPreviewPath(params)}
      onClick={(e) => {
        if (connectSupportedForFileType) {
          submitForm(e)
        } else {
          e.preventDefault()
        }
      }}
    >
      <PrimaryButton
        disabled={!connectSupportedForFileType || !fieldsValid}
        onClick={noop}
      >
        Connect
      </PrimaryButton>
    </Link>
  )

  return (
    <div className="import-form import-s3">
      <header>
        <ImportS3Icon />
        <h2>Amazon S3</h2>
      </header>

      <SegmentedControl
        name="import-s3-form-type"
        options={[
          {
            label: "S3 Region | Bucket | Path",
            value: S3FormType.PIECEWISE,
            default: subform === S3FormType.PIECEWISE
          },
          {
            label: "S3 Link",
            value: S3FormType.LINK,
            default: subform === S3FormType.LINK
          }
        ]}
        setValue={setSubform}
      />

      {subform === S3FormType.PIECEWISE ? (
        <>
          <div>
            <Tooltip
              showArrow
              content="Region cannot be empty"
              open={formSubmitted && !formInputsValid.region}
            >
              <MultiSelect
                placeholder="Select AWS Region*"
                value={s3Regions.find(
                  (option) => option.label === formInputs.region
                )}
                options={s3Regions}
                onChange={setS3Region}
                isDisabled={Boolean(parsedRegion)}
                testid="import-table-s3-autocomplete"
              />
            </Tooltip>
          </div>
          <div>
            <Tooltip
              showArrow
              content="Bucket name cannot be empty"
              open={formSubmitted && !formInputsValid.bucket}
            >
              <TextField
                invalid={formSubmitted && !formInputsValid.bucket}
                label="Bucket*"
                value={formInputs.bucket}
                onChange={setS3Bucket}
                onInput={() =>
                  setFormInputsValid({ ...formInputsValid, bucket: true })
                }
              />
            </Tooltip>
          </div>
          <div className="import-s3__path import-s3__has-info">
            <TextField
              label="Path*"
              value={formInputs.path}
              onChange={setS3Path}
            />

            <span>/</span>

            <Tooltip
              align="topLeft"
              content={
                <>
                  /
                  <br />
                  Leave this blank to import the full bucket.
                  <br />
                  <br />
                  /folder/
                  <br />
                  Enter a directory to import the contents of that directory.
                  <br />
                  <br />
                  /folder/filename.csv
                  <br />
                  To load a specific file, include the exact file name.
                  <br />
                  <br />
                  /folder/filename.zip
                  <br />
                  You can also include a compressed file.
                  <br />
                  <br />
                </>
              }
            >
              <Icon icon="info" />
            </Tooltip>
          </div>
        </>
      ) : (
        <>
          <div className="import-s3__has-info">
            <Tooltip
              showArrow
              content="Link URL must be a valid url to an S3 resource"
              open={formSubmitted && !formInputsValid.url}
            >
              <TextField
                invalid={formSubmitted && !formInputsValid.url}
                label="Full Link URL*"
                value={formInputs.url}
                onChange={setS3Url}
                onInput={() =>
                  setFormInputsValid({ ...formInputsValid, url: true })
                }
              />
            </Tooltip>
            <Tooltip
              align="topLeft"
              content={
                <>
                  This can be found by using the &apos;Copy URL&apos; button for
                  the selected file in the AWS S3 Console.
                  <br />
                  Example:
                  &quot;https://s3-us-west-1.amazonaws.com/bucket-name/folder/filename.csv&quot;
                </>
              }
            >
              <Icon icon="info" />
            </Tooltip>
          </div>
          <Tooltip
            showArrow
            content="Region cannot be empty"
            open={formSubmitted && !formInputsValid.region}
          >
            <MultiSelect
              placeholder="Select AWS Region*"
              value={
                s3Regions.find(
                  (option) => option.label === formInputs.region
                ) || null
              }
              options={s3Regions}
              onChange={setS3Region}
              isDisabled={Boolean(parsedRegion)}
              testid="import-table-s3-autocomplete"
            />
          </Tooltip>
        </>
      )}

      <MultiSelect
        placeholder="File Type*"
        value={sourceType}
        options={SOURCE_TYPE_OPTIONS}
        onChange={setSourceType}
        isDisabled={disableSourceTypeField}
      />

      <label className="import-s3__private">
        <Checkbox
          checked={requiresCredentials}
          onChange={setS3RequiresCredentials}
        />
        Private data
      </label>

      <div>
        <Tooltip
          showArrow
          content="Access key cannot be empty"
          open={
            requiresCredentials && formSubmitted && !formInputsValid.accessKey
          }
        >
          <TextField
            invalid={
              requiresCredentials && formSubmitted && !formInputsValid.accessKey
            }
            disabled={!requiresCredentials}
            label={`Access Key${requiresCredentials ? "*" : ""}`}
            value={formInputs.accessKey}
            onChange={setS3AccessKey}
            onInput={() =>
              setFormInputsValid({ ...formInputsValid, accessKey: true })
            }
          />
        </Tooltip>
      </div>
      <div>
        <Tooltip
          showArrow
          content="Secret key cannot be empty"
          open={
            requiresCredentials && formSubmitted && !formInputsValid.secretKey
          }
        >
          <TextField
            invalid={
              requiresCredentials && formSubmitted && !formInputsValid.secretKey
            }
            disabled={!requiresCredentials}
            label={`Secret Key${requiresCredentials ? "*" : ""}`}
            value={formInputs.secretKey}
            onChange={setS3SecretKey}
            onInput={() =>
              setFormInputsValid({ ...formInputsValid, secretKey: true })
            }
          />
        </Tooltip>
      </div>

      <footer>
        <Link to={generatePath(ROUTE_DATA_MANAGEMENT_IMPORT, params)}>
          <SecondaryButton onClick={noop}>Cancel</SecondaryButton>
        </Link>
        <div>
          <Link to={useImportPreviewPath(params)} onClick={submitForm}>
            <PrimaryButton disabled={!fieldsValid} onClick={noop}>
              Import
            </PrimaryButton>
          </Link>
          {params.importAction === IMPORT_ACTIONS.CREATE &&
          (!sourceType?.value || connectSupportedForFileType) ? (
            connectButton
          ) : (
            <Tooltip
              content={
                "Connect is not currently supported for raster or geospatial file types"
              }
            >
              {connectButton}
            </Tooltip>
          )}
        </div>
      </footer>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportS3)
