import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Footer from './components/Footer'

const App = () => {

    const isAdminRoute = useLocation().pathname.startsWith("/admin")
    // console.log(isAdminRoute)

    return (

        <>
            <ToastContainer autoClose={3000} theme="dark" />
            {!isAdminRoute && <Navbar />}
            <Routes>

                <Route path="/" element={ <Home /> } />
                <Route path="/movies" element={ <Movies /> } />
                <Route path="/movies/:id" element={ <MovieDetails /> } />
                <Route path="/movies/:id/:date" element={ <SeatLayout /> } />
                <Route path="/my-bookings" element={ <MyBookings /> } />
                <Route path="/favorite" element={ <Favorite /> } />

            </Routes>
            {!isAdminRoute && <Footer />}
        </>

    )

}

export default App
