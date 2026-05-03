<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurrly Expo application. Here is a summary of all changes made:

- **`app.config.js`** — Created to replace `app.json`, adding `extra.posthogProjectToken` and `extra.posthogHost` fields sourced from environment variables, making them available at build time via `expo-constants`.
- **`src/config/posthog.ts`** — New file. Initializes the PostHog client using `expo-constants` to read the token and host, with lifecycle event capture, batching, and debug mode in development.
- **`app/_layout.tsx`** — Wrapped the app in `PostHogProvider`, added manual screen tracking using `usePathname` and `useGlobalSearchParams` from Expo Router (fires `posthog.screen()` on every route change).
- **`app/(auth)/sign-up.tsx`** — Fires `user_signed_up` and `posthog.identify()` when email verification completes successfully.
- **`app/(auth)/sign-in.tsx`** — Fires `user_signed_in` and `posthog.identify()` on both password-only and MFA sign-in completion.
- **`app/(tabs)/settings.tsx`** — Fires `user_signed_out` and `posthog.reset()` before Clerk's `signOut()`, ensuring the session is flushed and the local identity is cleared.
- **`app/(tabs)/index.tsx`** — Fires `subscription_card_expanded` (with `subscription_id`, `subscription_name`, `category`, `billing`) when a user expands a subscription card on the home screen.
- **`app/subscriptions/[id].tsx`** — Fires `subscription_detail_viewed` (with `subscription_id`) when the detail screen mounts.
- **`.env`** — Updated with `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST`.
- **`posthog-react-native`** and **`react-native-svg`** installed as dependencies.

## Events

| Event | Description | File |
|---|---|---|
| `user_signed_up` | Fired when a new user completes email verification and account creation | `app/(auth)/sign-up.tsx` |
| `user_signed_in` | Fired when an existing user successfully signs in (password or MFA) | `app/(auth)/sign-in.tsx` |
| `user_signed_out` | Fired when a user logs out from the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | Fired when a subscription card is expanded to reveal details on the home screen | `app/(tabs)/index.tsx` |
| `subscription_detail_viewed` | Fired when the user navigates to the subscription detail page | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/407737/dashboard/1538622
- **User Sign-ups Over Time**: https://us.posthog.com/project/407737/insights/BQgSgfw8
- **User Sign-ins Over Time**: https://us.posthog.com/project/407737/insights/nKLDQMdt
- **Sign-up to Sign-in Conversion Funnel**: https://us.posthog.com/project/407737/insights/MZmGS14e
- **User Churn (Sign-outs Over Time)**: https://us.posthog.com/project/407737/insights/MDmsi0zY
- **Subscription Engagement**: https://us.posthog.com/project/407737/insights/tkBxN6o2

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
