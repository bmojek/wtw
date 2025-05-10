"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";

type MediaType = "movie" | "tv";

type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  media_type: MediaType;
  popularity?: number;
};

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
            query
          )}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`
        );
        const data = await res.json();
        const filtered: MediaItem[] = (data.results || []).filter(
          (item: MediaItem) =>
            item.media_type === "movie" || item.media_type === "tv"
        );

        const fuse = new Fuse(filtered, {
          keys: ["title", "name"],
          threshold: 0.4,
        });

        const fuzzyResults: MediaItem[] = fuse.search(query).map((r) => r.item);
        fuzzyResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

        setResults(fuzzyResults.slice(0, 20));
      } catch (err) {
        console.error("Error searching:", err);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-24 bg-background text-text">
      <section className="flex flex-col items-center justify-center bg-surface px-10 py-20 rounded-lg shadow-lg w-full max-w-xl">
        <h1 className="text-4xl font-bold text-primary">Where to watch</h1>
        <p className="mt-4 text-lg text-muted">
          Find out where to watch your favorite movies and shows.
        </p>
        <div className="mt-8 w-full relative">
          <input
            type="text"
            placeholder="Search for a movie or show..."
            className="px-4 py-2 border border-muted rounded w-full bg-background text-text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {results.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-surface border border-muted mt-1 rounded max-h-60 overflow-y-auto z-10">
              {results.map((media) => (
                <li
                  key={media.id}
                  className="px-4 py-2 hover:bg-primary cursor-pointer"
                  onClick={() =>
                    router.push(`/${media.media_type}-${media.id}`)
                  }
                >
                  {(media.media_type === "movie" ? media.title : media.name) ||
                    "Untitled"}{" "}
                  (
                  {media.media_type === "movie"
                    ? media.release_date?.slice(0, 4)
                    : media.first_air_date?.slice(0, 4)}
                  )
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
