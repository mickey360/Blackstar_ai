# Blackstar AI — Architecture Notes

## Runtime model
The browser owns workflow state and most orchestration. The Next.js server is a thin stateless execution gateway. Python is exposed as a separate Vercel Function for Python-heavy transformations. Rust contains portable high-performance primitives and can be compiled locally/WASM in a future adapter.

## Why local-first
A database would add credentials, deployment dependencies and recurring service constraints. For a hobby portfolio application, workflow definitions, templates and settings are stored locally. JSON import/export makes projects portable.

## AI strategy
Blackstar does not require a paid AI API. The default AI provider is deterministic and transparent so the demo always works. An optional Hugging Face compatible endpoint can be enabled with `HF_TOKEN`. A future browser WebGPU provider can be plugged into `lib/ai.ts` without changing the workflow contract.

## Execution safety
The engine deliberately exposes a small set of operations instead of evaluating arbitrary JavaScript or Python supplied by users. HTTP is constrained to browser/server fetch semantics; Python nodes use predefined operations. This is safer for a public portfolio deployment.
