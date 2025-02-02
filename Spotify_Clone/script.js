// Lets write some Javascript 
console.log("lets get started with functionalities");
let searchedSongs = document.getElementsByClassName("searched-songs")[0];


async function fetchSongData(searchedSong) {
    const apiKey = "AIzaSyAX-ilrWOk3DZc3x94gY3WWPO3u0u6P-DA";
    const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchedSong)}&key=${apiKey}`;

    try {
        let response = await fetch(searchURL);
        const data = await response.json();
        console.log(data);
        searchedSongs.classList.remove("hide");
        searchedSongs.innerHTML = `<div class="search-results">
                                        <h2>Search Results</h2>
                                        <button id="cancel-btn" onclick="hideSearchedSongs()">
                                            <img class="invert" src="cancel.svg" alt="cancel">
                                        </button>
                                    </div>`;    // keep the searched songs container empty first
        let songArray = data.items;
        for (let Video of songArray) {
            const VideoID = Video.id.videoId;
            let songName = Video.snippet.title;
            let channelName = Video.snippet.channelTitle;
            let newSong = `<div class='searched-song-card'> 
                    <div class='music-thumb border-rad-1'> 
                        <img class='invert' src='music.svg' alt='music-icon'> 
                    </div> 
                    <div class='song-info'> 
                        <h4>${songName}</h4> 
                        <span>Channel: ${channelName}</span> 
                    </div> 
                    <div class='play searched-song-play' tabindex='0' data-video-id='${VideoID}'> 
                    </div> 
                </div>`;

            searchedSongs.innerHTML = searchedSongs.innerHTML + newSong;
        
        }

        let playButtons = document.querySelectorAll(".searched-song-play");
        playButtons.forEach(playButton => {
            playButton.addEventListener("click", () => {
                const VideoID = playButton.getAttribute('data-video-id');
                playAudio(VideoID);
            })
        });


    } catch (error) {
        console.log("Error Fetching the Song Data", error);
    }
}

const hideSearchedSongs = () => {
    searchedSongs.classList.add("hide");
}

const playAudio = (videoId) => {
    //create an iframe to embed the video in it.
    const iframe = document.createElement("iframe");
    iframe.setAttribute("width", "0");
    iframe.setAttribute("height", "0");
    iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&showinfo=0&autohide=1`);
    iframe.setAttribute("frameborder", '0');
    iframe.setAttribute("allow", "autoplay; encrypted-media");

    // append the iframe to the audio container 
    const audioContainer = document.getElementById("audio-container");
    audioContainer.innerHTML = ""; // clear any previous audio
    audioContainer.appendChild(iframe);
}

document.querySelector("#search-song").addEventListener("click", () => {
    let searched_Song = document.getElementById("song-input").value;
    console.log(searched_Song);
    fetchSongData(searched_Song);
});