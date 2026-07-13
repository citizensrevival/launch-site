#!/bin/bash
#
# Deploys the lead-capture Lambda and its public Function URL.
#
# Idempotent: creates what is missing, updates what exists. Safe to re-run.
# Requires: AWS_PROFILE with permission over IAM, Lambda, Logs and SES.
#
# Usage: AWS_PROFILE=FVC ./infra/deploy-lambda.sh

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration -- none of this is secret.
# ---------------------------------------------------------------------------
REGION="us-east-2"
FUNCTION_NAME="citizens-revival-leads"
ROLE_NAME="citizens-revival-leads-role"
POLICY_NAME="citizens-revival-leads-policy"
LOG_GROUP="/aws/lambda/${FUNCTION_NAME}"

FROM_EMAIL="noreply@fvcsolutions.com"
SES_IDENTITY="fvcsolutions.com"
LEADS_EMAIL="citizensrevivalproject@gmail.com"
ADMIN_EMAIL="jason@fvcsolutions.com"
ALLOWED_ORIGINS="https://citizens.fvcsolutions.com,http://localhost:3000"

# Caps the blast radius if the endpoint is ever abused: at most this many
# concurrent executions, no matter how hard someone hammers it.
RESERVED_CONCURRENCY=5
MEMORY_SIZE=256
TIMEOUT=10
RUNTIME="nodejs22.x"
LOG_RETENTION_DAYS=30

TAG_KEY="Project"
TAG_VALUE="Citizens Revival"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAMBDA_DIR="${SCRIPT_DIR}/lambda"
ZIP_FILE="${LAMBDA_DIR}/dist/function.zip"

# ---------------------------------------------------------------------------
# Preflight
# ---------------------------------------------------------------------------
echo "==> Checking AWS credentials"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
echo "    Account: ${ACCOUNT_ID}  Region: ${REGION}"

echo "==> Verifying SES can send from ${FROM_EMAIL}"
IDENTITY_STATUS="$(aws sesv2 get-email-identity \
  --email-identity "${SES_IDENTITY}" \
  --region "${REGION}" \
  --query 'VerifiedForSendingStatus' \
  --output text 2>/dev/null || echo "MISSING")"

if [ "${IDENTITY_STATUS}" != "True" ]; then
  echo "    ERROR: SES identity ${SES_IDENTITY} is not verified for sending in ${REGION} (status: ${IDENTITY_STATUS})"
  exit 1
fi
echo "    ${SES_IDENTITY} is verified"

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
echo "==> Building the function bundle"
(
  cd "${LAMBDA_DIR}"
  npm install --silent
  npm run typecheck
  npm run build
)

rm -f "${ZIP_FILE}"
(
  cd "${LAMBDA_DIR}/dist"
  zip -q -r "function.zip" "index.js"
)
echo "    Bundle: $(du -h "${ZIP_FILE}" | cut -f1)"

# ---------------------------------------------------------------------------
# IAM role
# ---------------------------------------------------------------------------
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

if aws iam get-role --role-name "${ROLE_NAME}" > /dev/null 2>&1; then
  echo "==> IAM role ${ROLE_NAME} already exists"
  ROLE_IS_NEW=false
else
  echo "==> Creating IAM role ${ROLE_NAME}"
  aws iam create-role \
    --role-name "${ROLE_NAME}" \
    --description "Execution role for the Citizens Revival lead-capture Lambda" \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": { "Service": "lambda.amazonaws.com" },
        "Action": "sts:AssumeRole"
      }]
    }' \
    --tags "Key=${TAG_KEY},Value=${TAG_VALUE}" \
    > /dev/null
  ROLE_IS_NEW=true
fi

# Least privilege: this role may send mail as exactly one address, from one
# identity, and write its own logs. Nothing else.
echo "==> Writing inline policy ${POLICY_NAME}"
aws iam put-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-name "${POLICY_NAME}" \
  --policy-document "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [
      {
        \"Sid\": \"SendAsCitizensRevival\",
        \"Effect\": \"Allow\",
        \"Action\": [\"ses:SendEmail\"],
        \"Resource\": \"arn:aws:ses:${REGION}:${ACCOUNT_ID}:identity/${SES_IDENTITY}\",
        \"Condition\": {
          \"StringEquals\": { \"ses:FromAddress\": \"${FROM_EMAIL}\" }
        }
      },
      {
        \"Sid\": \"WriteOwnLogs\",
        \"Effect\": \"Allow\",
        \"Action\": [\"logs:CreateLogStream\", \"logs:PutLogEvents\"],
        \"Resource\": \"arn:aws:logs:${REGION}:${ACCOUNT_ID}:log-group:${LOG_GROUP}:*\"
      }
    ]
  }"

if [ "${ROLE_IS_NEW}" = true ]; then
  echo "    Waiting 10s for IAM role propagation"
  sleep 10
fi

# ---------------------------------------------------------------------------
# Log group (pre-created so we can set retention and tags)
# ---------------------------------------------------------------------------
echo "==> Ensuring log group ${LOG_GROUP}"
if ! aws logs create-log-group --log-group-name "${LOG_GROUP}" --region "${REGION}" > /dev/null 2>&1; then
  echo "    Already exists"
fi

aws logs put-retention-policy \
  --log-group-name "${LOG_GROUP}" \
  --retention-in-days "${LOG_RETENTION_DAYS}" \
  --region "${REGION}"

aws logs tag-resource \
  --resource-arn "arn:aws:logs:${REGION}:${ACCOUNT_ID}:log-group:${LOG_GROUP}" \
  --tags "${TAG_KEY}=${TAG_VALUE}" \
  --region "${REGION}" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Lambda function
