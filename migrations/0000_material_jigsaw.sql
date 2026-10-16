CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text,
	`provider` text NOT NULL,
	`endpoint` text,
	`credential_env` text,
	`models` text NOT NULL,
	`weight` integer NOT NULL,
	`concurrency_cap` integer NOT NULL,
	`status` text NOT NULL,
	`status_reason` text,
	`headroom_tokens` integer,
	`headroom_provenance` text NOT NULL,
	`headroom_updated_at` integer,
	`reserved_tokens` integer DEFAULT 0 NOT NULL,
	`inflight` integer DEFAULT 0 NOT NULL,
	`rpm_window_start` integer,
	`rpm_requests` integer DEFAULT 0 NOT NULL,
	`tpm_tokens` integer DEFAULT 0 NOT NULL,
	`rpm_limit` integer,
	`tpm_limit` integer,
	`cooldown_until` integer,
	`cooldown_provenance` text DEFAULT 'estimated' NOT NULL,
	`budget_reset_at` integer,
	`mock` text,
	`credential_hint` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `accounts_run_idx` ON `accounts` (`run_id`);--> statement-breakpoint
CREATE TABLE `api_keys` (
	`key` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`scopes` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `decision_traces` (
	`trace_id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`run_id` text,
	`tenant_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`model` text NOT NULL,
	`requested_policy` text NOT NULL,
	`estimated_input_tokens` integer NOT NULL,
	`assessments` text NOT NULL,
	`ranked_spark` text NOT NULL,
	`selected_account_id` text,
	`selection_reason` text,
	`failovers` text NOT NULL,
	`outcome` text
);
--> statement-breakpoint
CREATE INDEX `traces_run_created_idx` ON `decision_traces` (`run_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `traces_tenant_idx` ON `decision_traces` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `lab_runs` (
	`run_id` text PRIMARY KEY NOT NULL,
	`scenario` text NOT NULL,
	`policies` text NOT NULL,
	`request_count` integer NOT NULL,
	`concurrency` integer NOT NULL,
	`seed` integer NOT NULL,
	`status` text NOT NULL,
	`report_key` text,
	`result` text,
	`error_detail` text,
	`created_at` integer NOT NULL,
	`finished_at` integer
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usage_events` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text,
	`tenant_id` text NOT NULL,
	`account_id` text NOT NULL,
	`trace_id` text NOT NULL,
	`input_tokens` integer NOT NULL,
	`output_tokens` integer NOT NULL,
	`cost_estimate` real NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `usage_run_idx` ON `usage_events` (`run_id`);--> statement-breakpoint
CREATE INDEX `usage_tenant_idx` ON `usage_events` (`tenant_id`);