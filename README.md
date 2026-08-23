### Overview:
This repository contains a custom Test Results Dashboard Page that displays the latest Playwright UI and API test run results data retrieved from a PostgreSQL database.

The test results are from a separate project, where Github workflows launch the test runs and write the results data to the database (see repo [here](https://github.com/davcwik/bird-world-playwright-js)).

### Technical Details:
* Web Framework: Next.js (TypeScript)
* Database: Postgres
* AI Tools: MCP Servers for Next.js and Postgres are included. Various custom Skills have been created - see the .github/skills directory.

### Highlights:
* Responsive Design: The Dashboard grid layout will dynamically adjust as needed to fit various browser widths
* Test Result Details: The results card for each test run result displays test run metadata such as Github workflow name and build number, start date and time, test run duration and overall Pass percentage. The number of Total, Passed and Failed tests are also displayed.
* Additional Reports: Each results card also contains links to a full Playwright Test Run report and a Github Run Details Page
* Security: no .env files with sensitive data (ex. configuration details, credentials, etc) are saved in the repository
* To view screenshots of the Dashboard Page, navigate to the "demo" directory in this repo. (see here).



