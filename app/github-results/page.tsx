import { query } from '@/lib/db';
import { TestRun } from '@/lib/types';
import { ResultsCard } from './components/ResultsCard';

// disable static caching and render the page dynamically for every single request
export const revalidate = 0;

/**
 * An array that maps the Github workflow name (ex. desktop-critical) to its display name that will be displayed on the results card
 * A results card will be created on the Results Dashboard Page for each of these records in the order they are listed
 * If you want to add an additional card to the Dashboard, just add a record here
 */
const TARGET_WORKFLOWS = [
  { dbWorkflowName: 'api-critical', displayName: 'Playwright Api Critical' },
  { dbWorkflowName: 'desktop-critical', displayName: 'Playwright Desktop Critical' },
  { dbWorkflowName: 'mobile-critical', displayName: 'Playwright Mobile Critical' },
  { dbWorkflowName: 'api-non-critical', displayName: 'Playwright Api Non-Critical' },
  { dbWorkflowName: 'desktop-non-critical', displayName: 'Playwright Desktop Non-Critical' },
  { dbWorkflowName: 'mobile-non-critical', displayName: 'Playwright Mobile Non-Critical' },
];

/**
 * Get the 50 most recent test run results sorted newest to oldest
 * @return an array of objects representing raw DB rows
 */
async function getLatestTestRuns(): Promise<TestRun[]> {
  try {
    const result = await query(
      `SELECT 
        id, 
        browser, 
        github_workflow_name, 
        github_run_number, 
        playwright_tags, 
        environment, 
        total_tests, 
        passed_tests, 
        failed_tests, 
        overall_result, 
        TO_CHAR(started_at_utc, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS started_at_utc_iso, 
        execution_time_ms,
        github_run_id
       FROM test_runs 
       ORDER BY started_at_utc DESC
       LIMIT 50`
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch test runs from database:', error);
    return [];
  }
}


/**
 * Generate Github Results Page HTML
 */
export default async function GithubResultsPage() {

  // Get the most recent test result data for the current workflow run
  const testRuns = await getLatestTestRuns(); // an array of objects representing raw DB rows

  const getLatestRunForWorkflow = (dbWorkflowName: string): TestRun | undefined => {
    return testRuns.find(
      (run) => run.github_workflow_name?.toLowerCase() === dbWorkflowName.toLowerCase()
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 text-gray-800 p-6 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1 tracking-tight">Playwright Test Results Dashboard</h1>
        <p className="text-sm text-gray-500">Environment: Production</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">

        {/* Perform a loop for each record in TARGET_WORKFLOWS and get its latest test run data and generate its Results Card HTML */}
        {TARGET_WORKFLOWS.map((wf) => {
          const run = getLatestRunForWorkflow(wf.dbWorkflowName);

          return (
            <ResultsCard
              key={wf.dbWorkflowName}
              displayName={wf.displayName}
              run={run}
            />
          );

        })} // end loop

      </div>
    </main>
  );
}