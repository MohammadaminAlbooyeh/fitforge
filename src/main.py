import sys
import time
import os
import logging
import signal
import threading
import argparse
import concurrent.futures
from typing import Any, List, Optional, Callable


def create_item(item: Any) -> Any:
    # Simulate a time-consuming item creation process
    time.sleep(1)
    return {"item": item, "status": "created"}

def create_tasks() -> List[str]:
    # Simulate task creation
    return [f"task_{i}" for i in range(10)]

def run_thread_pool(
    tasks: List[Any],
    worker: Optional[Callable[[Any], Any]] = None,
    max_workers: int = 5,
) -> List[Any]:
    """Run tasks in a ThreadPoolExecutor using `worker` for processing each item.

    - `worker` defaults to `create_item` when not provided.
    - Returns a list of results collected in completion order.
    """
    if worker is None:
        worker = create_item

    results: List[Any] = []

    # Provide a way for signal handler to cancel pending futures.
    _active_futures: List[concurrent.futures.Future] = []
    _futures_lock = threading.Lock()

    def _register_future(fut: concurrent.futures.Future) -> None:
        with _futures_lock:
            _active_futures.append(fut)

    def _unregister_future(fut: concurrent.futures.Future) -> None:
        with _futures_lock:
            try:
                _active_futures.remove(fut)
            except ValueError:
                pass

    def _cancel_pending_futures() -> None:
        with _futures_lock:
            for fut in list(_active_futures):
                try:
                    fut.cancel()
                except Exception:
                    pass

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_task = {executor.submit(worker, task): task for task in tasks}
        for fut in list(future_to_task.keys()):
            _register_future(fut)

        try:
            for future in concurrent.futures.as_completed(future_to_task):
                _unregister_future(future)
                task = future_to_task[future]
                try:
                    result = future.result()
                    results.append(result)
                except Exception as exc:
                    logging.error(f'Task {task} generated an exception: {exc}')
        except KeyboardInterrupt:
            logging.warning("KeyboardInterrupt received; cancelling pending tasks")
            _cancel_pending_futures()
            raise

    return results

def main(argv: Optional[List[str]] = None) -> int:
    if argv is None:
        argv = sys.argv[1:]

    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the item creation process")

    tasks = create_tasks()
    logging.info(f"Created {len(tasks)} tasks")

    # Parse CLI args (optional) to override environment settings.
    parser = argparse.ArgumentParser(description="Run threaded item creation demo")
    parser.add_argument(
        "--max-workers",
        type=int,
        default=None,
        help="Maximum number of worker threads (overrides MAX_WORKERS env)",
    )
    args = parser.parse_args(argv)

    # Allow configuration of max workers via CLI or environment variable `MAX_WORKERS`.
    try:
        if args.max_workers is not None:
            max_workers = args.max_workers
        else:
            max_workers_env = os.getenv("MAX_WORKERS")
            max_workers = int(max_workers_env) if max_workers_env else 5
    except ValueError:
        max_workers = 5

    # Install simple signal handlers to allow graceful shutdown.
    shutdown_event = threading.Event()

    def _signal_handler(signum, frame):
        logging.info(f"Received signal {signum}; initiating shutdown")
        shutdown_event.set()

    signal.signal(signal.SIGINT, _signal_handler)
    try:
        signal.signal(signal.SIGTERM, _signal_handler)
    except AttributeError:
        # Windows may not have SIGTERM
        pass

    try:
        results = run_thread_pool(tasks, worker=create_item, max_workers=max_workers)
        logging.info(f"Successfully created {len(results)} items")

        for result in results:
            logging.info(result)
    except KeyboardInterrupt:
        logging.info("Interrupted by user")

    return 0


if __name__ == "__main__":
    sys.exit(main())