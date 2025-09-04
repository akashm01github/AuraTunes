import React, { useState } from 'react'
import FacialExpressionDetector from './components/FacialExpressionDetector'
import MoodSongs from './components/MoodSongs'


const App = () => {
   const [songs, setSongs] = useState([
    // {
    //   title: "test_title",
    //   artist: "test_artist",
    //   url: "test_url"
    // },
    // {
    //   title: "test_title",
    //   artist: "test_artist",
    //   url: "test_url"
    // },
    // {
    //   title: "test_title",
    //   artist: "test_artist",
    //   url: "test_url"
    // },
    // {
    //   title: "test_title",
    //   artist: "test_artist",
    //   url: "test_url"
    // },
  ]);
  return (
    <div>
      <FacialExpressionDetector setSongs={setSongs}/>
      <MoodSongs songs={songs}/>
    </div>
  )
}

export default App