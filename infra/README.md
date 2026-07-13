# Lead capture infrastructure

The site is static (GitHub Pages), so it cannot hold AWS credentials or call SES
directly. Submissions instead POST to a Lambda Function URL, and the Lambda
sends the email using its execution role. Nothing secret reaches the browser.

```
Browser form -> SesLeadsProvider -> Lambda Function URL -> SES -> inboxes
```

## Deploying

```sh
AWS_PROFILE=FVC ./infra/deploy-lambda.sh
```

The script is idempotent -- it creates what is missing and updates what exists,
so re-run it after any change to `infra/lambda/src`. It prints the function URL
at the end. That value belongs in `.env.production` as `VITE_LEADS_ENDPOINT`.

## What it creates

Everything is tagged `Project=Citizens Revival`, in **us-east-2** (the region
where this account has SES production access; us-east-1 is still sandboxed).

| Resource | Name |
| --- | --- |
| Lambda | `citizens-revival-leads` |
| IAM role | `citizens-revival-leads-role` |
| Log group | `/aws/lambda/citizens-revival-leads` (30-day retention) |

The role may send mail as exactly one address (`noreply@fvcsolutions.com`) from
one verified identity, and write its own logs. Nothing else.

## Where mail goes

- **Full details** -> `citizensrevivalproject@gmail.com`, with a copy/paste block
  and `Reply-To` set to the submitter.
- **Technical summary** -> `jason@fvcsolutions.com`. Deliberately carries no
  personal data; it exists to show the pipeline ran. If a send *fails*, this
  address gets an alert instead, and the submission is written to CloudWatch so
  the lead is recoverable.

Timestamps in the emails are rendered in `America/New_York` (`format.ts`).

## Abuse protection

The endpoint is public, so it is defended in four cheap layers: a honeypot field
(`HoneypotField.tsx`), an `Origin` check, a per-IP rate limit (5/minute), and
reserved concurrency of 5 to cap the blast radius. None of these is a hard
security boundary on its own -- together they stop the realistic cases.

## Gotcha: public function URLs need two permissions

Since **October 2025**, a function URL with auth type `NONE` requires *both*
`lambda:InvokeFunctionUrl` **and** `lambda:InvokeFunction` (the latter
conditioned on `lambda:InvokedViaFunctionUrl`). Almost all documentation and
tutorials still show only the first grant. With just that one, every request
returns `403 Forbidden` even though the auth type is `NONE` and the policy looks
correct -- and the request never reaches the function, so there is nothing in the
logs to explain it.

`grant-public-invoke.mjs` adds both. It is a Node script rather than an
`aws lambda add-permission` call because the required
`--invoked-via-function-url` flag does not exist in older AWS CLI versions.
