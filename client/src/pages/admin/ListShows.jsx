import React, { useEffect, useState } from 'react'
import { dummyShowsData } from '../../assets/assets';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';

const ListShows = () => {

    const currency = import.meta.env.VITE_CURRENCY

    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAllShows = async () => {

        try {

            await setshows([{
                movie: dummyShowsData[0],
                showDateTime: "2025-06-30T02:30:00.000Z",
                showPrice: 59,
                occupiedSeats: {
                    A1: "user_1",
                    B1: "user_2",
                    C1: "user 3"
                }
            }]);
            setLoading(false);
        }
        catch (error) {
            console.error(error);
        }

    }

    useEffect(() => {
        getAllShows();
    }, []);

    return !loading 
    ? (
        <>
            <Title text1={"List1"} text2="Shows" />
        </>
    )  
    : <Loading />
}

export default ListShows