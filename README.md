### Overview:
This repository contains a custom Test Results Dashboard Page that displays the latest Playwright UI and API test run results data retrieved from a PostgreSQL database.

The test results are from a separate project, where Github workflows launch the test runs and write the results data to the database (see repo [here](https://github.com/davcwik/bird-world-playwright-js)).

### Technical Details:
* Web Framework: Next.js (TypeScript)
* Database: Postgres (SQL)
* AI Tools: MCP Servers and custom AI Agent Skills (see AI Tools below for details)

### Highlights:
* Responsive Design: The Dashboard grid layout will dynamically adjust as needed to fit various browser widths
* Test Result Details: The results card for each test run result displays test run metadata such as Github workflow name and build number, start date and time, test run duration and overall Pass percentage. The number of Total, Passed and Failed tests are also displayed.
* Additional Reports: Each results card also contains links to a full Playwright Test Run report and a Github Run Details Page
* Security: no .env files with sensitive data (ex. configuration details, credentials, etc) are saved in the repository
* To view screenshots of the Dashboard Page, navigate to the "demo" directory in this repo. (see [here](https://github.com/davcwik/playwright-results-dashboard/tree/main/demo)).

### AI Tools ###
MCP Servers for Next.js and Postgres are included (see .vscode/mcp.json). Also various custom Skills have been created, including utility skills to verify the MCP Server connections are up and running. See the .github/skills directory.

Note: As part of the Postgres MCP Server configuration, Yawlabs must be installed locally in the project root for it to work. Run `npm install @yawlabs/postgres-mcp` to install it.

### Next.js ###
To start the dev server: npm run dev
To stop: Ctrl-c

### Postgres ###
Installation was performed with Home Brew.
To start: brew services start postgresql@16
To stop: brew services stop postgresql@16

