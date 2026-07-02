import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Footer = () => {

    const navigate = useNavigate()

    return (
        <footer className="px-6 md:px-16 lg:px-36 mt-20 w-full text-gray-300">
            <div className="flex flex-wrap flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
                <div className="md:max-w-96">
                    <video
                        src={assets.footerVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-auto h-40 rounded-xl border border-black border-rounded-2xl"
                    />
                </div>
                <div>
                    <div className="flex flex-col items-center gap-9 ml-1 mt-4">
                        <div className='flex gap-10'>
                            <img className="ml-10" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/googlePlayBtnBlack.svg" alt="google play" className="h-10 w-auto border border-white rounded" />
                            <img className="ml-10" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/appleStoreBtnBlack.svg" alt="app store" className="h-10 w-auto border border-white rounded" />
                        </div>
                        <div className='w-60 text-sm'>
                            <p>Experience the magic of cinema through seamless discovery, effortless booking, and unforgettable stories.</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
                    <div>
                        <h2 className="font-bold mb-5 text-2xl">Navigate</h2>
                        <ul className="text-sm space-y-2 font-semibold">
                            <li><a href="#" onClick={navigate("/")} >Home</a></li>
                            <li><a href="#" onClick={navigate("/movies")} >Movies</a></li>
                            <li><a href="#" onClick={navigate("/")} >Theaters</a></li>
                            <li><a href="#" onClick={navigate("/")} >Releases</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-bold mb-5 text-2xl">Get in touch</h2>
                        <div className="text-sm space-y-2">
                            <p className='font-semibold text-lg'>Created By : Mihir Gupta</p>
                            <p>Phone : +91-72755-21650</p>
                            <p>Email me : mihirgupta665@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-sm pb-5">
               MIHIR GUPTA | Copyright {new Date().getFullYear()} &copy; All Right Reserved
            </p>
        </footer>
    )
}

export default Footer