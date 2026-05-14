interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Tatoeba MCP — multilingual sentence corpus.
 *
 * Auth: none. Docs: https://en.wiki.tatoeba.org/articles/show/api
 */


const BASE = 'https://tatoeba.org/eng/api_v0';
const UA = 'pipeworx-mcp-tatoeba/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search sentences. Use ISO 639-3 codes ("eng","fra","spa","jpn","cmn",…) for from/to.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        from: { type: 'string', description: 'Source language (default any).' },
        to: { type: 'string', description: 'Target translation language (default any).' },
        page: { type: 'number', description: '1-based (default 1).' },
        limit: { type: 'number', description: '1-100 (default 25).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'sentence',
    description: 'Single sentence by id.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id'],
    },
  },
  {
    name: 'translations',
    description: 'Translations of a sentence.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id'],
    },
  },
  {
    name: 'languages',
    description: 'Supported languages.',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search': {
      const params = new URLSearchParams({
        query: reqStr(args, 'query', '"hello"'),
        page: String(Math.max(1, (args.page as number) ?? 1)),
      });
      if (args.from) params.set('from', String(args.from));
      if (args.to) params.set('to', String(args.to));
      const limit = Math.min(100, Math.max(1, (args.limit as number) ?? 25));
      const data = (await tatoebaGet(`/search?${params}`)) as { results?: unknown[]; paging?: unknown };
      return { ...data, results: (data.results ?? []).slice(0, limit) };
    }
    case 'sentence':
      return tatoebaGet(`/sentence/${(args.id as number) | 0}`);
    case 'translations':
      return tatoebaGet(`/sentence/${(args.id as number) | 0}/translations`);
    case 'languages':
      return tatoebaGet(`/languages`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function tatoebaGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (res.status === 404) throw new Error('Tatoeba: not found');
  if (!res.ok) throw new Error(`Tatoeba: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
