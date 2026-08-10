import { TestRun } from '@/lib/types';
import styles from '../github-results.module.css';

const GH_PAGES_BASE_URL = 'https://davcwik.github.io/playwright-results-dashboard/reports';

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
 * Generate the HTML for the Result Card and populate with test result data and report links
 */
export function ResultsCard({ displayName, run }: ResultsCardProps) {
  const reportUrl = run?.github_build_number && run?.github_workflow_name
    ? `${GH_PAGES_BASE_URL}/${run.github_workflow_name}/${run.github_build_number}/index.html`
    : null;

  return (
    <div className={styles.cardContainer}>
      <div>
        <h2 className={styles.cardTitle}>{displayName}</h2>

        {/* Run Meta Section */}
        <div className={styles.cardSectionDivider}>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Overall Result:</span>
            <span className={styles.metricValue}>
              {run ? calculatePassPercentage(run.passed_tests, run.total_tests) : 'No Tests Run'}
            </span>
          </div>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Started At (PST):</span>
            <span className={styles.metricValue}>
              {formatPacificTime((run as any)?.started_at_utc_iso)}
            </span>
          </div>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Build Number:</span>
            <span className={styles.metricValue}>{run?.github_build_number ?? 'N/A'}</span>
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
          {reportUrl ? (
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnAction}
            >
              Playwright Report
            </a>
          ) : (
            <span className={styles.btnDisabled}>No Report</span>
          )}

          <a href="#" className={styles.btnAction}>
            GitHub Build
          </a>
        </div>
      </div>
    </div>
  );
}