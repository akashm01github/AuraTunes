import React, { useState, useRef, useEffect } from 'react';

const MoodSongs = ({ songs }) => {
  const [currentSong, setCurrentSong] = useState(null); // Track the currently playing song
  const audioRefs = useRef({}); // Store audio refs for each song

  // Initialize audio refs for each song
  useEffect(() => {
    songs.forEach((song) => {
      if (!audioRefs.current[song.title]) {
        audioRefs.current[song.title] = new Audio(song.audio);
      }
    });

    // Cleanup on unmount
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [songs]);

  // Function to toggle play/pause
  const togglePlayPause = (song) => {
    const audio = audioRefs.current[song.title];

    if (currentSong?.title === song.title) {
      // Toggle play/pause for the current song
      if (audio.paused) {
        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
          alert('Failed to play the audio.');
        });
      } else {
        audio.pause();
      }
    } else {
      // Pause the currently playing song (if any)
      if (currentSong) {
        audioRefs.current[currentSong.title].pause();
      }
      // Play the new song
      audio.src = song.audio; // Ensure the source is set
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        alert('Failed to play the audio.');
      });
      setCurrentSong(song);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-800 text-white p-6 md:p-8">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
        Recommended Songs
      </h1>
      {Array.isArray(songs) && songs.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {songs.map((song, index) => (
            <li
              key={index}
              className="relative bg-gray-800/40 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-4 hover:bg-gray-800/60 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white truncate">{song.title || 'Unknown Title'}</h3>
                  <p className="text-gray-400 text-sm mt-1">{song.artist || 'Unknown Artist'}</p>
                </div>
                <button
                  className="relative bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full p-3 transition-all duration-200 group"
                  onClick={() => togglePlayPause(song)}
                  aria-label={`${currentSong?.title === song.title && !audioRefs.current[song.title]?.paused ? 'Pause' : 'Play'} ${song.title || 'song'}`}
                >
                  <svg
                    className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {currentSong?.title === song.title && !audioRefs.current[song.title]?.paused ? (
                      // Pause icon
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    ) : (
                      // Play icon
                      <path d="M8 5v14l11-7z" />
                    )}
                  </svg>
                </button>
              </div>
              {/* Audio player with controls */}
              <audio
                controls
                className="w-full mt-2"
                src={song.audio}
                onPlay={() => setCurrentSong(song)}
                onPause={() => {
                  if (currentSong?.title === song.title && audioRefs.current[song.title].paused) {
                    setCurrentSong(null);
                  }
                }}
                ref={(el) => {
                  if (el) audioRefs.current[song.title] = el;
                }}
              />
              <div className="absolute inset-0 rounded-2xl border border-indigo-500/20 pointer-events-none" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-400 text-lg">
          {Array.isArray(songs) ? 'No songs found.' : 'Waiting for song recommendations...'}
        </p>
      )}
    </div>
  );
};

export default MoodSongs;