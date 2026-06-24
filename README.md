# Reusable Workflow Builder with AI

เครื่องมือสร้าง workflow แบบ **node-based ลาก-วาง** ที่นำกลับมารันซ้ำได้ และมี AI ฝังอยู่ 2 จุด —
**AI node** ที่ทำงานจริงตอน workflow รัน และ **AI helper** ที่ช่วยประกอบ workflow ตอนสร้าง

สแต็ก: **Next.js (App Router, TS) · React Flow · Prisma/Postgres · Inngest · Vercel AI SDK**

> **สถานะ: Day 1 scaffold** — โปรเจกต์ตั้งต้น + hello-world บน Inngest + shared contract (`lib/graph.ts`) พร้อมต่อ Day 2

---

## ทำไมถึงออกแบบแบบนี้

- **ไม่เขียน execution engine เอง** — ใช้ **Inngest** เพื่อได้ durability / retry ต่อ step / cron / event trigger ระดับ production ตั้งแต่วันแรก ขอบเขตของโปรเจกต์คือ canvas + node registry + AI + interpreter เท่านั้น
- **interpreter ตัวเดียวอ่าน graph JSON** — ไม่ compile graph เป็นโค้ด workflow เก็บเป็น JSON ใน Postgres เมื่อ trigger Inngest function ตัวเดียวเดินทีละ node ตาม `next` โดยแต่ละ node = `step.run()`
- **เพิ่ม node ใหม่ = เพิ่ม 1 entry ใน registry** ไม่ต้องแตะ engine
- **deploy production ตั้งแต่ Day 1** — ไม่ปล่อยให้ integration ค้างถึงท้าย sprint

---

## สถาปัตยกรรม

```
Next.js app (deploy เดียว)
  ├─ Canvas UI (React Flow) + AI helper panel
  ├─ API routes: /api/workflows /api/run /api/hooks/[id] /api/assistant /api/inngest
  ├─ Postgres (Prisma): Workflow, Run, NodeRun
  └─ Inngest: รันแต่ละ node เป็น step.run() → retry + durable + cron ในตัว
```

Triggers ทุกทาง (UI Run / POST /api/run / webhook / cron) รวมเป็น event เดียว
`inngest.send("workflow.run", {...})` → interpreter

---

## โครงไฟล์

```
app/
  api/inngest/route.ts      # Inngest handler (serve functions)
  api/test-hello/route.ts   # ปุ่มยิง hello event (Day 1 smoke test)
  layout.tsx  page.tsx      # หน้าแรก + ปุ่มทดสอบ
lib/
  graph.ts                  # CONTRACT ร่วม (Graph / Envelope / NodeDef) — ห้ามเปลี่ยนเดี่ยว
  inngest.ts                # client + functions (hello-world)
  db.ts                     # Prisma client (singleton)
prisma/schema.prisma        # Workflow / Run / NodeRun
```

จะทยอยเพิ่มตามแผน: `lib/interpreter.ts`, `lib/nodes/*`, `app/(canvas)/*`,
`app/runs/[id]/page.tsx`, `app/api/{run,hooks,workflows,assistant}/route.ts`

---

## Contract กลาง (`lib/graph.ts`)

สัญญาระหว่างทีม A (engine) กับทีม B (canvas) — **แก้ shape นี้พร้อมกันเท่านั้น**

- `Graph` = `{ nodes, edges }`
- `Node` = `{ id, type, config, onError, next, position }` (`type` = key ใน registry)
- `Envelope` = `{ status, data, error }` — ก้อนข้อมูลที่ไหลระหว่าง node; output ของ node หนึ่ง = input ของ node ถัดไป (node อ่านจาก `input.data`)
- `NodeDef` = `{ schema, run, meta }` — config schema (Zod) เป็นแหล่งความจริงเดียว ใช้ทั้ง validate, gen ฟอร์มใน UI, และแปลงเป็น JSON Schema ให้ AI

**Error policy ต่อ node (`onError`):** `stop` (default, run failed) · `continue` (ข้าม) · `route` (ไป edge ชื่อ `error`)

---

