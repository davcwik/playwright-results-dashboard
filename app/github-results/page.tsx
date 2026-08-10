import { query } from '@/lib/db';
import { TestRun } from '@/lib/types';
import { ResultsCard } from './components/ResultsCard'; // Updated import

// disable static caching and render the page dynamically for every single request
export const revalidate = 0;

// list of workflows to populate the Result Cards on the page
const TARGET_WORKFLOWS = [
  { dbWorkflowName: 'api-critical', displayName: 'Playwright Api Critical' },
  { dbWorkflowName: 'desktop-critical', displayName: 'Playwright Desktop Critical' },
  { dbWorkflowName: 'mobile-critical', displayName: 'Playwright Mobile Critical' },
  { dbWorkflowName: 'api-non-critical', displayName: 'Playwright Api Non-Critical' },
  { dbWorkflowName: 'desktop-non-critical', displayName: 'Playwright Desktop Non-Critical' },
  { dbWorkflowName: 'mobile-non-critical', displayName: 'Playwright Mobile Non-Critical' },
];

/**
 * get the 50 most recent test run results
 */
async function getLatestTestRuns(): Promise<TestRun[]> {
  try {
    const result = await query(
      `SELECT 
        id, 
        browser, 
        github_workflow_name, 
        github_build_number, 
        playwright_tags, 
        environment, 
        total_tests, 
        passed_tests, 
        failed_tests, 
        overall_result, 
        TO_CHAR(started_at_utc, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS started_at_utc_iso, 
        execution_time_ms 
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
 * Generate Github Results Page HTML and populate with data
 */
export default async function GithubResultsPage() {
  const testRuns = await getLatestTestRuns();

  const getLatestRunForWorkflow = (dbWorkflowName: string): TestRun | undefined => {
    return testRuns.find(
      (run) => run.github_workflow_name?.toLowerCase() === dbWorkflowName.toLowerCase()
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 text-gray-800 p-6 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1 tracking-tight">
          Github Test Results Dashboard
        </h1>
        <p className="text-sm text-gray-500">Environment: Production</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {TARGET_WORKFLOWS.map((wf) => {
          const run = getLatestRunForWorkflow(wf.dbWorkflowName);

          return (
            <ResultsCard
              key={wf.dbWorkflowName}
              displayName={wf.displayName}
              run={run}
            />
          );
        })}
      </div>
    </main>
  );
}