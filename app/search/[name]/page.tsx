import { redirect } from "next/navigation";
import Fuse from "fuse.js";

type Props = {
  params: { name: string };
};

export default async function SearchPage({ params }: Props) {
  const { name } = await params;
  const query = decodeURIComponent(name);

  const res = await fetch(
    `https://api.themoviedb.org/3/search/multi?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${query}&language=en-US`
  );
  const data = await res.json();

  const results = data?.results?.filter(
    (item: any) =>
      (item.media_type === "movie" || item.media_type === "tv") &&
      (item.title || item.name)
  );

  if (!results || results.length === 0) {
    return <div className="text-white p-4">There is no results</div>;
  }

  const fuse = new Fuse(results, {
    keys: ["title", "name"],
    threshold: 0.4,
  });

  const fuzzyResults = fuse.search(query);

  const bestMatch = fuzzyResults[0]?.item || results[0];

  const targetRoute = `/${bestMatch.media_type}-${bestMatch.id}`;
  redirect(targetRoute);
}