## รันบนเครื่อง (local dev)

1. ติดตั้ง dependencies
   ```bash
   npm install
   ```
2. ตั้ง env — copy แล้วกรอกค่า (อย่างน้อย `DATABASE_URL` — Neon/Supabase free tier ก็ได้)
   ```bash
   cp .env.example .env
   ```
3. สร้างตารางใน DB
   ```bash
   npm run db:push        # หรือ npm run db:migrate ถ้าต้องการ migration file
   ```
4. เปิด 2 terminal
   ```bash
   npm run dev            # terminal 1 — Next.js ที่ http://localhost:3000
   npm run inngest:dev    # terminal 2 — Inngest dev server ที่ http://localhost:8288
   ```
5. ทดสอบ hello-world — เปิด http://localhost:3000 → กดปุ่ม "ยิง hello-world event"
   → ดูที่ http://localhost:8288 ว่า function `hello-world` รันสำเร็จ

---

## Deploy (Day 1 acceptance)

**เป้า:** URL production เปิดได้ + Inngest function รันบน cloud เห็นใน dashboard

1. push repo ขึ้น GitHub
2. import เข้า **Vercel** → ตั้ง env (`DATABASE_URL`, `OPENAI_API_KEY`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`)
3. ไป **Inngest Cloud** → เชื่อม Vercel integration หรือ sync endpoint `https://<your-app>.vercel.app/api/inngest`
4. ยิง event บน prod (กดปุ่มในหน้าเว็บ) → เห็น run ใน Inngest Cloud dashboard

> ทั้ง stack เป็น TS/Node จะ deploy เป็น Docker container แทน Vercel ก็ได้

---

## เพิ่ม node ใหม่ (จะใช้จริงตั้งแต่ Day 2)

สร้าง `lib/nodes/my-node.ts`:

```ts
import { z } from "zod";
import { ok, type NodeDef } from "@/lib/graph";

export const myNode: NodeDef = {
  schema: z.object({ greeting: z.string() }),
  meta: { label: "My Node", description: "อธิบายให้ AI helper เข้าใจ" },
  run: async (cfg, input, ctx) => {
    ctx.log(`running ${ctx.nodeId}`);
    return ok({ ...input.data, msg: cfg.greeting });
  },
};
```

แล้ว register ใน `lib/nodes/registry.ts` (มาใน Day 2)

**Node v1 (6 ตัว):** `trigger` · `ai.instruct` · `if` · `http.request` · `email.send` · `transform`

---

## Roadmap (8 วัน · A = engine, B = canvas)

| วัน | A (engine) | B (canvas) |
|----|-----------|-----------|
| 1 | scaffold + deploy + contract ร่วม ✅ | scaffold + deploy ✅ |
| 2 | interpreter + `trigger`/`transform` + Run/NodeRun | ลาก/ต่อ node + save/load graph |
| 3 | `ai.instruct` + structured output + retry + error policy | gen ฟอร์ม config จาก Zod + palette |
| 4 | `http.request`/`email.send`/`if` | หน้า Run + log NodeRun |
| 5 | webhook route + Inngest cron | AI Helper panel → วาง graph ลง canvas |
| 6 | ประกอบ 2 workflow จริง end-to-end (ทั้งคู่) | |
| 7 | harden: validate, secret handling, auth, `interpreter.test.ts` | |
| 8 | polish + deploy รอบจริง + demo | |

**ตัดได้ถ้าเวลาไม่พอ:** `wait.approval` → node เกิน 6 ตัว → multi-user → sandbox ของ `transform`
**ห้ามตัด:** deploy Day 1 · error path ของ AI node · secret handling · interpreter test

---

## 2 Workflow ตัวอย่าง (เกณฑ์ว่าระบบครบ)

- **Resume Triage:** `trigger(webhook)` → `ai.instruct`(คืน `{decision, score, reason}`) → `if(decision)` → reject: `email.send` / approve: `http.request`
- **Weekly Brief:** `trigger(cron)` → `http.request`(ดึงข้อมูล) → `transform` → `ai.instruct`(สรุป) → `email.send`
