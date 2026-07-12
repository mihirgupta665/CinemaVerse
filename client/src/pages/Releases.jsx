import React, { useEffect, useMemo, useState } from "react";
import { CalendarDaysIcon, Clock3Icon, PlayCircleIcon, StarIcon } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";

const Releases = () => {
    const { axios, image_base_url, navigate } = useAppContext();

    const [latestShows, setLatestShows] = useState(null);

    useEffect(() => {
        const fetchRecentShows = async () => {
            try {
                const { data } = await axios.get("/api/show/recent");

                if (data.success) {
                    setLatestShows(data.shows);
                } else {
                    setLatestShows([]);
                }
            } catch (err) {
                console.error("Failed to fetch releases", err);
                setLatestShows([]);
            }
        };

        fetchRecentShows();
    }, [axios]);

    const showGroups = useMemo(() => {
        if (!latestShows) return [];
        const groups = [];
        for (let i = 0; i < latestShows.length; i += 4) {
            groups.push(latestShows.slice(i, i + 4));
        }
        return groups;
    }, [latestShows]);

    if (latestShows === null) return <Loading />;

    return (
        <section className="relative overflow-hidden min-h-screen px-6 md:px-14 lg:px-24 xl:px-36 py-28">

            <BlurCircle
                top="-140px"
                left="-120px"
                size="h-[28rem] w-[28rem]"
            />

            <BlurCircle
                top="35%"
                right="-180px"
                size="h-[24rem] w-[24rem]"
            />

            <BlurCircle
                bottom="-120px"
                left="25%"
                size="h-[20rem] w-[20rem]"
            />

            <div className="relative z-10 max-w-5xl">

                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-primary">
                    New Releases
                </span>

                <h1 className="mt-7 text-5xl md:text-6xl xl:text-7xl font-bold leading-tight">
                    Fresh Shows Added
                    <br />
                    This Week
                </h1>

                <p className="mt-6 max-w-3xl text-gray-400 text-lg leading-8">
                    Explore the latest movie shows recently published by the admin.
                    Browse schedules, discover new titles, and reserve your seats
                    before they fill up.
                </p>

                <div className="mt-12 flex flex-wrap gap-4">

                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-4">
                        <p className="text-sm text-gray-400">Latest Shows</p>
                        <h3 className="mt-1 text-3xl font-bold">
                            {latestShows.length}
                        </h3>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-4">
                        <p className="text-sm text-gray-400">Updated</p>
                        <h3 className="mt-1 text-3xl font-bold">7 Days</h3>
                    </div>

                </div>
            </div>

            <div className="relative z-10 mt-20 space-y-24">

                {/* ========= PART 1 ENDS HERE ========= */}
                {/* Paste Part 2 immediately below this line */}


                {latestShows.length > 0 ? (
                    showGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="relative">

                            {groupIndex % 2 === 0 ? (
                                <BlurCircle
                                    top="-80px"
                                    left="-120px"
                                    size="h-[18rem] w-[18rem]"
                                />
                            ) : (
                                <BlurCircle
                                    top="-80px"
                                    right="-120px"
                                    size="h-[18rem] w-[18rem]"
                                />
                            )}

                            <div className="relative grid gap-8 lg:grid-cols-2">

                                {group.map((show) => {

                                    const movie = show.movie;
                                    const showDate = new Date(show.showDateTime);

                                    return (

                                        <article
                                            key={show._id}
                                            className="group overflow-hidden rounded-[32px]
                      border border-white/10
                      bg-[#09090c]/80
                      backdrop-blur-xl
                      transition-all duration-500
                      hover:-translate-y-2
                      hover:border-primary/40
                      hover:shadow-[0_30px_90px_rgba(255,67,104,.18)]"
                                        >

                                            <div className="relative overflow-hidden h-60">

                                                <img
                                                    src={image_base_url + movie.backdrop_path}
                                                    alt={movie.title}
                                                    onClick={() => {
                                                        navigate(`/movies/${movie._id}`);
                                                        scrollTo(0, 0);
                                                    }}
                                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110 cursor-pointer"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                                                <div className="absolute left-5 top-5 flex gap-2">

                                                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-black">
                                                        NEW
                                                    </span>

                                                    <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs backdrop-blur-md">
                                                        7 DAYS
                                                    </span>

                                                </div>

                                                <div className="absolute bottom-5 left-5 right-5">

                                                    <h2 className="text-3xl font-bold leading-tight">
                                                        {movie.title}
                                                    </h2>

                                                </div>

                                            </div>

                                            <div className="p-5">

                                                <div className="flex flex-wrap gap-3 text-sm text-gray-400">

                                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                                                        <CalendarDaysIcon className="h-4 w-4 text-primary" />
                                                        {showDate.toLocaleDateString()}
                                                    </span>

                                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                                                        <Clock3Icon className="h-4 w-4 text-primary" />
                                                        {showDate.toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </span>

                                                </div>

                                                <p className="mt-5 text-gray-400 leading-7 line-clamp-2">
                                                    {movie.overview ||
                                                        "Reserve your seats now and enjoy the latest cinematic experience on the big screen."}
                                                </p>

                                                {/* ========= PART 2 ENDS HERE ========= */}
                                                {/* Paste Part 3 immediately below this line */}

                                                <div className="mt-6 flex items-center justify-between gap-4">

                                                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                                        <StarIcon className="h-4 w-4 fill-primary text-primary" />
                                                        <span className="font-medium">
                                                            {Number(movie.vote_average || 0).toFixed(1)}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            navigate(`/movies/${movie._id}`);
                                                            scrollTo(0, 0);
                                                        }}
                                                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black transition duration-300 hover:scale-105 hover:bg-primary-dull"
                                                    >
                                                        View Details
                                                        <PlayCircleIcon className="h-4 w-4" />
                                                    </button>

                                                </div>

                                            </div>

                                        </article>

                                    );

                                })}

                            </div>

                        </div>
                    ))
                ) : (

                    <div className="mx-auto max-w-3xl rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-xl px-10 py-20 text-center">

                        <h2 className="text-3xl font-bold">
                            No Recent Releases
                        </h2>

                        <p className="mt-4 text-gray-400 leading-8">
                            New shows added within the last seven days will automatically
                            appear here. Check back soon for the latest releases.
                        </p>

                    </div>

                )}

            </div>

        </section>
    );
};

export default Releases;
