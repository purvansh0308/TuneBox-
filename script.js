let currsong = new Audio();
let songs;
let currFolder;
//chatgpt code
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //show song in a playlist
    let songul = document.querySelector(".songnam").getElementsByTagName("ul")[0]
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
                          <img class ="invert"src="img/music.svg" alt="">
                          <div class="info">
                              <div>${song.replaceAll("%20", " ")}</div>
                              <div>Artist</div>
                           </div>
                          <div class="playn">
                              <span>Play Now</span>
                              <img class ="invert" src="img/play.svg" alt="">
                          </div> </li>`;
    }
    //attach an  event listner to each song
    Array.from(document.querySelector(".songnam").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
}
const playMusic = (track, pause = false) => {
    currsong.src = `/${currFolder}/` + track
    if (!pause) {
        currsong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs2/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]
        console.log(e)
        if (e.href.includes("/songs2")) {
            let folder = e.href.split("/").slice(-2)[0]
            // get  the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs2/${folder}/index.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML +
                ` <div data-folder="${folder}" class="cards border">
                        <div class="play">
                            <img src="img/play.svg" alt="">
                        </div>
                        <img src="http://127.0.0.1:3000/songs2/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    // load playlist whenever card click
    Array.from(document.getElementsByClassName("cards")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs2/${item.currentTarget.dataset.folder}`)
        })
    })
}
async function main() {
    //get songs
    displayAlbums();
    await getSongs("project/spotify/songs2/lofis")
    playMusic(songs[1], true)
    //add event listen to each buton
    play.addEventListener("click", () => {
        if (currsong.paused) {
            currsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currsong.pause()
            play.src = "img/play.svg"
        }
    })
    // listen for time update
    currsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currsong.currentTime)} / ${secondsToMinutesSeconds(currsong.duration)}`
        document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%";
    })
    // add event listen to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currsong.currentTime = ((currsong.duration) * percent) / 100

    })
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })
    prevbtn.addEventListener("click", () => {
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0])
        playMusic(songs[(index + 1) % songs.length])
    })
    nextbtn.addEventListener("click", () => {
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0])
        playMusic(songs[(index + 1) % songs.length])
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currsong.volume = parseInt(e.target.value) / 100
    })
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0

        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 25;
            currsong.volume = parseInt(25) / 100;

        }
    })
    document.querySelector(".play").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
}
main()

