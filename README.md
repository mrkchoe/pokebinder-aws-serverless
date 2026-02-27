# tcg-inventory-platform

A **multi-user digital Pokémon TCG binder** built on a **FREE-TIER-SAFE** serverless architecture. No VPC, no NAT Gateway, no RDS, no ECS.

## Architecture (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PokéBinder (AWS Edition)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐     Sign in / Sign up      ┌─────────────────────┐   │
│   │   Next.js    │ ──────────────────────────►│  AWS Cognito        │   │
│   │   Frontend   │     JWT in httpOnly cookie │  (User Pool)        │   │
│   │  (App Router)│◄───────────────────────────│                     │   │
│   └──────┬───────┘                            └─────────────────────┘   │
│          │                                                              │
│          │  API calls (via Next.js proxy → add Bearer token from cookie)│
│          ▼                                                              │
│   ┌──────────────┐     HTTPS                 ┌─────────────────────┐    │
│   │  API Gateway │──────────────────────────►│  Lambda (Node 20)   │    │
│   │  (HTTP API)  │     JWT Authorizer        │ Binder / Page / Slot│    │
│   │              │◄──────────────────────────│  CRUD + Undo        │    │
│   └──────┬───────┘                           └──────────┬──────────┘    │
│          │                                              │               │
│          │                                              │               │
│          │                                              ▼               │
│          │                                     ┌─────────────────────┐  │
│          │                                     │  DynamoDB           │  │
│          │                                     │  (On-Demand,        │  │
│          │                                     │   single-table)     │  │
│          │                                     └─────────────────────┘  │
│          │                                                              │
│   ┌──────┴───────┐                                                      │
│   │  Card search │  (Frontend only, debounced 300ms)                    │
│   │  Pokémon TCG │ ───────────────────────────────► api.pokemontcg.io   │
│   │  API v2      │  Optional API key via env                            │
│   └──────────────┘                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript (strict), Tailwind, shadcn/ui, dnd-kit |
| Auth        | AWS Cognito User Pool (email/password) |
| API         | API Gateway HTTP API + Lambda (Node 20) |
| Data        | DynamoDB (on-demand, single-table)   |
| IaC         | AWS SAM (`infra/template.yaml`)      |
| External    | [Pokémon TCG API v2](https://pokemontcg.io/) (optional key) |

## Free-Tier Safety

- **DynamoDB**: On-demand billing only  
- **Lambda**: 128 MB, 5 s timeout, no VPC, no provisioned concurrency  
- **CloudWatch Logs**: 7-day retention  
- **No** VPC, NAT Gateway, RDS, ECS/Fargate, or OpenSearch  

## Project Structure

```
/frontend          Next.js app (auth, binder UI, card search, drag-and-drop, undo)
/backend           Lambda handlers (TypeScript → dist/)
/infra/template.yaml   SAM template (Cognito, API Gateway, Lambda, DynamoDB)
README.md          This file
```

## Prerequisites

- Node.js 20+
- AWS CLI configured
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed

## Deployment

### 1. Build and deploy backend (SAM)

```bash
cd backend
npm install
npm run build
cd ..
sam build
sam deploy --guided
```

During `sam deploy --guided`, note:

- **Stack name**: e.g. `pokebinder-dev`
- **AWS Region**: e.g. `us-east-1`
- **Parameter Stage**: e.g. `dev`
- Confirm defaults; allow SAM to create the IAM role.

After deployment, note the outputs:

- **ApiUrl** – API Gateway HTTP API base URL  
- **UserPoolId** – Cognito User Pool ID  
- **UserPoolClientId** – Cognito App Client ID  

### 2. Configure and run frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` with your SAM outputs and region:

```env
NEXT_PUBLIC_API_URL=https://xxxxxxxx.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_REGION=us-east-1
# Optional: for higher rate limits on Pokémon TCG API
NEXT_PUBLIC_POKEMON_TCG_API_KEY=your-key-if-you-have-one
```

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, sign in, create a binder, add pages, search cards, and drag-and-drop to fill the 3×3 grid.

## AWS Budget alert (recommended)

To avoid unexpected charges and stay within free tier, create a budget and alert:

1. In AWS Console go to **Billing and Cost Management** → **Budgets** → **Create budget**.
2. Choose **Cost budget** → **Next**.
3. Set a **Budget name** (e.g. `pokebinder-free-tier`).
4. **Period**: Monthly.
5. **Budgeted amount**: e.g. **$5** (or $0 if you want to be notified of any spend).
6. **Configure alerts**:
   - Alert 1: **Actual** > **80%** of budgeted amount → email.
   - Alert 2: **Actual** > **100%** of budgeted amount → email.
   - (Optional) **Forecasted** > 100% → email.
7. Add your email under **Alert recipients**.
8. **Create budget**.

You can also scope the budget to only this stack’s resources using **Cost allocation tags** (tag resources in the SAM template and filter the budget by tag).

## Features

- **Auth**: Cognito sign up / sign in; JWT stored in httpOnly cookie; middleware protects `/binder` routes; logout.
- **Binders**: Create, list, get, delete; each binder has pages; each page has a 3×3 grid of slots (0–8).
- **Slots**: Put a card in a slot (or clear); drag-and-drop to swap cards; optimistic UI with rollback on API failure.
- **Undo**: Last slot mutation is kept in memory; revert via **Undo** and the `/slots/undo` API.
- **Card search**: Frontend calls Pokémon TCG API directly; 300 ms debounce; search by name; modal with thumbnails and details.

## API (Lambda)

All endpoints require a valid Cognito JWT (Bearer token). Ownership is enforced on every request.

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/binders` | Create binder (body: `{ name }`) |
| GET    | `/binders` | List binders |
| GET    | `/binders/{id}` | Get binder |
| GET    | `/binders/{id}/pages` | List pages |
| DELETE | `/binders/{id}` | Delete binder |
| POST   | `/pages` | Create page (body: `{ binderId, pageIndex }`) |
| DELETE | `/pages/{id}` | Delete page |
| GET    | `/slots?pageId=...` | List slots for a page |
| PUT    | `/slots` | Set slot (body: `{ pageId, position (0–8), card }`) |
| POST   | `/slots/undo` | Undo last slot change (body: `{ pageId, position, previousCard }`) |

## DynamoDB single-table design

**Table**: `PokebinderTable-<Stage>`

| Entity | PK | SK |
|--------|----|----|
| User   | `USER#<userId>` | `PROFILE` |
| Binder | `USER#<userId>` | `BINDER#<binderId>` |
| Page   | `BINDER#<binderId>` | `PAGE#<pageIndex>` |
| Page lookup (by pageId) | `PAGE#<pageId>` | `METADATA` |
| Slot   | `PAGE#<pageId>` | `SLOT#<position>` |

No GSIs required for the current MVP.

## License

MIT.
