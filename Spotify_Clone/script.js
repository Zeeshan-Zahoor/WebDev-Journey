// Lets write some Javascript 
console.log("lets get started with functionalities");
let playBar = document.querySelector(".play-bar");
let searchedSongs = document.getElementsByClassName("searched-songs")[0];
let pauseButton = document.getElementById("play-btn");
let prevButton = document.getElementById("previous-btn");
let nextButton = document.getElementById("next-btn");
let image = pauseButton.getAttribute("src");        //play pause button image
let heartbtn = document.getElementById("like-btn");
let songCardBtn = document.getElementsByClassName("thumb-plus-name")[0];
let currTimeDiv = document.getElementsByClassName("current-time")[0];
let totalTimeDiv = document.getElementsByClassName("total-time")[0];
let playBarChannelName = document.getElementsByClassName("channel-name")[0];




window.onload = () => {
    let savedSongs = JSON.parse(localStorage.getItem("librarySongs")) || [];
    updateLibrary(savedSongs);
}

let apiKeys = ['AIzaSyDzNBcDHy7nkhXSUl6XiKrSFq3Njg36keY', 'AIzaSyAX-ilrWOk3DZc3x94gY3WWPO3u0u6P-DA'];
// let apiKeys = ['key1', 'key2'];     // your api key or keys

let currentKeyIndex = 0;
async function fetchSongData(searchedSong) {
    const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchedSong)}&key=${apiKeys[currentKeyIndex]}`;

    try {
        // Clear previous search results and show loader
        searchedSongs.innerHTML = `
            <div class="search-results">
                <h2>Search Results</h2>
                <button id="cancel-btn" onclick="hideSearchedSongs()">
                    <img class="invert" src="cancel.svg" alt="cancel">
                </button>
            </div>
            <div class="loader"></div> <!-- Loader is visible by default -->
        `;

        searchedSongs.classList.remove("hide");

        // Fetch song data
        let response = await fetch(searchURL);
        const data = await response.json();

        // If Quota Exceeded, try next API
        if (data.error && data.error.errors[0].reason === 'quotaExceeded') {
            console.warn(`Qouta Exceeded for API key ${currentKeyIndex + 1}, trying next API key..`);
            if (currentKeyIndex < apiKeys.length - 1) {
                currentKeyIndex++;
                return fetchSongData(searchedSong);
            } else {
                throw new error("All API keys have exceeded daily Qouta Limit..")
            }
        }

        let songArray = data.items;
        // Hide loader after data is fetched
        let loader = document.querySelector(".loader");
        loader.classList.add("hide");

        if (!data.items || data.items.length === 0) {
            searchedSongs.innerHTML += "<h3>No songs found. Try another search.</h3>";
            return;
        }

        // Display new search results
        for (let Video of songArray) {
            const VideoID = Video.id.videoId;
            let songName = Video.snippet.title;
            let channelName = Video.snippet.channelTitle;


            searchedSongs.innerHTML += `
            <div class='searched-song-card'> 
                <div id='${VideoID}' class='music-thumb border-rad-1'> 
                </div> 
                <div class='song-info'> 
                    <h4>${songName}</h4> 
                    <span>Channel: ${channelName}</span> 
                </div> 
                <div class='searched-song-play' tabindex='0' data-video-id='${VideoID}' song-name='${songName}' data-video-channel='${channelName}'>Play</div> 
            </div>
        `;
            document.getElementById(`${VideoID}`).style.backgroundImage = `url('https://i.ytimg.com/vi/${VideoID}/default.jpg')`;
        }


        // Add event listeners to play buttons
        let playButtons = document.querySelectorAll(".searched-song-play");
        playButtons.forEach(playButton => {
            // Remove any existing event listeners to avoid duplication
            playButton.replaceWith(playButton.cloneNode(true));
        });

        // Re-select the play buttons and add fresh event listeners
        document.querySelectorAll(".searched-song-play").forEach(playButton => {
            playButton.addEventListener("click", () => {
                const VideoID = playButton.getAttribute('data-video-id');
                const songName = playButton.getAttribute('song-name');
                let savedSongs = JSON.parse(localStorage.getItem('librarySongs')) || [];
                let liked = savedSongs.some(song => song.videoId === VideoID);

                // Update play-bar with song details
                document.getElementsByClassName("song-name")[0].innerHTML = `<h4>${songName}</h4>`;
                document.getElementsByClassName("song-thumbnail")[0].style.backgroundImage = `url('https://i.ytimg.com/vi/${VideoID}/hqdefault.jpg')`;
                if (!liked) {
                    heartbtn.classList.remove("turn-green");
                    heartbtn.classList.add("turn-transparent");
                } else {
                    heartbtn.classList.remove("turn-transparent");
                    heartbtn.classList.add("turn-green");
                }

                // Play the audio and update the play/pause button
                pauseButton.innerHTML = pauseImage;
                if (playBar.classList.contains("big-bar")) {
                    searchedSongs.classList.add("hide");
                }
                playBar.classList.remove("hide");
                playAudio(VideoID);
            });
        });

    } catch (error) {
        // Hide loader in case of error
        let loader = document.querySelector(".loader");
        loader.classList.add("hide");
    }
}

// add event listener to the like button
document.querySelector(".like-btn").addEventListener("click", () => {
    const songName = document.getElementsByClassName("song-name")[0].innerText;
    const videoId = player.getVideoData().video_id;
    const channelName = player.getVideoData().author;
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/default.jpg`;
    let savedSongs = JSON.parse(localStorage.getItem('librarySongs')) || [];
    let liked = savedSongs.some(song => song.videoId === videoId);

    if (!liked) {
        saveSongs(songName, videoId, channelName, thumbnail);
        heartbtn.classList.remove("turn-transparent");
        heartbtn.classList.add("turn-green");
    } else {
        removeSong(videoId);
        heartbtn.classList.remove("turn-green");
        heartbtn.classList.add("turn-transparent");
    }
});

