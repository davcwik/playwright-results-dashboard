import { query } from '@/lib/db';
import { TestRun } from '@/lib/types';

export const revalidate = 0;

const TARGET_WORKFLOWS = [
  { dbWorkflowName: 'api-critical', displayName: 'Playwright Api Critical' },
  { dbWorkflowName: 'desktop-critical', displayName: 'Playwright Desktop Critical' },
  { dbWorkflowName: 'mobile-critical', displayName: 'Playwright Mobile Critical' },
  { dbWorkflowName: 'api-non-critical', displayName: 'Playwright Api Non-Critical' },
  { dbWorkflowName: 'desktop-non-critical', displayName: 'Playwright Desktop Non-Critical' },
  { dbWorkflowName: 'mobile-non-critical', displayName: 'Playwright Mobile Non-Critical' },
];

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

function formatDuration(ms: number): string {
  if (!ms || ms === 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function calculatePassPercentage(passed: number, total: number): string {
  if (!total || total === 0) return 'No Tests Run';
  const percentage = Math.round((passed / total) * 100);
  return `${percentage}% Pass`;
}

function formatPacificTime(utcIsoString: string | undefined): string {
  if (!utcIsoString) return 'N/A';

  const date = new Date(utcIsoString);
  if (isNaN(date.getTime())) return 'N/A';

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Convert default "MM/DD/YYYY, hh:mm AM" output to "YYYY-MM-DD hh:mm AM"
  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const dayPeriod = getPart('dayPeriod');

  return `${year}-${month}-${day} ${hour}:${minute} ${dayPeriod}`;
}

export default async function GithubResultsPage() {
  const testRuns = await getLatestTestRuns();

  const getLatestRunForWorkflow = (dbJobName: string): TestRun | undefined => {
    return testRuns.find(
      (run) => run.github_workflow_name?.toLowerCase() === dbJobName.toLowerCase()
    );
  };

  return (
    <main className="min-h-screen bg-[#f4f6f9] text-[#333333] p-5 font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
      {/* Dashboard Header */}
      <header className="text-center mb-[30px]">
        <h1 className="text-3xl font-bold text-[#333333] mb-1 tracking-tight">
          Github Test Results Dashboard
        </h1>
        <p className="text-sm text-[#666666]">Environment: Production</p>
      </header>

      {/* 3x2 Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px] max-w-[1200px] mx-auto">
        {TARGET_WORKFLOWS.map((wf) => {
          const run = getLatestRunForWorkflow(wf.dbWorkflowName);

          return (
            <div
              key={wf.dbWorkflowName}
              className="bg-white border border-[#e0e0e0] rounded-lg p-5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Job Title Header */}
                <h2 className="text-base font-bold mt-0 mb-[15px] border-b-2 border-[#f4f6f9] pb-2 text-[#333333]">
                  {wf.displayName}
                </h2>

                {/* Top Section: Run Meta */}
                <div className="mb-[15px] border-b-2 border-[#f4f6f9] pb-2">
                  <div className="flex justify-between mb-2 text-[0.95rem]">
                    <span className="text-[#666666]">Overall Result:</span>
                    <span className="font-bold">
                      {run ? calculatePassPercentage(run.passed_tests, run.total_tests) : 'No Tests Run'}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2 text-[0.95rem]">
                    <span className="text-[#666666]">Started At (PST):</span>
                    <span className="font-bold">
                      {formatPacificTime((run as any)?.started_at_utc_iso)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2 text-[0.95rem]">
                    <span className="text-[#666666]">Build Number:</span>
                    <span className="font-bold">{run?.github_build_number ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-[0.95rem]">
                    <span className="text-[#666666]">Duration:</span>
                    <span className="font-bold">
                      {run ? formatDuration(run.execution_time_ms) : '00:00:00'}
                    </span>
                  </div>
                </div>

                {/* Middle Section: Metrics Breakdown */}
                <div className="mb-[15px]">
                  <div className="flex justify-between mb-2 text-[0.95rem]">
                    <span className="text-[#666666]">Total Tests:</span>
                    <span className="font-bold">{run?.total_tests ?? 0}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-[0.95rem]">
                    <span className="text-[#666666]">Passed:</span>
                    <span className="font-bold text-[#2ecc71]">{run?.passed_tests ?? 0}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-[0.95rem]">
                    <span className="text-[#666666]">Failed:</span>
                    <span className="font-bold text-[#e74c3c]">{run?.failed_tests ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Action Links */}
              <div className="pt-2">
                <div className="flex gap-2 w-full">
                  <a
                    href="#"
                    className="flex-1 text-[0.85rem] font-semibold no-underline text-[#3498db] bg-[#f0f7fc] py-2 px-1 rounded transition-all duration-200 text-center hover:text-white hover:bg-[#2980b9]"
                  >Playwright Report</a>
                  <a
                    href="#"
                    className="flex-1 text-[0.85rem] font-semibold no-underline text-[#3498db] bg-[#f0f7fc] py-2 px-1 rounded transition-all duration-200 text-center hover:text-white hover:bg-[#2980b9]"
                  >GitHub Build</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}