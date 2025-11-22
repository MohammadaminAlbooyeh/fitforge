import time

from src.main import run_thread_pool


def test_thread_pool_parallelism():
    """Verify that worker tasks run in parallel using the thread pool.

    This test submits several short-sleep tasks and asserts the total elapsed time
    is significantly less than the sum of individual sleeps (i.e., they ran concurrently).
    """
    def sleep_worker(s: float):
        time.sleep(s)
        return s

    tasks = [0.5] * 5
    t0 = time.time()
    results = run_thread_pool(tasks, worker=sleep_worker, max_workers=5)
    elapsed = time.time() - t0

    assert len(results) == 5
    # With 5 workers and 0.5s sleeps, elapsed should be around ~0.5-0.8s.
    assert elapsed < 1.5
