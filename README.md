# intor_to_threading

A tiny demo project that shows how to introduce simple threading to a Python script using
`concurrent.futures.ThreadPoolExecutor`.

## Goals

- Provide a minimal `src/main.py` entrypoint that can be extended to process tasks concurrently.
- Show a small, reproducible quickstart for running and testing the project.

## Requirements

- Python 3.8+

## Quickstart

Create and activate a virtual environment, then install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run the demo script:

```bash
python src/main.py
# or
python -m src.main
```

## What to expect

The repository contains a minimal `src/main.py` that will be extended to use a thread pool
to process a set of tasks. The implementation uses the standard library (`concurrent.futures`) so
no extra runtime libraries are required for the threading itself.

## Testing

We include `pytest` as a development dependency. To run tests:

```bash
pytest -q
```

## Next steps

- Add or implement `process_item`, `create_tasks`, and `run_thread_pool` in `src/main.py`.
- Decide whether you want results in input order (`executor.map`) or completion order (`as_completed`).
- Tell me when to proceed to the next step and I'll implement the threading code into `src/main.py`.

---

If you want a different layout (e.g., separate `src/concurrency.py`), tell me and I'll adapt.
