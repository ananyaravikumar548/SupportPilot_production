// Mock dataset for Knowledge Base, Ingestion Jobs, and KB Gaps (M2 Spec)

export const mockArticles = [
  {
    id: 'kb-001',
    title: 'How to handle Payment Gateway Failures',
    slug: 'payment-gateway-failures',
    category: 'Billing',
    subCategory: 'Payments',
    status: 'PUBLISHED',
    version: 2,
    updatedAt: '2026-08-10T14:30:00Z',
    lastIndexedAt: '2026-08-10T14:32:00Z',
    views: 1240,
    content: `# Payment Gateway Failure Resolution Guide
## Overview
This document covers handling timeout and authorization errors during checkout.

## Troubleshooting Steps
1. Verify if the gateway timeout threshold exceeds 30 seconds.
2. Check customer bank webhook response logs under Billing Dashboard.
3. If issue persists, issue a manual transaction query token.`,
  },
  {
    id: 'kb-002',
    title: 'Troubleshooting SSO and Login Authorization',
    slug: 'sso-login-authorization',
    category: 'Account',
    subCategory: 'Authentication',
    status: 'PUBLISHED',
    version: 1,
    updatedAt: '2026-08-12T09:15:00Z',
    lastIndexedAt: '2026-08-12T09:16:00Z',
    views: 840,
    content: `# SSO Configuration and Diagnostics
## Common Identity Provider Mismatches
1. Clear browser cache and local storage tokens.
2. Verify SAML response assertion endpoint matches the client domain.`,
  },
  {
    id: 'kb-003',
    title: 'Resolving Mobile App Crash Logs',
    slug: 'mobile-app-crash-logs',
    category: 'Technical',
    subCategory: 'Mobile',
    status: 'DRAFT',
    version: 1,
    updatedAt: '2026-08-18T11:00:00Z',
    lastIndexedAt: null, // Unindexed item triggers StaleBadge/UnindexedChip
    views: 2400,
    content: `# Mobile App Crash Diagnostics
## Gathering Logs
Obtain crash stack traces using the device logging tool.`,
  },
  {
    id: 'kb-004',
    title: 'Resolving VPN Connection and Tunnel Drops',
    slug: 'vpn-connection-tunnel-drops',
    category: 'Network',
    subCategory: 'VPN',
    status: 'PUBLISHED',
    version: 3,
    updatedAt: '2026-08-20T08:45:00Z',
    lastIndexedAt: '2026-08-20T08:47:00Z',
    views: 1165,
    content: `# VPN Connection Troubleshooting
## Recommended Checks
1. Confirm the user is connected to a supported network.
2. Refresh the VPN profile and verify certificate expiration.
3. Capture the tunnel error code before escalating to Network Operations.`,
  },
  {
    id: 'kb-005',
    title: 'Password Reset and Account Lockout Guide',
    slug: 'password-reset-account-lockout',
    category: 'Account',
    subCategory: 'Security',
    status: 'PUBLISHED',
    version: 2,
    updatedAt: '2026-08-21T13:10:00Z',
    lastIndexedAt: '2026-08-21T13:12:00Z',
    views: 1980,
    content: `# Password and Account Access Guide
## Resolution Steps
1. Confirm the account email and identity verification status.
2. Use the approved self-service reset flow.
3. Escalate repeated lockouts for security review instead of disabling controls.`,
  },
  {
    id: 'kb-006',
    title: 'Investigating API 500 Internal Server Errors',
    slug: 'api-500-internal-server-errors',
    category: 'Technical',
    subCategory: 'APIs',
    status: 'PUBLISHED',
    version: 1,
    updatedAt: '2026-08-22T10:20:00Z',
    lastIndexedAt: '2026-08-22T10:22:00Z',
    views: 735,
    content: `# API Error Investigation
## First Response Checklist
1. Record the endpoint, timestamp, request ID, and response status.
2. Check application and dependency health dashboards.
3. Review the correlated server logs before retrying the request.`,
  },
  {
    id: 'kb-007',
    title: 'Handling Duplicate Billing Charges',
    slug: 'duplicate-billing-charges',
    category: 'Billing',
    subCategory: 'Invoices',
    status: 'PUBLISHED',
    version: 1,
    updatedAt: '2026-08-23T15:05:00Z',
    lastIndexedAt: '2026-08-23T15:06:00Z',
    views: 921,
    content: `# Duplicate Charge Resolution
## Customer Support Steps
1. Compare the invoice entries with the payment processor transaction IDs.
2. Check whether one charge is only an authorization hold.
3. Create a billing review case when two settled transactions are confirmed.`,
  },
  {
    id: 'kb-008',
    title: 'Email Notification Delivery Troubleshooting',
    slug: 'email-notification-delivery',
    category: 'Technical',
    subCategory: 'Email',
    status: 'DRAFT',
    version: 1,
    updatedAt: '2026-08-24T09:30:00Z',
    lastIndexedAt: null,
    views: 412,
    content: `# Email Delivery Troubleshooting
## Verification Steps
1. Confirm the recipient address and notification event.
2. Review the email log for delivery status and provider response.
3. Retry only after correcting the underlying configuration issue.`,
  },
];

export const mockKbGaps = [
  {
    id: 'gap-001',
    category: 'Printer',
    subCategory: 'Hardware',
    occurrenceCount: 18,
    status: 'OPEN',
    sampleQueries: ['Printer queue stuck', 'Paper jam code 50.4'],
    firstSeen: '2026-08-01T08:00:00Z',
  },
  {
    id: 'gap-002',
    category: 'Network',
    subCategory: 'VPN',
    occurrenceCount: 7,
    status: 'WRITING',
    sampleQueries: ['VPN error code 0x80070422', 'Tunnel disconnects every 5 mins'],
    firstSeen: '2026-08-05T10:00:00Z',
  },
];

export const mockIngestionJobs = [
  {
    jobId: 'job-991',
    sourceType: 'PDF_BULK',
    status: 'COMPLETED_WITH_ERRORS',
    totalDocs: 5,
    processed: 4,
    failed: 1,
    startedAt: '2026-08-19T10:00:00Z',
    errorLog: [
      { file: 'Legacy_Vpn_2021.pdf', reason: 'Corrupt heading structure / Parsing failed' },
    ],
  },
];