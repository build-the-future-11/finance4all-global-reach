"""CI-only concurrency certification against the disposable Docker database.

No URL or credentials accepted. Only the CI service container ID is used.
Creates unique test accounts and removes them in finally, including budget rows.
"""
import concurrent.futures
import os
import subprocess
import uuid

container = os.environ["POSTGRES_CONTAINER"]
if os.environ.get("CI") != "true" or not container:
    raise SystemExit("This certification requires the disposable CI service")
actor, other = str(uuid.uuid4()), str(uuid.uuid4())
article = str(uuid.uuid4())


def sql(statement, check=True):
    result = subprocess.run(
        ["docker", "exec", "-i", container, "psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres"],
        input=statement, text=True, capture_output=True, timeout=40,
    )
    if check and result.returncode:
        raise AssertionError(result.stderr)
    return result


def insert(i, who=actor):
    return sql(f"""BEGIN; SET LOCAL statement_timeout='15s'; SET LOCAL ROLE authenticated;
      SELECT set_config('request.jwt.claim.sub','{who}',true);
      INSERT INTO public.introduction_posts(author_id,headline,looking_for)
      VALUES(auth.uid(),'Concurrent fixture {i}','Disposable certification only'); COMMIT;""", False)


try:
    sql(f"INSERT INTO auth.users(id,email) VALUES ('{actor}','budget-{actor}@example.test'),('{other}','budget-{other}@example.test');")
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        results = list(pool.map(insert, range(16)))
    passed = sum(result.returncode == 0 for result in results)
    denied = sum(result.returncode != 0 and "Hourly activity limit reached" in result.stderr for result in results)
    assert (passed, denied) == (5, 11), (passed, denied, [r.stderr for r in results if r.returncode])
    assert sql(f"SELECT count(*) FROM public.introduction_posts WHERE author_id='{actor}';").stdout.strip() == "5"
    assert sql(f"SELECT used FROM private.member_write_budgets WHERE user_id='{actor}' AND action='introduction_posts';").stdout.strip() == "5"
    assert insert(99, other).returncode == 0, "Account A exhausted account B's budget"
    print("PASS: 16 concurrent requests -> exactly 5 commits, 11 quota denials; independent account succeeds")
    sql(f"UPDATE public.profiles SET role='admin' WHERE id='{other}'; INSERT INTO public.news_articles(id,title,summary,category) VALUES ('{article}','Concurrent review fixture','Disposable review certification','macro');")

    def review(_):
        return sql(f"""BEGIN; SET LOCAL statement_timeout='15s'; SET LOCAL ROLE authenticated;
          SELECT set_config('request.jwt.claim.sub','{other}',true);
          SELECT public.review_publication('news_articles','{article}',0,'published','Concurrent fixture review evidence'); COMMIT;""", False)

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        reviews = list(pool.map(review, range(8)))
    assert sum(r.returncode == 0 for r in reviews) == 1, [r.stderr for r in reviews]
    assert sum(r.returncode != 0 and 'Content changed.' in r.stderr for r in reviews) == 7, [r.stderr for r in reviews]
    assert sql(f"SELECT count(*) FROM private.publication_reviews WHERE content_id='{article}';").stdout.strip() == '1'
    print("PASS: 8 concurrent reviews -> exactly 1 approval/audit record and 7 stale-revision denials")
finally:
    sql(f"DELETE FROM private.publication_reviews WHERE content_id='{article}'; DELETE FROM public.news_articles WHERE id='{article}';")
    sql(f"DELETE FROM auth.users WHERE id IN ('{actor}','{other}');")
    assert sql(f"SELECT count(*) FROM private.member_write_budgets WHERE user_id IN ('{actor}','{other}');").stdout.strip() == "0"
    print("PASS: disposable identities, content and counters cleaned up")
