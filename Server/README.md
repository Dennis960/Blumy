# Blumy Server

## Environment Variables

| Variable Name              | Recommended Value for testing            | Description                                      |
|----------------------------|-------------------------|--------------------------------------------------|
| `PUBLIC_VAPID_KEY`         | *(none)*                | Public VAPID key for push notifications.         |
| `PRIVATE_VAPID_KEY`        | *(none)*                | Private VAPID key for push notifications.        |
| `VAPID_EMAIL`              | `root@localhost`        | Email address used for VAPID contact.            |
| `GOOGLE_CLIENT_ID`         | *(none)*                | Google OAuth client ID.                          |
| `GOOGLE_CLIENT_SECRET`     | *(none)*                | Google OAuth client secret.                      |
| `ORIGIN`                   | `http://localhost:5173` | Allowed origin for CORS and redirects.           |
| `PUBLIC_MODE`              | `test`                  | Application mode (e.g., `test`, `production`).   |
| `PUBLIC_IMPRESSUM_NAME`    | *(none)*                | Name for legal disclosure (Impressum).           |
| `PUBLIC_IMPRESSUM_ADDRESS` | *(none)*                | Address for legal disclosure (Impressum).        |
| `PUBLIC_IMPRESSUM_CITY`    | *(none)*                | City for legal disclosure (Impressum).           |
| `PUBLIC_IMPRESSUM_COUNTRY` | *(none)*                | Country for legal disclosure (Impressum).        |

## Developing

Install dependencies with `npm install`

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```
