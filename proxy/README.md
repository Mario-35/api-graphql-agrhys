# Reverse Proxy

Light-weight reverse proxy implemented by using [Cloudflare Workers](https://workers.cloudflare.com/).

- `https://example.com/`, `/about`, `/pricing`, `/blog/*`, etc.<br>
  ↳ routed to `https://example.webflow.io`
- `https://example.com/help/*`<br>
  ↳ routed to `https://intercom.help`
- `https://example.com/graphql`, `/auth/google`, `/auth/google/return` etc.<br>
  ↳ routed to the GraphQL API server (Google Cloud Function or Cloud Run)
- `https://example.com/admin/*`<br>
  ↳ routed to the admin dashboard (Cloudflare Workers Site)
- `https://example.com/*` the rest of the pages<br>
  ↳ routed to the main web application (Cloudflare Workers Site)

## Tech Stack

- [Node.js](https://nodejs.org/) `v12+`, [Yarn](https://yarnpkg.com/) `v2` package manager
- [Babel](https://babeljs.io/), [TypeScript](https://www.typescriptlang.org/),
  [Webpack](https://webpack.js.org/) `v5`, [ESLint](https://eslint.org/)

## How to Build

```bash
$ yarn build                    # Builds the project using Webpack
```

## How to Deploy

Compile and bundle the code into `dist/main.js` (`build`), upload application
bundle to Google Cloud Storage (`push`), and finally, deploy or re-deploy it
to Cloudflare Workers (`deploy`).

```
$ yarn build
$ yarn push [--version=#0]
$ yarn deploy [--version=#0] [--env=#1] [--no-download]
```

## References

- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)

## License

Copyright © 2020 Inrae.