//save song to library
const saveSongs = (songName, videoId, channelName) => {
    let savedSongs = JSON.parse(localStorage.getItem("librarySongs")) || [];
    const newSong = {
        name: songName,
        videoId: videoId,
        channelName: channelName,
    }

    if (!savedSongs.some(song => song.videoId === videoId)) {
        savedSongs.push(newSong);
        // save the array back to the local storage
        localStorage.setItem("librarySongs", JSON.stringify(savedSongs));
    }
    updateLibrary(savedSongs);
}

// display saved songs in the library
const updateLibrary = (savedSongs) => {
    let library = document.querySelector(".library-body");
    let songCard = `<h3>Your Library is Empty</h3>`;
    if (savedSongs.length === 0) {
        library.innerHTML = songCard;
    } else {
        library.innerHTML = "";
        savedSongs.forEach(song => {
            songCard = `<div class="song-card border-rad-1" current-song-name='${song.name}' current-video-id = '${song.videoId}' current-song-channel-name = '${song.channelName}'>

                        <div id='${song.videoId}' class="music-thumb border-rad-1">
                        </div>
                        <div class="song-info">
                            <h4>${song.name}</h4>
                            <span>${song.channelName}</span>
                        </div>
                    </div>`;
            library.innerHTML += songCard;
            document.getElementById(`${song.videoId}`).style.backgroundImage = `url('https://i.ytimg.com/vi/${song.videoId}/default.jpg')`;
        });
    }
    playFromLibrary();
}

// Remove songs from the library
const removeSong = (videoId) => {
    let savedSongs = JSON.parse(localStorage.getItem("librarySongs")) || [];
    savedSongs = savedSongs.filter(song => song.videoId !== videoId);
    localStorage.setItem("librarySongs", JSON.stringify(savedSongs));
    updateLibrary(savedSongs);
}

// next and previous button functionality
let currentSongId = null;
const playNextSong = () => {
    let savedSongs = JSON.parse(localStorage.getItem("librarySongs")) || [];
    let currentSongIndex = savedSongs.findIndex(song => song.videoId === currentSongId);

    if (savedSongs.length === 0) {
        return;
    }

    if (currentSongIndex < savedSongs.length - 1) {  // ensure we are not moving above the length of the array
        currentSongId = savedSongs[currentSongIndex + 1].videoId;
    } else {
        currentSongId = savedSongs[0].videoId;  // return back to the first song
    }

    playAudio(currentSongId);
    let currentSong = savedSongs.find(song => song.videoId === currentSongId);
    
    setTimeout(() => {
    // Update the song name and channel name in the playbar
    if (currentSong) {
        document.getElementsByClassName("song-name")[0].innerHTML = `<h4>${currentSong.name}</h4>`;
        playBarChannelName.innerHTML = `<span>${currentSong.channelName}</span>`
        document.getElementsByClassName("song-thumbnail")[0].style.backgroundImage = `url('https://i.ytimg.com/vi/${currentSongId}/hqdefault.jpg')`;
    }
    }, 1000);
    
    
}

