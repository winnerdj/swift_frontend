# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

📂 Recommended Folder Structure
  qms_frontend/
  │── public/               # Static assets
  │── src/                  # Main application source code
  │   ├── api/              # API calls and service functions
  │   ├── app/              # Store configuration (Redux)
  │   │   ├── store.ts      # Redux store configuration
  │   │   ├── slices/       # Redux slices (state logic)
  │   ├── components/       # Reusable UI components
  │   ├── features/         # Feature-based modules (e.g., auth, dashboard)
  │   ├── hooks/            # Custom hooks
  │   ├── pages/            # Application pages (e.g., Home.tsx, About.tsx)
  │   ├── routes/           # React Router configuration
  │   ├── styles/           # Global styles (Tailwind directives)
  │   ├── utils/            # Helper functions
  │   ├── App.tsx           # Main App component
  │   ├── main.tsx          # Entry point
  │   │── global.css        # Index CSS
  │── .eslintrc.cjs         # ESLint configuration
  │── tailwind.config.js    # Tailwind CSS configuration
  │── tsconfig.json         # TypeScript configuration
  │── vite.config.ts        # Vite configuration
  │── package.json          # Project dependencies

📁 General Folder & File Naming Rules
  ✅ Use kebab-case for folders (components, hooks, utils)
  ✅ Use PascalCase for React components (Button.tsx, Sidebar.tsx)
  ✅ Use camelCase for files that export functions, hooks, or utilities (useAuth.ts, fetchData.ts)
  ✅ Use index files (index.ts) for barrel exports in folders