import { describe, test, expect } from "bun:test";
import { runCLI, parseJSON } from "./helpers";

interface SearchResponse {
  meta: { count: number; total: number; page: number };
  results: Array<{ id: string; title: string; company: string | null; location: string | null; date: string | null; url: string }>;
}

describe("Platsbanken CLI live smoke test", () => {
  test("search returns real results with populated fields", async () => {
    const result = await runCLI(["search", "-q", "konsult", "--limit", "5"]);
    const parsed = parseJSON<SearchResponse>(result);
    expect(parsed.results.length).toBeGreaterThan(0);
    const first = parsed.results[0];
    expect(first.id).toBeTruthy();
    expect(first.title).toBeTruthy();
    expect(first.url).toContain("arbetsformedlingen.se");
  });

  test("detail returns a readable description for a result from search", async () => {
    const searchResult = await runCLI(["search", "-q", "konsult", "--limit", "1"]);
    const parsed = parseJSON<SearchResponse>(searchResult);
    const id = parsed.results[0].id;

    const detailResult = await runCLI(["detail", id, "--format", "plain"]);
    expect(detailResult.exitCode).toBe(0);
    expect(detailResult.stdout.length).toBeGreaterThan(0);
  });

  test("bogus --jobage exits 1 with a JSON error on stderr", async () => {
    const result = await runCLI(["search", "-q", "konsult", "--jobage", "notanumber"]);
    expect(result.exitCode).toBe(1);
    const err = JSON.parse(result.stderr);
    expect(err.code).toBe("BAD_ARG");
  });

  test("missing search arguments still returns valid (unfiltered) results", async () => {
    const result = await runCLI(["search", "--limit", "1"]);
    expect(result.exitCode).toBe(0);
  });
});
