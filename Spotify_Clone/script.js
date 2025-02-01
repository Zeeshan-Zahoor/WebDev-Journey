// Lets write some Javascript 
console.log("lets get started with functionalities");
const apiKey = "ba960cb1d5355512e492854b68b726f8";

async function searchSong () {
    let input_song = document.getElementById("song-input").value;
    console.log(input_song);
    let URL = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${input_song}&api_key=${apiKey}&format=json`;

    let response = await fetch(URL);
    let songData = await response.json();

    let trackList = songData.results.trackmatches.track;        // extracting the array of songs

    console.log(trackList);

}

document.querySelector("#search-song").addEventListener("click", () => {
    searchSong();
});
