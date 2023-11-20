import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const CLIENT_Id = '6e21e4fb97b34a1cbda731d0f9957f24';
  const REDIRECT_URI = 'http://localhost:3000';
  const AUTHEND_POINT = 'https://accounts.spotify.com/authorize';
  const RESPONSE_TYPE = 'token';

  const [token, setToken] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [artists, setArtists] = useState([])
  const [tracks, setTracks] = useState({});

  useEffect(() => {
    const hash = window.location.hash

    let token = window.localStorage.getItem('token')

    if (!token && hash) {
      token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1]

      window.location.hash = ''
      window.localStorage.setItem('token', token)

    }
    setToken(token)
  }, [])

  const logout = () => {
    setToken('')
    window.localStorage.removeItem('token')
  }

  const getTopTracks = async (artistId) => {
    try {
      const { data } = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const topTracks = data.tracks.map(track => ({
        name: track.name,
        preview_url: track.preview_url,
        image: track.album.images.length > 0 ? track.album.images[0].url : '' 
      }));
      const topTrackUrls = data.tracks.map(track => track.preview_url);
      setTracks(prevTracks => ({ ...prevTracks, [artistId]: topTracks }));
    } catch (error) {
      console.error("Error fetching tracks: ", error);
    }
  };
  // const playSong = (trackUrl) => {
  //   if (trackUrl) {
  //     const audio = new Audio(trackUrl);
  //     audio.play();
  //   } else {
  //     console.error("Song URL not found");
  //   }
  // };

  let currentAudio = null;

const playSong = (trackUrl) => {
  if (trackUrl) {
    if (currentAudio) {
      currentAudio.pause(); 
    }
    const audio = new Audio(trackUrl);
    if (currentAudio !== audio) {
      currentAudio = audio;
      audio.play();
    } else {
      currentAudio = null;
    }
  } else {
    console.error("Song URL not found");
  }
};
const stopSong = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
};

  const searchArtists = async (e) => {
    e.preventDefault()
    const { data } = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: 'artist'
      }
    })
    setArtists(data.artists.items)
  }

  const renderArtists = () => {
    return artists.map(artist => (
      <div key={artist.id}>
        {artist.images.length ? <img width={'50%'} src={artist.images[0].url} alt={artist.name} /> : <div>No Images</div>}
        {artist.name}
        <button onClick={() => getTopTracks(artist.id)}>Get Top Track</button>
        {tracks[artist.id] && (
  <div>
    <h4>Top Tracks:</h4>
    <ul>
      {tracks[artist.id].map((track, index) => (
        <li key={index}>
          <img src={track.image} alt={`${track.name} cover`} />
          {track.name}
          <button onClick={() => playSong(track.preview_url)}>Play Track {index + 1}</button>
        </li>
      ))}
    </ul>
        </div>
      )}
        {/* {tracks[artist.id] && <audio src={tracks[artist.id]} controls />} */}
        {/* <button onClick={() => playSong(artist.id)}>Play Song</button> */}
        <button onClick={stopSong}>Stop</button>
      </div>
    ))
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>23VIBEZ</h1>
        {!token ?
          <a href={`${AUTHEND_POINT}?client_id=${CLIENT_Id}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
            Login to Spotify</a>
          : <button onClick={logout}>Logout</button>}
        {token ?
          <form onSubmit={searchArtists}>
            <input type='text' onChange={e => setSearchKey(e.target.value)} />
            <button type={'submit'}>search</button>
          </form> :
          <h2>Please login</h2>}
        {renderArtists()}
      </header>
    </div>
  );
}

export default App;
