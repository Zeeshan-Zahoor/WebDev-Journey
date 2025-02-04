// Lets write some Javascript 
console.log("lets get started with functionalities");
let playBar = document.querySelector(".play-bar");
let searchedSongs = document.getElementsByClassName("searched-songs")[0];
let pauseButton = document.getElementById("pause-action");
let image = pauseButton.getAttribute("src");        //play pause button image



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
                    <div class='searched-song-play' tabindex='0' data-video-id='${VideoID}' song-name = '${songName}'> <h3> Play </h3> 
                    </div> 
                </div>`;

            searchedSongs.innerHTML = searchedSongs.innerHTML + newSong;

        }

        let playButtons = document.querySelectorAll(".searched-song-play");
        playButtons.forEach(playButton => {
            playButton.addEventListener("click", () => {
                const VideoID = playButton.getAttribute('data-video-id');
                const songName = playButton.getAttribute('song-name');

                // adding the details in the play-bar
                document.getElementsByClassName("song-name")[0].innerHTML = `<h4>${songName}</h4>`;
                playAudio(VideoID);
                playBar.classList.remove("hide");
                if(image === 'play.svg') {
                    pauseButton.setAttribute("src", "pause.svg");
                }
                playPauseButton();
            })
        });


    } catch (error) {
        console.log("Error Fetching the Song Data", error);
    }
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


const playPauseButton = () => {
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
}


document.querySelector(".search-icon").addEventListener("click", () => {
    let searched_Song = document.getElementById("song-input").value;
    if (searched_Song) {
        console.log(searched_Song);
        fetchSongData(searched_Song);
    } else {
        alert("Please Enter the Song First");
    }
});

