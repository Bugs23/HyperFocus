import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("idle");
  const [searchError, setSearchError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const SEARCH_URL = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*&srlimit=20`;
  const DETAILS_URL = `https://en.wikipedia.org/w/api.php?action=${searchQuery}&prop=extracts|info&pageids=10&format=json&origin=*&exintro=1&explaintext=1&inprop=url`;

  function htmlToTtext(item) {
    const parser = new DOMParser().parseFromString(item, "text/html");
    return parser.body.textContent || "";
  }

  // Debounce
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => {
      clearTimeout(id);
    };
  }, [searchInput]);

  async function fetchData() {
    if (!searchQuery) return;
    /* LOAD */
    setSearchStatus("loading");
    setSearchError("");
    setSearchResults([]);

    /* SEND */
    try {
      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*&srlimit=20`,
      );
      /* VALIDATE */
      if (!res.ok) {
        setSearchStatus("error");
        setSearchError("Something went wrong");
        return;
      }
      /* UI */
      const data = await res.json();
      const results = data?.query?.search ?? [];

      if (results.length === 0) {
        setSearchStatus("success");
        setSearchError(`No results for ${searchQuery}`);
        return;
      }

      setSearchResults(
        results.map((result) => ({
          id: result.pageid,
          title: result.title,
          snippet: htmlToTtext(result.snippet),
          detailsStatus: "idle",
          detailsError: "",
          details: null,
        })),
      );

      setSearchStatus("success");
    } catch (err) {
      console.error(err);
      setSearchStatus("error");
      setSearchError("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Topic Explorer</h1>
          <div className="text-sm text-slate-500">Wikipedia API</div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <section className="rounded-xl p-4 bg-white shadow-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-lg">
            <label className="flex flex-1 items-center gap-3">
              <span className="sr-only">Search topics</span>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none bg-slate-100"
                placeholder="Search Wikipedia topics"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </label>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50 cursor-pointer">
                Clear
              </button>
              <button
                onClick={fetchData}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </section>
        {/* Results */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Results</h2>
          </div>
          <div className="mt-3 grid gap-3">
            {searchResults.map((r) => (
              <article className="rounded-xl shadow-md bg-white p-4">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <a
                      href={`https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replaceAll(" ", "_"))}`}
                      target="_blank"
                    >
                      <h3 className="text-lg font-bold">{r.title}</h3>
                    </a>
                    <p className="text-base">
                      {r.snippet.replace(/<[^>]*>/g, "")}
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center gap-3">
                    <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap">
                      View Details
                    </button>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Compare
                    </label>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
