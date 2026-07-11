import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import { useAppContext } from './context/AppContext'
import { SignIn } from '@clerk/clerk-react'
import Loading from './components/Loading'

const App = () => {

    const isAdminRoute = useLocation().pathname.startsWith("/admin")
    // console.log(isAdminRoute)

    const { user } = useAppContext()

    return (

        <>
            <ToastContainer autoClose={3000} theme="dark" />
            {!isAdminRoute && <Navbar />}
            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movies/:id" element={<MovieDetails />} />
                <Route path="/movies/:id/:date" element={<SeatLayout />} />
                <Route path="/favorite" element={<Favorite />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/loading/:nextUrl" element={<Loading />} />
                

                <Route path="/admin/*" element={user ? <Layout /> : (
                    <div className='min-h-screen flex justify-center items-center'>
                        <SignIn fallbackRedirectUrl={"/admin"} />
                    </div>
                )}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="add-shows" element={<AddShows />} />
                    <Route path="list-shows" element={<ListShows />} />
                    <Route path="list-bookings" element={<ListBookings />} />
                </Route>

            </Routes>
            {!isAdminRoute && <Footer />}
        </>

    )

}

export default App
