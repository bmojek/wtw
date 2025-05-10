import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: { id: string };
};

export default async function MediaPage({ params }: Props) {
  const { id } = await params;

  const [type, mediaId] = id.split("-");

  if (!type || !mediaId) return notFound();

  // Wybór kraju - w tym przypadku domyślnie "PL" (Polska)
  const country = "PL"; // Można to zmienić dynamicznie, np. na podstawie lokalizacji użytkownika

  const mediaRes = await fetch(
    `https://api.themoviedb.org/3/${type}/${mediaId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`
  );
  const media = await mediaRes.json();

  if (!media) return notFound();

  // Zapytanie o dostępnych dostawców z dynamicznym kodem kraju
  const providersRes = await fetch(
    `https://api.themoviedb.org/3/${type}/${mediaId}/watch/providers?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`
  );
  const providers = await providersRes.json();

  // Dynamically retrieve providers for the selected country (PL in this case)
  const platforms = providers?.results?.[country]?.flatrate || [];

  return (
    <div className="p-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Przycisk do powrotu na stronę główną */}
          <div className="absolute top-10 left-10 z-10">
            <Link href="/" passHref>
              <button className="bg-primary cursor-pointer text-text py-2 px-4 rounded-lg shadow-md hover:bg-indigo-500 transition-all">
                &#8592;
              </button>
            </Link>
          </div>

          <div className="lg:w-1/3 flex-shrink-0">
            <img
              src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
              alt={media.title || media.name}
              className="w-full rounded-lg shadow-lg "
            />
          </div>

          <div className="lg:ml-10 mt-8 lg:mt-0 flex-1">
            <h1 className="text-4xl font-extrabold text-primary">
              {media.title || media.name}
            </h1>
            <p className="mt-2 text-muted">
              Release Date: {media.release_date || media.first_air_date}
            </p>
            <p className="mt-4 text-lg">{media.overview}</p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-semibold">Rating: </span>
              <span className="text-xl">{media.vote_average} / 10</span>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Available On
              </h3>
              {platforms.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-white">Watch</h4>
                  <div className="flex flex-wrap gap-6">
                    {platforms.map((platform: any) => (
                      <a
                        key={platform.provider_id}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3 border border-gray-700 rounded-full hover:bg-primary hover:text-white transition duration-300"
                      >
                        <img
                          src={`https://www.themoviedb.org/t/p/w92${platform.logo_path}`}
                          alt={platform.provider_name}
                          className="w-12 h-12"
                        />
                        <span className="text-sm font-medium">
                          {platform.provider_name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
