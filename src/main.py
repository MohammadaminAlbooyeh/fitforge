import sys
import time
import os
import logging
import concurrent.futures
from typing import Any
import ThreadPoolExecutor
import as_completed


def create_item(item: Any) -> Any:
    # Simulate a time-consuming item creation process
    time.sleep(1)
    return {"item": item, "status": "created"}

def create_tasks() -> list:
    # Simulate task creation
    return [f"task_{i}" for i in range(10)]

def run_thread_pool(tasks: list, max_workers: int = 5) -> list:
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_task = {executor.submit(create_item, task): task for task in tasks}
        for future in concurrent.futures.as_completed(future_to_task):
            task = future_to_task[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as exc:
                logging.error(f'Task {task} generated an exception: {exc}')
    return results

def main(argv: list) -> int:
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the item creation process")

    tasks = create_tasks()
    logging.info(f"Created {len(tasks)} tasks")

    results = run_thread_pool(tasks, max_workers=5)
    logging.info(f"Successfully created {len(results)} items")

    for result in results:
        logging.info(result)

    return 0
if __name__ == "__main__":
    sys.exit(main(sys.argv))