const playPrevSong = () => {
    let savedSongs = JSON.parse(localStorage.getItem("librarySongs")) || [];
    let currentSongIndex = savedSongs.findIndex(song => song.videoId === currentSongId);

    if (savedSongs.length === 0) {
        return;
    }

    if (currentSongIndex > 0) {  // ensure we are not moving above the length of the array
        currentSongId = savedSongs[currentSongIndex - 1].videoId;
    } else {
        currentSongId = savedSongs[savedSongs.length - 1].videoId;  // return back to the last song
    }

    playAudio(currentSongId);
    let currentSong = savedSongs.find(song => song.videoId === currentSongId);
   
    setTimeout(() => {
        // Update the song name in the playbar
        if (currentSong) {
            document.getElementsByClassName("song-name")[0].innerHTML = `<h4>${currentSong.name}</h4>`;
            playBarChannelName.innerHTML = `<span>${currentSong.channelName}</span>`
            document.getElementsByClassName("song-thumbnail")[0].style.backgroundImage = `url('https://i.ytimg.com/vi/${currentSongId}/hqdefault.jpg')`;

        }
        }, 1000);

}

// play song from library
const playFromLibrary = () => {
    let savedSongs = JSON.parse(localStorage.getItem("librarySongs")) || [];
    let songs = document.querySelectorAll(".song-card");

    // First, remove all existing event listeners
    songs.forEach(eachSong => {
        let newSong = eachSong.cloneNode(true); // Clone without old listeners
        eachSong.replaceWith(newSong); // Replace with cloned node
        
    });

    // Re-select all song elements after replacing them
    songs = document.querySelectorAll(".song-card");

    songs.forEach(eachSong => {
        eachSong.addEventListener("click", () => {
            //close the library
            if (playBar.classList.contains("big-bar")) {
                libWindow.style.left = '-100%';
                libWindow.style.transition = '0.4s';
                libWindow.style.zIndex = '0';
            }
            currentSongId = eachSong.getAttribute('current-video-id');
            const songName = eachSong.getAttribute('current-song-name');
            const channelName = eachSong.getAttribute('current-song-channel-name');
            // Remove previous event listeners to avoid multiple function calls
            nextButton.replaceWith(nextButton.cloneNode(true));
            prevButton.replaceWith(prevButton.cloneNode(true));

            nextButton = document.getElementById("next-btn");
            prevButton = document.getElementById("previous-btn");
            nextButton.addEventListener("click", () => playNextSong());
            prevButton.addEventListener("click", () => playPrevSong());


            let liked = savedSongs.some(song => song.videoId === currentSongId);
            playBar.classList.remove("hide");
            // adding the details in the play-bar
            document.getElementsByClassName("song-name")[0].innerHTML = `<h4>${songName}</h4>`;
            playBarChannelName.innerHTML = `<span>${channelName}</span>`
            document.getElementsByClassName("song-thumbnail")[0].style.backgroundImage = `url('https://i.ytimg.com/vi/${currentSongId}/hqdefault.jpg')`;
            pauseButton.innerHTML = pauseImage;

            if (!liked) {
                heartbtn.classList.remove("turn-green");
                heartbtn.classList.add("turn-transparent");
            } else {
                heartbtn.classList.remove("turn-transparent");
                heartbtn.classList.add("turn-green");
            }
            playAudio(currentSongId);
        });
    });
}

const hideSearchedSongs = () => {
    searchedSongs.classList.add("hide");
}

let player; // Global player variable

const playAudio = (videoId) => {
    // Clear previous content
    const audioContainer = document.getElementById("audio-container");
    audioContainer.innerHTML = "";

    // Create a div for YouTube player
    const playerDiv = document.createElement("div");
    playerDiv.setAttribute("id", "yt-player");
    playerDiv.style.width = "0px";  // Keep it tiny
    playerDiv.style.height = "0px"; // Hide visually but keep functional
    playerDiv.style.overflow = "hidden"; // Ensure it's hidden
    audioContainer.appendChild(playerDiv);

    // Load YouTube Player API
    player = new YT.Player("yt-player", {
        height: "100",
        width: "200",
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            autohide: 1,
            modestbranding: 1,
            mute: 0
        },
        events: {
            "onReady": (event) => {
                event.target.setPlaybackQuality("small"); // Set 144p quality
                event.target.playVideo();
                pauseButton.innerHTML = pauseImage;
                // update the Duration
                totalTimeDiv.innerText = formatTime(player.getDuration());
                seekerSection();

            },
            "onError": (error) => {
                console.error("YouTube Playback Error:", error);
                if (pauseButton.innerHTML === pauseImage) {
                    pauseButton.innerHTML = playImage;
                }
                alert("This Song cannot be played. Try another one!");
            }
        }
    });
};


