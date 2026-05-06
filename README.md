## React Sprint Board (Vite) + Frappe backend

This is a Vite + React version of the Frappe **Sprint Board** page, using the same backend methods from `fusion_infotech.fusion_infotech.api.sprint_board`.

### Dev setup

1. Ensure your Frappe site is running (bench), typically on port `8000`.
2. From this folder:

```bash
npm install
npm run dev
```

The dev server runs on **`http://localhost:8010`** (strict).

### Configure backend target (optional)

By default the Vite proxy targets `http://localhost:8000`.

To change it:

```bash
cp .env.example .env
```

Then edit:

- `VITE_FRAPPE_PROXY_TARGET` (example: `http://vms.localhost:8000`)
- `VITE_FRAPPE_SITE_HOST` (example: `vms.localhost`)

If you see a login error page that says **"localhost does not exist"**, you must set `VITE_FRAPPE_SITE_HOST` (or point `VITE_FRAPPE_PROXY_TARGET` to your site host like `vms.localhost`).

### APIs used (same as legacy page)

- `fusion_infotech.fusion_infotech.api.sprint_board.is_system_manager`
- `fusion_infotech.fusion_infotech.api.sprint_board.get_open_sprint_plan`
- `fusion_infotech.fusion_infotech.api.sprint_board.get_sprint_board_data`
- `fusion_infotech.fusion_infotech.api.sprint_board.can_update_task_status`
- `fusion_infotech.fusion_infotech.api.sprint_board.update_task_status_with_dates`
- `frappe.client.get_value`
- `frappe.auth.get_logged_user`
- `frappe.sessions.get_csrf_token`
- `login` / `logout`

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
