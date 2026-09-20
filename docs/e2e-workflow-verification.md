# End-to-End Ticket Workflow Verification

Run these scenarios with separate browser sessions for Customer, Agent Manager, and Support Agent. Refreshing any role view must show the same status, assigned agent email, routing method, and AI confidence.

## A. High-confidence AI resolution (>75%)

1. As a customer, create a ticket with subject `How to change account email`.
2. Wait for automation to finish and verify `AI_RESOLVED` and `AI Confidence > 75%`.
3. Verify the customer ticket shows `AI Processing` while automation is running, then `Pending Your Confirmation` with the assigned email/routing metadata when a resolution is ready.
4. Click Accept and verify the ticket becomes `CLOSED` in the customer view and no longer appears in an agent's active queue.
5. Verify the manager's all-tickets view shows the same confidence and `AI Resolution` routing reason.

## B. Low-confidence skill match (<=75%)

1. Create `Refund issue on invoice` with category `Billing`. If the model does not produce a low score, use a test fixture or controlled response at exactly `0.75`.
2. Verify the ticket is `ASSIGNED`, the confidence is `<= 75%`, and the assigned email is `agent2@demo.com`.
3. Verify the manager shows `Auto-Assigned (Skill Match: Billing)` and `Auto (Skill-Match: Billing)`.
4. Verify the ticket is present in `agent2@demo.com`'s queue and absent from `agent3@demo.com`'s queue.

## C. Unmapped category manager fallback

1. Create a ticket with category `Custom Hardware Error`.
2. Verify it is `PENDING_ASSIGNMENT`, has no assigned agent email, and shows `Unmapped Category (Pending Assignment)` in the manager queue.
3. In the manager console select `agent3@demo.com (N Active)` and click Assign.
4. Verify the ticket becomes `ASSIGNED`, routing is `Manual Manager Assignment`, and it appears in `agent3@demo.com`'s queue only.

## D. Human resolution and customer reopen

1. As the assigned agent, open the ticket and choose Resolved. Enter resolution notes and save.
2. Verify the ticket becomes `RESOLVED` and the customer sees `Pending Your Confirmation`.
3. As the customer, click `Issue Still Not Fixed / Reopen` and enter `Error code 500 still appears when logging in.`
4. Verify the ticket becomes `REOPENED`, retains the assigned agent email, and the agent sees a red/attention status badge with the feedback at the top of the detail view.
5. Verify no other agent can see the reopened ticket.

## Access and stability checks

- Navigate between manager filters/tabs repeatedly and confirm there is one request per refresh/filter change, not an infinite fetch loop.
- Confirm all assignment queries use the logged-in agent's exact `assigned_agent_id` (with exact email fallback only for legacy records).
- Log in as a customer and request `/api/manager/agents/` and `/api/agent/tickets/`; both must return HTTP 403 and the frontend must redirect protected role routes to the customer dashboard.