// move the visitor on the seeker with song
const seekerSection = () => {
    if (player) {
        let slider = document.getElementById("seekbar");
        let intervalId;
        let isSeeking = false;
        

        // Function to update the visitor position
        const updateVisitor = () => {
            if (!isSeeking) {  // Only update if not seeking
                let duration = player.getDuration();
                if (!duration) return;

                slider.setAttribute('max', duration);

                let currentTime = player.getCurrentTime();
                slider.value = currentTime;
                let progress = (slider.value / slider.max) * 100;
                slider.style.background = `linear-gradient(to right, white ${progress}%, rgba(255, 255, 255, 0.255) ${progress}%)`;

                if (currentTime >= duration - 1) { // pause after end of song
                    pauseButton.innerHTML = playImage;
                    playNextSong();     // play next song automaically after current song is ended.
                    return;
                }
            }
        };

        // Add event listener to seek when user clicks
        slider.addEventListener("input", (e) => {
            isSeeking = true

            player.seekTo(slider.value);

            let progress = (slider.value / slider.max) * 100;
            slider.style.background = `linear-gradient(to right, white ${progress}%, rgba(255, 255, 255, 0.255) ${progress}%)`;

            // Resume updates after a short delay
            setTimeout(() => { isSeeking = false; }, 500);
        });

        // Start updating visitor position at regular intervals
        intervalId = setInterval(updateVisitor, 50);
    }
};

const formatTime = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${minutes < 10 ? '0' + minutes : minutes}:${secs < 10 ? '0' + secs : secs}`;
}

const pauseAudio = () => {
    if (player) player.pauseVideo();
}
const playPausedAudio = () => {
    if (player) player.playVideo();
}

let playImage = '<img  class="invert" src="play.svg" alt="play" width="35em">';
let pauseImage = '<img  class="invert" src="pause.svg" alt="pause" width="35em">';
pauseButton.innerHTML = playImage;
pauseButton.addEventListener("click", () => {
    if (pauseButton.getAttribute("data-playing") === "true") {
        pauseAudio();
        pauseButton.innerHTML = playImage;
        pauseButton.setAttribute("data-playing", "false");  // Update state
    } else {
        playPausedAudio();
        pauseButton.innerHTML = pauseImage;
        pauseButton.setAttribute("data-playing", "true");  // Update state
    }
});


let searchButton = document.querySelector('.search-icon');
let songInput = document.getElementById("song-input");

// Check if the elements exist before adding event listeners
if (songInput) {
    songInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            searchSong();
        }
    });
}

if (searchButton) {
    searchButton.addEventListener("click", searchSong);
}

function searchSong() {
    let searched_Song = songInput ? songInput.value.trim() : "";
    if (searched_Song) {
        fetchSongData(searched_Song);
    } else {
        alert("Please Enter the Song First");
    }
}


// hamburger 
const libWindow = document.querySelector(".left");
function hamburger() {
    libWindow.style.zIndex = '2';
    libWindow.style.left = '0%';
    libWindow.style.width = '90vw';
    libWindow.style.transition = '0.5s';

    document.querySelector(".library-heading-right").addEventListener("click", () => {
        libWindow.style.left = '-100%';
        libWindow.style.transition = '0.5s';
        libWindow.style.zIndex = '0';
    });
}


// big song card appreance
let timeInterval = null;
songCardBtn.addEventListener("click", () => {
    // check wether the saearced songs are visible or not 
    if (!searchedSongs.classList.contains("hide")) {
        searchedSongs.classList.add("hide");
    }

    // check weather the library is open or not
    if (libWindow.style.left === '0%') {
            libWindow.style.left = '-100%';
            libWindow.style.transition = '0.15s';
            libWindow.style.zIndex = '0';
    }

    if (!playBar.classList.contains("big-bar")) {
        //switch to the big bar
        playBar.classList.remove("play-bar");
        playBar.classList.add("big-bar");

        // get the time elements 
        currTimeDiv.innerText = formatTime(player.getCurrentTime());

        // Unhiding the time elements
        currTimeDiv.classList.remove("hide");
        totalTimeDiv.classList.remove("hide");

        // setting the time interval for the live time updation
        timeInterval = setInterval(() => {
            currTimeDiv.innerText = formatTime(player.getCurrentTime());
        }, 1000);

    } else {
        //switch to the normal playbar
        playBar.classList.remove("big-bar");
        playBar.classList.add("play-bar");

        // hide the time elements again
        currTimeDiv.classList.add("hide");
        totalTimeDiv.classList.add("hide");

        // close the time interval
        clearInterval(timeInterval);
    }
});
