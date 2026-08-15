import { TestRun } from '@/lib/types';
import styles from '../github-results.module.css';


interface ResultsCardProps {
  displayName: string;
  run?: TestRun;
}

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

/**
 * Convert the test execution time in ms to HH:MM:SS
 */
function formatDuration(ms: number): string {
  if (!ms || ms === 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculate the Pass percentage for the test run (ex. 50% Pass)
 */
function calculatePassPercentage(passed: number, total: number): string {
  if (!total || total === 0) return 'No Tests Run';
  const percentage = Math.round((passed / total) * 100);
  return `${percentage}% Pass`;
}

/**
 * Convert a UTC datetime to corresponding PST timezone
 */
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

  // Convert default "MM/DD/YYYY, hh:mm AM" format to "YYYY-MM-DD hh:mm AM"
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

/**
 * Get the Github Pages URL for the run's Playwright report
 * @var wf_name - Github workflow name (ex. desktop-critical)
 * @var run_num - Github run number (ex. 65)
 * @return the url or null
 */
function getPlaywrightReportUrl(wf_name?: string, run_num?: number, ): string | null {
  if (!wf_name || !run_num) return null; 
  return `https://davcwik.github.io/bird-world-playwright-js/playwright-reports/${wf_name}/${run_num}/index.html`;
}

/**
 * Get the URL for the Github Run Details Page (ex. https://github.com/davcwik/bird-world-playwright-js/actions/runs/31655363456)
 * @var run_id - Github run id (ex. 31747031193)
 * @return the url or null
 */
function getRunDetailsUrl(run_id?: string): string | null {
  if (!run_id) return null;
  return `https://github.com/davcwik/bird-world-playwright-js/actions/runs/${run_id}`;
}

/**
 * Apply css styling rule based on the Overall Result "X% Passed" text
 * @var text - the Overall Results text (ex. 50% Passed)
 * @return the corresponding styling rule
 */
const getStatusClass = (text: string) => {
  if (text === '100% Pass') return styles.statusSuccess;
  if (text === 'No Tests Run') return styles.statusNeutral;
  return styles.statusFail;
};

/**
 * Generate the HTML for the Result Card and populate with test result data and report links
 * @var displayName - the workflow name for the card title (ex. desktop-critical)
 * @var run - a data object with key value pairs that contains the test run result data
 * @return HTML
 */
export function ResultsCard({ displayName, run }: ResultsCardProps) {

  // Report links
  const pwReportUrl = getPlaywrightReportUrl(run?.github_workflow_name, run?.github_run_number);
  const runDetailsUrl = getRunDetailsUrl(run?.github_run_id);

  // Apply styling rule for Overall Result "X% Passed" text
  const resultText = run
  ? calculatePassPercentage(run.passed_tests, run.total_tests)
  : 'No Tests Run';
  const statusClass = getStatusClass(resultText);

  // HTML
  return (
    <div className={styles.cardContainer}>
      <div>
        <h2 className={styles.cardTitle}>{displayName}</h2>

        {/* Run Meta Section */}
        <div className={styles.cardSectionDivider}>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Overall Result:</span>
            <span className={`${styles.metricValue} ${statusClass}`}>{resultText}</span>
          </div>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Started At (PST):</span>
            <span className={styles.metricValue}>
              {formatPacificTime((run as any)?.started_at_utc_iso)}
            </span>
          </div>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Run Number:</span>
            <span className={styles.metricValue}>{run?.github_run_number ?? 'N/A'}</span>
          </div>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Duration:</span>
            <span className={styles.metricValue}>
              {run ? formatDuration(run.execution_time_ms) : '00:00:00'}
            </span>
          </div>
        </div>

        {/* Metrics Breakdown */}
        <div className="mb-4">
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Total Tests:</span>
            <span className={styles.metricValue}>{run?.total_tests ?? 0}</span>
          </div>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Passed:</span>
            <span className="font-bold text-emerald-600">{run?.passed_tests ?? 0}</span>
          </div>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Failed:</span>
            <span className="font-bold text-rose-600">{run?.failed_tests ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Action Links */}
      <div className="pt-2">
        <div className="flex gap-2 w-full">
          {pwReportUrl ? (<a href={pwReportUrl} target="_blank" rel="noopener noreferrer" className={styles.btnAction}>Playwright Report</a>) : (<span className={styles.btnDisabled}>No Report</span>)}
          {runDetailsUrl ? (<a href={runDetailsUrl} target="_blank" rel="noopener noreferrer" className={styles.btnAction}>Github Run Details</a>) : (<span className={styles.btnDisabled}>No Report</span>)}
        </div>
      </div>
    </div>
  );
}