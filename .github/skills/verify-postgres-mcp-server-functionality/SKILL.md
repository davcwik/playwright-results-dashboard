---
name: verify-postgres-mcp-server-functionality
description: 'Verify a PostgreSQL MCP server is configured, connected, and functional. Use when checking MCP startup, active process state, PostgreSQL reachability, tool discovery, or read-only query execution.'
argument-hint: 'Optional: provide the MCP config path or PostgreSQL MCP package name'
user-invocable: true
disable-model-invocation: false
---

# Verify PostgreSQL MCP Server Functionality

Use this workflow to verify the PostgreSQL MCP server in three separate ways:

1. The repository configuration points to a valid launcher.
2. The MCP server is currently managed by VS Code and running.
3. The server can connect to PostgreSQL and execute a harmless read-only query.

## Security Requirements

- Never print, log, paste, or commit `DATABASE_URL`, passwords, tokens, or the contents of `.env.local`.
- Do not use `ps` output without redacting connection strings and environment values.
- Use an environment file with `node --env-file=.env.local` or the configured environment loader. Keep credentials out of command-line arguments whenever possible.
- Only run read-only verification SQL, such as `SELECT 1 AS connection_check`.
- Do not run migrations, writes, `DROP`, `TRUNCATE`, `DELETE`, `UPDATE`, `INSERT`, or administrative commands during verification.

## Procedure

### 1. Inspect the configuration

Read `.vscode/mcp.json` and confirm the PostgreSQL server entry has:

- A valid command and arguments.
- An environment file or environment variable source.
- No hardcoded credentials.
- A package that is installed in the repository when the command references `node_modules`.

For the `@yawlabs/postgres-mcp` setup, the expected launcher is equivalent to:

```json
{
  "command": "node",
  "args": [
    "--env-file=.env.local",
    "node_modules/@yawlabs/postgres-mcp/dist/index.js"
  ]
}
```

### 2. Check the managed process

Look for the configured PostgreSQL MCP process using a process listing. Redact any connection strings before displaying output:

```sh
ps axo pid,command | grep -E '[p]ostgres-mcp|[m]cp-server-postgres|[e]nvmcp'
```

A process is evidence that VS Code started the server, but process presence alone does not prove database functionality.

### 3. Discover the MCP tools

Send an MCP `initialize` request followed by `tools/list` to the configured launcher. Confirm:

- The response is valid JSON-RPC.
- The server reports its name and version.
- At least one database read tool is available.

For `@yawlabs/postgres-mcp`, the read-only SQL tool is `pg_readonly`. Older PostgreSQL MCP packages may expose a tool named `query`; use the name returned by `tools/list` rather than assuming it.

### 4. Run a read-only connectivity check

Call the discovered read-only SQL tool with:

```sql
SELECT 1 AS connection_check
```

Pass criteria:

- The MCP response is successful and has no JSON-RPC error.
- The result contains `connection_check: 1`.
- The result is marked as non-error by the MCP server.

### 5. Report the result precisely

Classify the outcome as one of:

- **Fully functional:** managed process is active, MCP handshake and tool discovery succeed, and the read-only query returns `1`.
- **Configured but not active:** configuration is valid, but no managed process is present. Recommend reloading the VS Code window or restarting MCP servers.
- **Process active but database check failed:** MCP starts, but credentials, PostgreSQL availability, permissions, or database configuration need investigation.
- **Not configured:** no valid PostgreSQL MCP entry or package is available.

Do not claim an active connection based only on configuration or package installation. Do not claim PostgreSQL MCP is broken merely because the server is on-demand and not persistent between uses.
