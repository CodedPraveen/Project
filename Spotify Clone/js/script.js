console.log("Fetching songs…");
let currentSong = new Audio();
let songs;
let currFolder;

function SectoMinSec(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  let formattedMinutes = String(minutes).padStart(2, "0");
  let formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  // let baseURL = window.location.origin;
  let url = "http://localhost:3000/";

  // let a = await fetch(`${baseURL}/${folder}/`);
  let a = await fetch(`${url}/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];

  for (let element of as) {
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";

  for (let song of songs) {
    songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg"/>
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Harry</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg"/>
            </div>
        </li>`;
  }

  document.querySelectorAll(".songList li").forEach((li) => {
    li.addEventListener("click", () => {
      playMusic(li.querySelector(".info div").innerHTML.trim());
    });
  });

  return songs;
}

function playMusic(track, pause = false) {
  currentSong.src = `${window.location.origin}/${currFolder}/${track}`;

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
  let base = window.location.origin;

  let a = await fetch(`${base}/songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");

  let cardContainer = document.querySelector(".cardContainer");

  for (let e of anchors) {
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let clean = e.href.replace(window.location.origin, "");
      let parts = clean.split("/").filter(Boolean);
      let folder = parts[1]; // FIXED
      if (!folder) continue;

      // fetch metadata
      let a = await fetch(`${base}/songs/${folder}/info.json`);
      let response = await a.json();

      cardContainer.innerHTML += `
                <div class="card" data-folder="${folder}">
                    <div class="play" >
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path d="M5 20V4L19 12L5 20Z"stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
    }
  }
  //  Load the playlist whenever card is clicked
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", async () => {
      songs = await getSongs(`songs/${card.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  await displayAlbums();

  //  Attach an event listner to play, next and previoius
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${SectoMinSec(
      currentSong.currentTime
    )}                                     / ${SectoMinSec(
      currentSong.duration
    )}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //  Add an event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for haamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  //  Add an even listener to previous and next
  previous.addEventListener("click", () => {
    console.log("previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  //  Add an even listener to previous and next
  next.addEventListener("click", () => {
    console.log("next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event Listener to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("My volume is", e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("/img/volume.svg")) {
      e.target.src = e.target.src.replace("/img/volume.svg", "/img/mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("/img/mute.svg", "/img/volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
