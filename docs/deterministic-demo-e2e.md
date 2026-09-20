# Deterministic SupportPilot Demo

## Seed

From `Server/`, seed the demo users and tickets:

```bash
python manage.py seed_demo_users
python manage.py seed_agents
python manage.py seed_demo_tickets
```

The seed command is idempotent. It creates `customer@demo.com` and the three
tickets below without relying on model-generated AI scores.

| Demo ID | Category | Confidence | Expected route |
| --- | --- | ---: | --- |
| DEMO-01 | ` Billing ` | 60% | `agent2@demo.com`, `ASSIGNED` |
| DEMO-02 | `TECHNICAL` | 45% | `agent3@demo.com`, `ASSIGNED` |
| DEMO-03 | `Unmapped` | 30% | Manager queue, `PENDING_ASSIGNMENT` |

The seeded agent expertise is intentionally `agent2=Billing`,
`agent3=Technical`, and `agent=Account`, so the unmapped case has no
accidental `General` fallback.

## Presentation path

1. Sign in as the customer (`customer@demo.com` / `password123`) and open
   **My Tickets**.
2. Run routing for `DEMO-01` with confidence `0.60`. Verify `ASSIGNED` and
   `agent2@demo.com`.
3. Sign in as `agent2@demo.com` / `password123`, resolve `DEMO-01`, and enter
   resolution notes.
4. Return to the customer portal. In the forest-green **Resolution Provided**
   controls, choose **Still Not Satisfied? Reopen Ticket**, enter
   `Error code 500 still appears when logging in.`, and submit.
5. Verify the customer sees `REOPENED`, the assigned email is retained, and
   `agent2@demo.com` sees the ticket in the active queue with the feedback.
6. Run routing for `DEMO-02` with confidence `0.45`. Verify it is assigned to
   `agent3@demo.com`.
7. Run routing for `DEMO-03` with confidence `0.30`. Verify
   `PENDING_ASSIGNMENT`, no assigned email, and the manager's **Unassigned
   Queue** entry.

## Threshold assertion

The routing contract is strict: `ai_confidence <= 0.75` always attempts human
routing, while `ai_confidence > 0.75` sets `AI_RESOLVED`. A value of exactly
`0.75` must never take the AI-resolved path.

## API smoke checks

```bash
curl -X POST http://localhost:8000/api/tickets/<DEMO-01-ID>/reopen/ \
  -H "Authorization: Bearer <customer-token>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Error code 500 still appears when logging in."}'
```

Expected response: HTTP `200`, a `ticket` object with status `REOPENED`, and
`requires_human_review: true`. A different customer's token receives HTTP
`403`; an unresolved ticket receives HTTP `400`.
