import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Footer = () => {

    const navigate = useNavigate()

    return (
        <footer className="px-5 sm:px-8 md:px-16 lg:px-24 xl:px-36 mt-16 md:mt-20 w-full text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(280px,420px)_minmax(220px,280px)_minmax(120px,160px)_minmax(220px,280px)] items-start gap-x-10 gap-y-10 border-b border-gray-500 pb-10 md:pb-14">
                <div className="w-full flex justify-center md:justify-start">
                    <video
                        src={assets.footerVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full max-w-sm xl:max-w-none h-auto rounded-xl border border-black"
                    />
                </div>
                <div className="w-full flex flex-col items-center md:items-start gap-6">
                    <div className="flex flex-col sm:flex-row md:flex-col min-[900px]:flex-row xl:flex-col 2xl:flex-row items-center md:items-start gap-3">
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/googlePlayBtnBlack.svg" alt="google play" className="h-10 w-auto max-w-full border border-white rounded" />
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/appleStoreBtnBlack.svg" alt="app store" className="h-10 w-auto max-w-full border border-white rounded" />
                    </div>
                    <div className="max-w-xs text-sm text-center md:text-left leading-6">
                        <p>Experience the magic of cinema through seamless discovery, effortless booking, and unforgettable stories.</p>
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <h2 className="font-bold mb-4 text-xl md:text-2xl">Navigate</h2>
                    <ul className="text-sm space-y-2 font-semibold">
                        <li><a href="#" onClick={() => navigate("/")} >Home</a></li>
                        <li><a href="#" onClick={() => navigate("/movies")} >Movies</a></li>
                        <li><a href="#" onClick={() => navigate("/")} >Theaters</a></li>
                        <li><a href="#" onClick={() => navigate("/")} >Releases</a></li>
                    </ul>
                </div>
                <div className="text-center md:text-left min-w-0">
                    <h2 className="font-bold mb-4 text-xl md:text-2xl">Get in touch</h2>
                    <div className="text-sm space-y-2 break-words">
                        <p className="font-semibold text-base md:text-lg">Created By : Mihir Gupta</p>
                        <p>Phone : +91-72755-21650</p>
                        <p>Email me : mihirgupta665@gmail.com</p>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-xs sm:text-sm pb-5">
               MIHIR GUPTA | Copyright {new Date().getFullYear()} &copy; All Right Reserved
            </p>
        </footer>
    )
}

export default Footer
