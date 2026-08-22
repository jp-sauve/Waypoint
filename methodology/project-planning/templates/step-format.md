# Implementation Step Template

Use this exact structure for every step in `mvp-implementation-plan.md`. Copy the block, fill it in, do not drop or rename fields — the implementing session and `STATUS.md` both depend on this shape being consistent across every step.

```markdown
### Step N: <Short imperative title>

**Goal**: One sentence — what exists after this step that didn't before.

**Preconditions**: Step numbers that must be complete first (or "None — first step").

**Files to create/modify**:
- `path/to/file.ts` (create)
- `path/to/other.ts` (modify: add X)

**Details**:
Enough specification to implement without consulting any other design doc, EXCEPT where a signature or schema must match another doc exactly — in that case, name the doc and the exact symbol (e.g., "implement `resolveDependencies()` per the signature in `public-api.md`") rather than restating it and risking drift.

**Acceptance criteria**:
- Concrete and checkable, e.g.: "`pnpm test packages/core/src/resolver.test.ts` passes."
- "A manifest missing a required dependency throws `MissingDependencyError` (see `public-api.md`)."
- Avoid vague criteria like "works correctly" or "handles errors properly."

**Out of scope**:
- Explicit list of things NOT to do in this step, even if related or tempting, to prevent scope creep into later steps.
```

## Phase header format

Group steps under phase headers matching `STATUS.md` exactly:

```markdown
## Phase 0: Tooling & Scaffolding

Steps 1-4. <one sentence describing what this phase delivers>

### Step 1: ...
### Step 2: ...
```
