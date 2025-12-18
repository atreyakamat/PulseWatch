CREATE TABLE `alert_emails` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `alert_emails_id` PRIMARY KEY(`id`),
	CONSTRAINT `alert_emails_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`website_id` bigint NOT NULL,
	`status` varchar(50) NOT NULL,
	`response_time` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `websites` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`url` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`frequency` int NOT NULL DEFAULT 5,
	`enabled` boolean NOT NULL DEFAULT true,
	`status` varchar(50) DEFAULT 'UNKNOWN',
	`last_check` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `websites_id` PRIMARY KEY(`id`)
);
