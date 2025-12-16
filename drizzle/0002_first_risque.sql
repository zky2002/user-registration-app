ALTER TABLE `registrations` ADD `faceFeatures` text;--> statement-breakpoint
ALTER TABLE `registrations` ADD `faceRegistered` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `registrations` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_phoneNumber_unique` UNIQUE(`phoneNumber`);