# Extend Project

Inspects an existing codebase and turns what it finds — plus a short, targeted round
of questions about the new capability — into a reference doc another agent (or you,
afterward) can plan against. The existing-project counterpart to
{{artifact:start-project}}: read the repo instead of interviewing from a blank slate.

## Purpose

Never plan a new feature for an existing project by re-deriving a stack and set of
conventions from scratch, or by guessing at how the codebase is organized. This
skill's job is ONLY to inspect the repo and capture what's already there alongside
what's being added — not to design the feature or write code. Planning happens in a
separate step, after the reference doc is confirmed.

## When to use this

The project already has code, and the user wants to add a feature, subsystem, or — for
example — a new variant of something the project already has several of (a new game
type, a new content type, a new integration). If `docs/design/STATUS.md` already
exists and is driving implementation, use that instead; this skill is for the gap
before a planning package exists.

## How to inspect the repo

1. **Read `package.json` first** (or the equivalent manifest for the language in use):
   framework and major dependencies, `scripts`, module system. This alone usually
   settles language, framework, and package manager.
2. **Read config files** that exist: `tsconfig.json`, bundler/build config (Vite,
   webpack, Next.js config), lint/format config, test config. Don't guess a
   convention that a config file already states.
3. **Map the folder structure**, focused on where the domain's existing variants
   live — for a game, how current game types are organized and registered; more
   generally, look for the pattern the new addition should follow (a `src/games/*`
   directory, a plugin/registry file, a shared interface or base class). Open one or
   two representative existing examples of that pattern, not just the directory
   listing.
4. **Note the shared surface** the new addition will need to plug into: a common
   engine/interface, shared state management, a rendering loop, an event bus, routing.
   This is what "extension points" means below — not every file, just the ones a new
   variant actually has to touch or implement.
5. **Check for existing docs** — README, CONTRIBUTING, an existing `docs/` folder —
   and fold in anything relevant instead of re-discovering it from code.

## How to ask about what's being added

Once the repo itself is understood, ask about the parts inspection can't answer —
small batches, conversational tone, same discipline as {{artifact:start-project}}:

1. **What is it?** One or two sentences on the new capability — what it does, how a
   user encounters it.
2. **How does it relate to what exists?** Is it a new instance of an existing pattern
   (a new game type alongside current ones) or something structurally new? If the
   former, confirm the extension point identified above is the right one.
3. **Scope boundaries.** Anything explicitly reused vs. net-new (assets, rules,
   scoring, persistence)? Anything explicitly out of scope for this addition?
4. **Constraints the codebase doesn't already answer** — a deadline, a reason to
   deviate from the detected stack/conventions, anything the user already knows they
   want done differently this time.

Infer instead of re-asking anything the repo already answers or the user already
stated. If an answer is vague, ask one concrete follow-up rather than leaving it open.

## Output format

Once the repo is inspected and the questions above are answered, produce a structured
reference doc in markdown, using this shape:

```markdown
# Project Context: [Project Name]

## Detected Stack
- Language/framework:
- Package manager:
- Key dependencies:
- Test framework:
- Build/deploy config found:

## Architecture Summary
- [How the codebase is organized, in a few bullets — not a full file tree]

## Conventions
- Naming/file organization:
- Styling approach:
- State management approach:
- Other repo-specific patterns worth following:

## Relevant Extension Points
- [The specific interface(s), registry, or pattern the new work should plug into,
  with file paths, and one existing example to model it on]

## What's Being Added
- Description:
- Relationship to existing patterns (new instance vs. structurally new):
- Reused vs. net-new:
- Out of scope:

## Open Questions / Assumptions
- [Anything the user was unsure about, and the default you're proposing]
```

Save this doc to `project-context.md` at the project's repository root — a sibling of
where `docs/design/` will be created, not inside it, so {{artifact:project-planning}}
can find it automatically. Once saved and confirmed, tell the user the doc is ready and
that the next step is running {{artifact:project-planning}}, which reads
`project-context.md` and matches its detected stack instead of proposing a fresh one.

## What NOT to do

- Don't start writing code or design mockups during inspection.
- Don't propose a different stack, framework, or architecture than what's detected —
  that's not this skill's job; note a mismatch (if the user asks for something the
  current stack can't do) under Open Questions/Assumptions instead of resolving it.
- Don't read the entire codebase file-by-file — inspect enough to fill in the fields
  above, not a full audit.
- Don't ask about anything the repo's own files or the user's first message already
  answered.
- Don't invoke {{artifact:project-planning}} or start building yourself — tell the
  user it's the next step and stop.
