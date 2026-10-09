# B7A7 walkthrough plan (5–10 minutes)

Record the deployed frontend with dedicated demo accounts. Keep the browser Network tab visible for the API section.

| Time | Screen | What to show |
|---|---|---|
| 0:00–0:45 | Home, Features, Pricing | Introduce Workline's white and blue design, mobile navigation, and task management purpose. |
| 0:45–1:40 | Login | Use the owner demo button. Explain the server-side session cookies and protected workspace routes. |
| 1:40–2:35 | Workspace, Projects | Show live metrics, project creation, and the organization setup steps. |
| 2:35–3:45 | Project board, task detail | Move a task, assign a member and label, add a comment, and upload an attachment. |
| 3:45–4:35 | Teams, Members | Show member management, team roles, and how access controls change for a manager or member account. |
| 4:35–5:25 | Sprints, Calendar, My tasks | Show URL-backed filters, planned work, and due dates. |
| 5:25–6:15 | Analytics, Notifications, Audit | Show live data, loading skeletons, and an empty or error state where appropriate. |
| 6:15–7:00 | Billing | Start Stripe test checkout, then show the success or cancellation return. Avoid showing personal payment details. |
| 7:00–8:00 | Code and DevTools | Show the App Router layout, `proxy.ts`, API route handlers, TanStack Query cache, TanStack Form with Zod, and a real backend request. |
| 8:00–8:40 | Mobile viewport | Resize the workspace and public site to show responsive navigation. |

For the validation segment, submit a task or account form with a missing required field. For API error handling, use an invalid login to show the backend error toast. Sign out and use another demo role to demonstrate the changed navigation.

## Submission fields to fill after deployment

```text
Project Name            : Workline — Project Management SaaS
Backend Repo            :
Frontend Repo           :
Live Backend URL        : https://project-management-saa-s-six.vercel.app
Live Frontend URL       :
API Documentation       :
Demo Video              :
Demo Owner Email        :
Demo Owner Password     :
Demo Manager Email      :
Demo Member Email       :
```

Use dedicated demo credentials. Add a backend documentation link only if one is published.
