/**
 * Grants the public invoke permissions a function URL with auth type NONE needs.
 *
 * Since October 2025, Lambda requires BOTH statements below. The widely
 * documented single `lambda:InvokeFunctionUrl` grant is no longer sufficient:
 * a URL created after that change returns 403 for every request, even though
 * the auth type is NONE and the policy looks correct.
 *
 * This is a Node script rather than `aws lambda add-permission` because the
 * `--invoked-via-function-url` flag only exists in recent AWS CLI versions, and
 * without that condition the InvokeFunction grant would be far too broad.
 *
 * Usage: node grant-public-invoke.mjs <function-name> <region>
 */
import {
  AddPermissionCommand,
  LambdaClient,
  RemovePermissionCommand,
} from '@aws-sdk/client-lambda';

const [functionName, region] = process.argv.slice(2);

if (!functionName || !region) {
  console.error('Usage: node grant-public-invoke.mjs <function-name> <region>');
  process.exit(1);
}

const client = new LambdaClient({ region });

/** Statement ids Lambda itself uses when the console creates a public URL. */
const STATEMENTS = [
  {
    StatementId: 'FunctionURLAllowPublicAccess',
    Action: 'lambda:InvokeFunctionUrl',
    Principal: '*',
    FunctionUrlAuthType: 'NONE',
  },
  {
    StatementId: 'FunctionURLInvokeAllowPublicAccess',
    Action: 'lambda:InvokeFunction',
    Principal: '*',
    // Restricts this grant to calls arriving through the function URL, so the
    // function cannot be invoked directly through the Lambda API by others.
    InvokedViaFunctionUrl: true,
  },
];

/** Left behind by an earlier version of this script; superseded by the two above. */
const LEGACY_STATEMENT_ID = 'AllowPublicFunctionUrlInvoke';

async function removeIfPresent(statementId) {
  try {
    await client.send(
      new RemovePermissionCommand({ FunctionName: functionName, StatementId: statementId }),
    );
    console.log(`    Removed stale statement ${statementId}`);
  } catch (error) {
    if (error.name !== 'ResourceNotFoundException') {
      throw error;
    }
  }
}

async function grant(statement) {
  try {
    await client.send(new AddPermissionCommand({ FunctionName: functionName, ...statement }));
    console.log(`    Granted ${statement.Action} (${statement.StatementId})`);
  } catch (error) {
    if (error.name === 'ResourceConflictException') {
      console.log(`    ${statement.StatementId} already present`);
      return;
    }
    throw error;
  }
}

await removeIfPresent(LEGACY_STATEMENT_ID);

for (const statement of STATEMENTS) {
  await grant(statement);
}
