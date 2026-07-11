import React from "react";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const NotFound = () => {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#060608] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] border border-[#3a1319] bg-[#070709] text-white shadow-[0_0_0_1px_rgba(248,69,101,0.04),0_30px_80px_rgba(0,0,0,0.55)] sm:min-h-[calc(100vh-3rem)]">

                <img
                    src={assets.notFoundSpace}
                    alt="Space scene"
                    className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,4,6,0.94)_0%,rgba(4,4,6,0.88)_28%,rgba(4,4,6,0.56)_52%,rgba(4,4,6,0.24)_72%,rgba(4,4,6,0.1)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_18%,rgba(255,102,124,0.18),transparent_18%),radial-gradient(circle_at_42%_78%,rgba(186,32,56,0.16),transparent_24%)]" />
                <div className="absolute bottom-0 left-0 right-0 h-[24%] bg-[linear-gradient(180deg,rgba(6,6,8,0)_0%,rgba(6,6,8,0.4)_18%,rgba(6,6,8,0.92)_100%)]" />

                <div className="relative z-10 flex min-h-[calc(100vh-2rem)] flex-col justify-between sm:min-h-[calc(100vh-3rem)]">
                    <div className="grid flex-1 grid-cols-1 gap-10 px-6 pb-8 pt-7 sm:px-10 lg:grid-cols-[minmax(320px,520px)_1fr] lg:px-12 lg:pb-10 lg:pt-10 xl:px-14">

                        <div className="flex flex-col justify-between">
                            <div>
                                <img src={assets.logo} alt="CinemaVerse" className="h-auto w-36 sm:w-40" />

                                <div className="mt-12 sm:mt-16">
                                    <div className="inline-block">
                                        <h1 className="text-[6rem] font-semibold leading-none tracking-[-0.06em] text-transparent drop-shadow-[0_0_30px_rgba(248,69,101,0.18)] sm:text-[7.8rem] lg:text-[9rem] xl:text-[10rem]" style={{ WebkitTextStroke: "1px #e14a61" }}>
                                            404
                                        </h1>
                                        <div className="mt-4 flex items-center gap-4">
                                            <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#ff6a7f] to-transparent sm:w-28" />
                                            <p className="text-sm font-medium tracking-[0.55em] text-[#ff647b] sm:text-base">
                                                LOST IN SPACE
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-12 max-w-md space-y-6 text-base leading-8 text-[#e1e1e6] sm:text-xl sm:leading-10">
                                        <p>
                                            The page you&apos;re looking for seems to be light-years away.
                                        </p>
                                        <p>
                                            Let&apos;s get you back on track.
                                        </p>
                                    </div>

                                    <div className="mt-10 flex max-w-md flex-col items-start gap-5">
                                        <button
                                            onClick={() => navigate("/")}
                                            className="group inline-flex items-center gap-3 rounded-2xl border border-[#e14a61] bg-[#12090c]/82 px-6 py-4 text-base font-semibold text-[#ff6a7f] shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#241115]/92 hover:text-white sm:text-lg"
                                        >
                                            <Home className="h-5 w-5" />
                                            GO BACK HOME
                                        </button>

                                        <button
                                            onClick={() => navigate(-1)}
                                            className="group inline-flex items-center gap-3 rounded-full bg-black/24 px-2 py-1 text-lg font-medium text-[#d9d9de] backdrop-blur-[1px] transition-colors duration-300 hover:text-[#ff6a7f]"
                                        >
                                            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                                            Go Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative hidden lg:block" />
                    </div>

                    <div className="relative z-10 px-4 pb-4 sm:px-8 sm:pb-6 lg:px-12 xl:px-14">
                        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-[28px] border border-[#3a1319] bg-[linear-gradient(180deg,rgba(10,10,12,0.78),rgba(8,8,10,0.9))] px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-8">
                            <div className="flex items-center gap-4">
                                <img src={assets.logo} alt="CinemaVerse" className="h-auto w-24 opacity-90 sm:w-28" />
                                <div className="hidden h-10 w-px bg-[#432028] sm:block" />
                                <p className="max-w-md text-sm text-[#b7b7bf] sm:text-base">
                                    Even astronauts need directions sometimes.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate("/movies")}
                                className="group inline-flex items-center gap-3 self-start text-lg font-semibold text-[#ff6a7f] transition-colors duration-300 hover:text-white sm:self-auto"
                            >
                                Explore Movies
                                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
