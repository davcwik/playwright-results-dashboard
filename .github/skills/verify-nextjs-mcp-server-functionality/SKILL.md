---
name: verify-nextjs-mcp-server-functionality
description: 'Verify a Next.js MCP server is enabled, reachable, and functional. Use when checking a running Next.js 16+ dev server, MCP discovery, routes, compilation issues, runtime errors, or project metadata.'
argument-hint: 'Optional: provide the local Next.js dev server port, defaulting to 3000'
user-invocable: true
disable-model-invocation: false
---

# Verify Next.js MCP Server Functionality

Use this workflow to verify the built-in Next.js MCP endpoint on a running Next.js 16 or later development server.

## Security Requirements

- Use only local development URLs and read-only MCP tools.
- Never include environment variable values, credentials, tokens, cookies, request headers, or private application data in the report.
- Do not expose full local paths beyond what is necessary to identify the project.
- Do not modify source files, application data, caches, or server configuration during verification.
- Treat route names and project metadata as potentially sensitive; report only the minimum needed.

## Prerequisites

- The project uses Next.js 16 or later.
- The development server is running, normally with `npm run dev`.
- The server is reachable on its local port, normally `http://localhost:3000`.
- Next.js MCP support is enabled by the dev server. Next.js 16 exposes `/_next/mcp` automatically; no separate application route is required.

## Procedure

### 1. Discover the running server

Use the Next.js MCP discovery tool, optionally providing the known port. Confirm that discovery returns a server and record only:

- Local port and URL.
- Next.js server availability.
- Number of exposed MCP tools.
- Tool names and input schemas when needed for the checks below.

If no server is discovered, verify that the development server is running and ask for its port before retrying. Do not infer availability from package installation alone.

### 2. Verify project metadata

Call `get_project_metadata` without arguments. Confirm it returns valid metadata for the active dev server, including the local server URL. Do not copy sensitive environment values or unnecessary filesystem details into the report.

### 3. Verify route discovery

Call `get_routes` without arguments, or pass `routerType: "app"` when only App Router routes are relevant. Confirm that the response is valid and contains the expected route groups. Route discovery confirms the MCP server can inspect the running project's route graph.

### 4. Check compilation and runtime errors

Call both tools without arguments:

- `get_compilation_issues`
- `get_errors`

For a healthy server, compilation issues should be empty and the error response should have no config, build, or session errors. Report summaries and error counts rather than dumping source-mapped stacks or sensitive request data.

### 5. Optionally warm a route

If route compilation needs explicit verification, call `compile_route` with a route returned by `get_routes`, for example:

```json
{"routeSpecifier":"/"}
```

Confirm the response returns the resolved route and no compilation issues. This is optional because compilation checks may already cover all routes.

## Pass Criteria

Classify the result as **fully functional** only when all of the following are true:

- Discovery finds the running Next.js dev server.
- The server reports the expected MCP tools.
- `get_project_metadata` succeeds.
- `get_routes` succeeds.
- `get_compilation_issues` returns no issues.
- `get_errors` reports no config, build, or session errors.

A successful HTTP response from the application alone is not sufficient evidence that the MCP endpoint is functional.

## Failure Classification

- **Not running:** no Next.js dev server is discoverable.
- **Running without MCP:** the dev server is reachable but its MCP endpoint cannot be discovered.
- **Partially functional:** discovery works, but one or more MCP calls fail.
- **Functional with application issues:** MCP calls succeed, but compilation or runtime diagnostics report problems.
- **Fully functional:** discovery and all required read-only checks pass with no reported issues.

When reporting results, include the local port, successful checks, issue counts, and the next corrective action. Do not claim full functionality if only discovery succeeded.
