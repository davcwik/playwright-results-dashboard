// test_runs table
export interface TestRun {
  id: number;
  browser: string;
  github_job_name: string;
  github_build_number: number;
  playwright_tags: string;
  environment: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  overall_result: 'PASSED' | 'FAILED';
  started_at_utc: string;
  execution_time_ms: number;
}


// test_results table
export interface TestResults{
  id: number;
  test_run_id: number;
  suite_name: string;
  test_name: string;
  status: 'PASSED' | 'FAILED';
  duration_seconds: number;
  tags: string;
}


// test_steps_results table
export interface TestStepResults {
  id: number;
  test_result_id: number;
  step_name: string;
  step_status: 'PASSED' | 'FAILED';
  error_message: string;
  screenshot_path: string;
}