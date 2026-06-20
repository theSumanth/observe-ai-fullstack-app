# Hackathon Project — Observe.AI

## Context
6-hour hackathon. Prioritize working functionality and speed. Ship features, not abstractions. Cut scope before cutting quality.

**Start here:** `/fullstack-init [name]` scaffolds the entire project in one shot.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Validation**: Zod (everywhere — API inputs, env vars, form data)
- **Database**: PostgreSQL via raw `pg` Pool or Prisma
- **Cache/Queue**: Redis (only if needed — don't add unless asked)
- **HTTP Client**: Axios (proxied to backend via Vite)
- **Data Fetching**: TanStack Query v5 (React Query)
- **Routing**: React Router v6
- **Containers**: Docker + docker-compose for DB/Redis
- **AI/LLM**: Claude API (`@anthropic-ai/sdk`) — model: `claude-sonnet-4-6`

## UI — shadcn/ui ONLY
**Always use shadcn components. Never build raw HTML when a shadcn component exists.**

Import path: `import { Button } from "@/components/ui/button"`

Install: `npx shadcn@latest add [component-name]`

| Need | shadcn Component |
|---|---|
| Button | `Button` |
| Button group / split | `ButtonGroup` |
| Text input | `Input` + `Label` |
| Input with prefix/suffix | `InputGroup` |
| Form with validation | `Form`, `FormField`, `FormItem`, `FormControl` |
| Simple field wrapper | `Field`, `FieldLabel`, `FieldMessage` |
| Container/card | `Card`, `CardHeader`, `CardContent` |
| Data list/grid | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` |
| Loading state | `Skeleton` |
| Inline spinner | `Spinner` |
| Success/error message | `Alert`, `AlertDescription` |
| Tag/status | `Badge` |
| Modal | `Dialog`, `DialogContent`, `DialogHeader` |
| Side panel | `Sheet` |
| Tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| Dropdown | `DropdownMenu` |
| Toast notification | `Sonner` — use `toast()` from `sonner` |
| Select input | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` |
| Empty/zero state | `Empty` |
| Keyboard shortcut hint | `Kbd` |
| Charts | `Chart` (Recharts wrapper) |
| Sidebar layout | `Sidebar` (use `sidebar-07` block for icon-collapse) |

## Project Structure

### Backend
```
backend/src/
  routes/index.ts       # registers all routers
  controllers/          # thin — call services, return response
  services/             # business logic
  middleware/
    errorHandler.ts     # catches ZodError → 400, others → 500
  db/index.ts           # singleton DB connection
  types/                # Zod schemas + inferred TS types
  utils/
  index.ts              # Express app entry point
```

### Frontend
```
frontend/src/
  components/ui/        # shadcn components (auto-generated, do NOT edit)
  components/           # app-level reusable components
  pages/                # one file per route
  hooks/                # useQuery/useMutation wrappers
  api/
    client.ts           # axios instance with baseURL /api
    [entity].api.ts     # typed functions per entity
  types/                # TypeScript interfaces
  App.tsx               # React Router config
  main.tsx              # QueryClientProvider + Toaster
```

## Coding Rules
- TypeScript strict — no `any`
- Zod defines the shape; infer TS types: `type User = z.infer<typeof UserSchema>`
- Controllers stay thin — all logic in services
- Singleton pattern for DB connections
- Always show loading + error states (use `Skeleton` + `Alert`)
- HTTP status codes: 201 create, 200 get/update, 204 delete, 400 bad input, 404 not found, 500 server error

## Key Patterns

### Singleton DB (`backend/src/db/index.ts`)
```typescript
import { Pool } from 'pg';
let pool: Pool | null = null;
export const getDB = () => {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
};
```

### Zod validation in controller
```typescript
const CreateSchema = z.object({ name: z.string(), email: z.string().email() });
export const create = async (req: Request, res: Response) => {
  const body = CreateSchema.parse(req.body);
  const result = await service.create(body);
  res.status(201).json(result);
};
```

### React Query + shadcn
```typescript
const { data, isLoading, error } = useQuery({ queryKey: ['items'], queryFn: api.items.getAll });
if (isLoading) return <Skeleton className="h-32 w-full" />;
if (error) return <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>;
```

### Vite proxy (no CORS issues in dev)
```typescript
// vite.config.ts
server: { proxy: { '/api': 'http://localhost:3000' } }
```

### Express CORS + JSON
```typescript
import cors from 'cors';
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
```

### Claude API call (streaming)
```typescript
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const msg = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
});
```

### Environment variables (Zod-validated at startup)
```typescript
const EnvSchema = z.object({
  DATABASE_URL: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  PORT: z.coerce.number().default(3000),
});
export const env = EnvSchema.parse(process.env);
```

## Docker Quick Start
```bash
# Start DB + Redis
docker-compose up -d

# backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000

# frontend/.env
VITE_API_URL=http://localhost:3000
```

## Available MCPs (Claude uses these automatically)
| MCP | What it does | When Claude uses it |
|---|---|---|
| **shadcn** | Browse, install, get docs for shadcn components | When building UI — auto |
| **postgres** | Run SQL queries directly against the DB | When inspecting data or debugging schema |
| **ide** | Run code, get TypeScript diagnostics | When debugging type errors or running scripts |
| **Google Drive** | Read/write files from Drive | When assets or data live in Drive |

## Slash Commands
| Command | Use when |
|---|---|
| `/fullstack-init [name]` | First — scaffolds entire project |
| `/add-feature [description]` | Implement any feature end-to-end |
| `/api-crud [entity] [fields]` | Generate CRUD API fast |
| `/react-page [description]` | Add a new page with shadcn UI |
| `/add-shadcn [component]` | Install + learn a shadcn component |
| `/db-setup postgres` | Set up DB singleton + migrations |
| `/fix [bug]` | Debug and fix |
| `/verify` | Run app and confirm a change works |
| `/code-review` | Quick correctness review before demo |

## Do NOT
- Use raw `<input>`, `<select>`, `<button>` when shadcn equivalents exist
- Import shadcn from npm — always from `@/components/ui/`
- Add features not asked for
- Write tests (no time)
- Use `any` in TypeScript
- Use `useToast()` — use `sonner`'s `toast()` instead
- Invent MCPs that aren't in the table above
