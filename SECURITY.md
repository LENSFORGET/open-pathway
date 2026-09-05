# Security

Open Pathway processes preset planning choices in the browser. Drafts, saved plans, and readiness answers use tab-scoped session storage; language preferences use local storage. The footer provides an explicit control to clear the application's saved data. JSON exports are managed by the person downloading them.

Report vulnerabilities through [GitHub's private reporting form](https://github.com/LENSFORGET/open-pathway/security/advisories/new). Include the affected version, reproducible steps, and a minimal example using synthetic data. Keep secrets and personal information out of public issues.

The review focus includes storage validation, dependency security, export content, and static-hosting configuration. Maintainers should handle accidental disclosures privately and revoke exposed credentials through their issuing service.
