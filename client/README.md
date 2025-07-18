# MSC Client

## Environment Configuration

To configure the server port that the client connects to, create a `.env.local` file in the client directory with:

```
VITE_SERVER_PORT=3900
```

Or set the complete GraphQL URL directly:

```
VITE_GRAPHQL_URL=http://localhost:3900/graphql
```

If neither environment variable is set, the client will default to port 3900.

## Development

```bash
pnpm install
pnpm dev
```
