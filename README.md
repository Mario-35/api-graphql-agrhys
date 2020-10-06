<h1 align="center">
  <img src="https://graphql.org/img/logo.svg" width="128" height="128" alt="GraphQL" /><br>
  Node.js API GraphQL Starter Kit
</h1>

**Yarn v2** based monorepo template for quickly bootstrapping production ready web
application infrastructure, using code-first **GraphQL API** and **PostgreSQL** backend.

## Directory Structure

`├──`[`.github`](.github) — GitHub configuration including CI/CD<br>
`├──`[`.vscode`](.vscode) — VSCode settings including code snippets, recommended extensions etc.<br>
`├──`[`env`](./env) — environment variables used for local development<br>
`├──`[`db`](./db) — database schema and some administration tools<br>
`├──`[`api`](./api) — GraphQL API server and authentication middleware<br>
`├──`[`proxy`](./proxy) — reverse proxy implemented using [Cloudflare Workers](https://workers.cloudflare.com/)<br>
`└──`[`scripts`](./scripts) — Automation scripts shared across the project<br>

## Requirements

- [Node.js](https://nodejs.org/) v12 or higher, [Yarn](https://yarnpkg.com/) package manager
- Local or remote instance of [PostgreSQL](https://www.postgresql.org/)
- [VS Code](https://code.visualstudio.com/) editor with [recommended extensions](.vscode/extensions.json)

## Getting Started

Just clone the repo and run `yarn setup` followed by `yarn start`:

```bash
$ npx degit https://github.com/Mario-35/api-graphql-agrhys example
$ cd ./example                  # Change current directory to the newly created one
$ yarn install                  # Install Node.js dependencies
$ yarn start                    # Launch Node.js API application
```

The API server must become available at [http://localhost:8080/graphql](http://localhost:8080/graphql).

## License

Copyright © 2020-present Inrae.

---

Made with ♥ by mario ADAM.
