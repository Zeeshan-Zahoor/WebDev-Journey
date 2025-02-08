// Lets write some Javascript 
console.log("lets get started with functionalities");
let playBar = document.querySelector(".play-bar");
let searchedSongs = document.getElementsByClassName("searched-songs")[0];
let pauseButton = document.getElementById("pause-action");
let image = pauseButton.getAttribute("src");        //play pause button image
let heartbtn = document.getElementById("like-btn");



window.onload = () => {
    let savedSongs = JSON.parse(localStorage.getItem("librarySongs")) || [];
    updateLibrary(savedSongs);
}



async function fetchSongData(searchedSong) {
    // const apiKey = "AIzaSyAX-ilrWOk3DZc3x94gY3WWPO3u0u6P-DA";
    const apiKey_2 = "AIzaSyDzNBcDHy7nkhXSUl6XiKrSFq3Njg36keY";
    const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchedSong)}&key=${apiKey_2}`;

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
        let songArray = data.items;

        // Hide loader after data is fetched
        let loader = document.querySelector(".loader");
        loader.classList.add("hide");

        // Display new search results
        let newSongs = "";
        for (let Video of songArray) {
            const VideoID = Video.id.videoId;
            let songName = Video.snippet.title;
            let channelName = Video.snippet.channelTitle;
            newSongs += `
                <div class='searched-song-card'> 
                    <div class='music-thumb border-rad-1'> 
                        <img class='invert' src='music.svg' alt='music-icon'> 
                    </div> 
                    <div class='song-info'> 
                        <h4>${songName}</h4> 
                        <span>Channel: ${channelName}</span> 
                    </div> 
                    <div class='searched-song-play' tabindex='0' data-video-id='${VideoID}' song-name='${songName}' data-video-channel='${channelName}'>Play</div> 
                </div>
            `;
        }
        searchedSongs.innerHTML += newSongs;

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
                const channelName = playButton.getAttribute('data-video-channel');
                let savedSongs = JSON.parse(localStorage.getItem('librarySongs')) || [];
                let liked = savedSongs.some(song => song.videoId === VideoID);

                // Update play-bar with song details
                document.getElementsByClassName("song-name")[0].innerHTML = `<h4>${songName}</h4>`;
                if (!liked) {
                    heartbtn.classList.remove("turn-green");
                    heartbtn.classList.add("turn-transparent");
                } else {
                    heartbtn.classList.remove("turn-transparent");
                    heartbtn.classList.add("turn-green");
                }

                // Play the audio and update the play/pause button
                if (image === 'play.svg') {
                    pauseButton.setAttribute("src", "pause.svg");
                }
                playAudio(VideoID);
                playBar.classList.remove("hide");
            });
        });

    } catch (error) {
        console.log("Error Fetching the Song Data", error);
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
    let savedSongs = JSON.parse(localStorage.getItem('librarySongs')) || [];
    let liked = savedSongs.some(song => song.videoId === videoId);

    if (!liked) {
        saveSongs(songName, videoId, channelName);
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
        channelName: channelName
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
            songCard = `<div class="song-card border-rad-1" current-song-name='${song.name}' current-video-id = '${song.videoId}' tabindex='0'>

                        <div class="music-thumb border-rad-1">
                            <img class="invert" src="music.svg" alt="music-icon">
                        </div>
                        <div class="song-info">
                            <h4>${song.name}</h4>
                            <span>${song.channelName}</span>
                        </div>
                    </div>`;
            library.innerHTML += songCard;
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


// play song from library
const playFromLibrary = () => {
    let savedSongs = JSON.parse(localStorage.getItem("librarySongs")) || [];
    let songs = document.querySelectorAll(".song-card");
    songs.forEach(eachSong => {
        eachSong.addEventListener("click", () => {
            const videoId = eachSong.getAttribute('current-video-id');
            const songName = eachSong.getAttribute('current-song-name');
            let liked = savedSongs.some(song => song.videoId === videoId);
            console.log(videoId);
            playBar.classList.remove("hide");
            // adding the details in the play-bar
            document.getElementsByClassName("song-name")[0].innerHTML = `<h4>${songName}</h4>`;
            if (image === 'play.svg') {
                pauseButton.setAttribute("src", "pause.svg");
            }
            if (!liked) {
                heartbtn.classList.remove("turn-green");
                heartbtn.classList.add("turn-transparent");
            } else {
                heartbtn.classList.remove("turn-transparent");
                heartbtn.classList.add("turn-green");
            }
            playAudio(videoId);
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
                seekerSection();
            },
            "onError": (error) => {
                console.error("YouTube Playback Error:", error);
                image = pauseButton.getAttribute("src");
                if (image === 'pause.svg') {
                    pauseButton.setAttribute("src", "play.svg");
                }
                alert("This Song cannot be played. Try another one!");
            }
        }
    });
};

const updatePlaybarTimes = () => {
    if (player) {
        let currentTime = player.getCurrentTime();
        let totalDuration = player.getDuration();

        // format the current time and duraiton in standart format 
        let f_currentTime = formatTime(currentTime);
        let f_totalDuration = formatTime(totalDuration);

        // upadate the play bar 
        document.getElementsByClassName("current-time")[0].innerHTML = `<span>${f_currentTime}</span>`;
        document.getElementsByClassName("total-time")[0].innerHTML = `<span>${f_totalDuration}</span>`;
    }
}

// Update the play bar times every second
setInterval(updatePlaybarTimes, 1000);

// move the visitor on the seeker with song
const seekerSection = () => {
    if (player) {
        let visitor = document.getElementsByClassName("visitor")[0];
        let seeker = document.querySelector(".seeker");
        let intervalId;
        let isSeeking = false;

        // Function to update the visitor position
        const updateVisitor = () => {
            if (!isSeeking) {  // Only update if not seeking
                let duration = player.getDuration();
                let currentTime = player.getCurrentTime();
                let progress = (currentTime / duration) * 100;
                visitor.style.left = `${progress}%`;
            }
        };

        // Add event listener to seek when user clicks
        seeker.addEventListener("click", (e) => {
            let duration = player.getDuration();
            let percent = (e.offsetX / seeker.getBoundingClientRect().width) * 100;
            let newTime = (duration * percent) / 100;

            isSeeking = true;  // Temporarily disable updates
            player.seekTo(newTime, true);

            // Move visitor immediately to the clicked position
            visitor.style.left = `${percent}%`;

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



pauseButton.addEventListener("click", () => {
    let image = pauseButton.getAttribute("src");
    if (image === 'pause.svg') {
        pauseAudio();
        pauseButton.setAttribute("src", 'play.svg');
    } else {
        playPausedAudio();
        pauseButton.setAttribute("src", 'pause.svg');
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
        console.log(searched_Song);
        fetchSongData(searched_Song);
    } else {
        alert("Please Enter the Song First");
    }
}


// hamburger 
function hamburger() {
    const libWindow = document.querySelector(".left");
    libWindow.style.zIndex = '2';
    libWindow.style.left = '0%';
    libWindow.style.width = '90vw';
    libWindow.style.transition = '0.7s';

    document.querySelector(".library-heading-right").addEventListener("click", () => {
        libWindow.style.left = '-100%';
        libWindow.style.transition = '0.7s';
        libWindow.style.zIndex = '0';
    });
}