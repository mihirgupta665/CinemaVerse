import React from 'react'
import { dummyShowsData } from '../assets/assets'

const Movies = () => {
  return dummyShowsData.length > 0 ? (
    <div>Movies</div>
  ) 
  : (
    <div>
      <h1>Now Showing</h1>
    </div>
  )
}

export default Movies