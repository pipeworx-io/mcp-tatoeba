# @pipeworx/tatoeba

[Tatoeba](https://tatoeba.org) MCP — collaborative multilingual sentence database (~13M sentences in 400+ languages). Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search(query, from?, to?, limit?, page?)` — sentence search
- `sentence(id)` — single sentence by id
- `translations(id)` — translations of a sentence
- `languages()` — list of supported languages

## Data source

`https://tatoeba.org/eng/api_v0/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "tatoeba": {
      "url": "https://gateway.pipeworx.io/tatoeba/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Tatoeba data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