# ---------------------------------------------------------------------------
# JSON, not CLI shorthand: ALLOWED_ORIGINS contains a comma, and shorthand
# (Variables={K=V,K=V}) treats every comma as a key separator.
ENV_VARS="{\"Variables\":{\"FROM_EMAIL\":\"${FROM_EMAIL}\",\"LEADS_EMAIL\":\"${LEADS_EMAIL}\",\"ADMIN_EMAIL\":\"${ADMIN_EMAIL}\",\"ALLOWED_ORIGINS\":\"${ALLOWED_ORIGINS}\"}}"
TAGS_JSON="{\"${TAG_KEY}\":\"${TAG_VALUE}\"}"
DESCRIPTION="Lead capture for the Citizens Revival site. Emails submissions via SES."

if aws lambda get-function --function-name "${FUNCTION_NAME}" --region "${REGION}" > /dev/null 2>&1; then
  echo "==> Updating function code"
  aws lambda update-function-code \
    --function-name "${FUNCTION_NAME}" \
    --zip-file "fileb://${ZIP_FILE}" \
    --region "${REGION}" \
    --publish \
    > /dev/null

  aws lambda wait function-updated --function-name "${FUNCTION_NAME}" --region "${REGION}"

  echo "==> Updating function configuration"
  aws lambda update-function-configuration \
    --function-name "${FUNCTION_NAME}" \
    --role "${ROLE_ARN}" \
    --handler "index.handler" \
    --runtime "${RUNTIME}" \
    --memory-size "${MEMORY_SIZE}" \
    --timeout "${TIMEOUT}" \
    --description "${DESCRIPTION}" \
    --environment "${ENV_VARS}" \
    --region "${REGION}" \
    > /dev/null

  aws lambda wait function-updated --function-name "${FUNCTION_NAME}" --region "${REGION}"

  aws lambda tag-resource \
    --resource "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}" \
    --tags "${TAGS_JSON}" \
    --region "${REGION}"
else
  echo "==> Creating function ${FUNCTION_NAME}"
  # A freshly created role is not immediately assumable by Lambda, so retry --
  # but surface the actual error each time rather than assuming that's the cause.
  ATTEMPT=1
  MAX_ATTEMPTS=6
  while true; do
    if CREATE_ERROR="$(aws lambda create-function \
      --function-name "${FUNCTION_NAME}" \
      --runtime "${RUNTIME}" \
      --role "${ROLE_ARN}" \
      --handler "index.handler" \
      --zip-file "fileb://${ZIP_FILE}" \
      --memory-size "${MEMORY_SIZE}" \
      --timeout "${TIMEOUT}" \
      --description "${DESCRIPTION}" \
      --environment "${ENV_VARS}" \
      --tags "${TAGS_JSON}" \
      --region "${REGION}" 2>&1 > /dev/null)"; then
      break
    fi

    if [ "${ATTEMPT}" -ge "${MAX_ATTEMPTS}" ]; then
      echo "    ERROR: create-function failed after ${ATTEMPT} attempts:"
      echo "    ${CREATE_ERROR}"
      exit 1
    fi

    echo "    Attempt ${ATTEMPT}/${MAX_ATTEMPTS} failed: ${CREATE_ERROR}"
    ATTEMPT=$((ATTEMPT + 1))
    sleep 5
  done

  aws lambda wait function-active --function-name "${FUNCTION_NAME}" --region "${REGION}"
fi

echo "==> Setting reserved concurrency to ${RESERVED_CONCURRENCY}"
aws lambda put-function-concurrency \
  --function-name "${FUNCTION_NAME}" \
  --reserved-concurrent-executions "${RESERVED_CONCURRENCY}" \
  --region "${REGION}" \
  > /dev/null

# ---------------------------------------------------------------------------
# Function URL
# ---------------------------------------------------------------------------
CORS_CONFIG="{\"AllowOrigins\":[\"https://citizens.fvcsolutions.com\",\"http://localhost:3000\"],\"AllowMethods\":[\"POST\"],\"AllowHeaders\":[\"content-type\"],\"MaxAge\":300}"

if aws lambda get-function-url-config --function-name "${FUNCTION_NAME}" --region "${REGION}" > /dev/null 2>&1; then
  echo "==> Updating Function URL config"
  aws lambda update-function-url-config \
    --function-name "${FUNCTION_NAME}" \
    --auth-type NONE \
    --cors "${CORS_CONFIG}" \
    --region "${REGION}" \
    > /dev/null
else
  echo "==> Creating Function URL"
  aws lambda create-function-url-config \
    --function-name "${FUNCTION_NAME}" \
    --auth-type NONE \
    --cors "${CORS_CONFIG}" \
    --region "${REGION}" \
    > /dev/null
fi

# Without these, an unauthenticated Function URL returns 403 to every request.
# Two grants are required (see grant-public-invoke.mjs) -- the single
# InvokeFunctionUrl grant that most documentation shows is no longer enough.
echo "==> Granting public invoke permissions"
(
  cd "${LAMBDA_DIR}"
  node grant-public-invoke.mjs "${FUNCTION_NAME}" "${REGION}"
)

FUNCTION_URL="$(aws lambda get-function-url-config \
  --function-name "${FUNCTION_NAME}" \
  --region "${REGION}" \
  --query 'FunctionUrl' \
  --output text)"

echo ""
echo "Deployed."
echo ""
echo "  Function URL : ${FUNCTION_URL}"
echo "  Leads to     : ${LEADS_EMAIL}"
echo "  Admin to     : ${ADMIN_EMAIL}"
echo "  Sending as   : ${FROM_EMAIL}"
echo ""
echo "Set this in .env.production so the site build picks it up:"
echo ""
echo "  VITE_LEADS_ENDPOINT=${FUNCTION_URL}"
echo ""
