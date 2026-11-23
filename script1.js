const audio = document.getElementById("audio");

const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const songGenre = document.getElementById("songGenre");
const albumArt = document.getElementById("albumArt");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const likeBtn = document.getElementById("likeBtn");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const volume = document.getElementById("volume");
const autoplay = document.getElementById("autoplay");

const searchInput = document.getElementById("searchInput");
const artistFilter = document.getElementById("artistFilter");
const genreFilter = document.getElementById("genreFilter");
const songGrid = document.getElementById("songGrid");
const artistList = document.getElementById("artistList");
const sectionTitle = document.getElementById("sectionTitle");
const emptyMessage = document.getElementById("emptyMessage");
const upNextList = document.getElementById("upNextList");

const playlistForm = document.getElementById("playlistForm");
const playlistName = document.getElementById("playlistName");
const customPlaylistSelect = document.getElementById("customPlaylistSelect");
const addToPlaylistBtn = document.getElementById("addToPlaylistBtn");
const customPlaylistSongs = document.getElementById("customPlaylistSongs");
const songs = [
    {
        id: 1,
        title: "Dream Melody",
        artist: "Arijit Singh",
        genre: "Romantic",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        id: 2,
        title: "Golden Beats",
        artist: "Anirudh Ravichander",
        genre: "Pop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        id: 3,
        title: "Love Journey",
        artist: "Sid Sriram",
        genre: "Romantic",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        id: 4,
        title: "Night Vibes",
        artist: "Arijit Singh",
        genre: "Chill",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    },
    {
        id: 5,
        title: "Energy Mix",
        artist: "Anirudh Ravichander",
        genre: "Pop",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    },
    {
        id: 6,
        title: "Peaceful Tune",
        artist: "Sid Sriram",
        genre: "Chill",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
    }
];
let songIndex = 0;
let viewMode = "all";
let selectedArtist = "all";
// Load saved data safely
function readSaved(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}
let likedSongs = readSaved("melodyLikedSongs", []);
let customPlaylists = readSaved("melodyPlaylists", {});
// Save data in the browser
function saveData() {
    try {
        localStorage.setItem(
            "melodyLikedSongs",
            JSON.stringify(likedSongs)
        );
        localStorage.setItem(
            "melodyPlaylists",
            JSON.stringify(customPlaylists)
        );
    } catch (error) {
        console.warn("Could not save player data.", error);
    }
}
// Format seconds as minutes:seconds
function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${String(secs).padStart(2, "0")}`;
}
// Populate artist and genre filters
function initializeFilters() {
    const artists = [...new Set(songs.map(song => song.artist))];
    const genres = [...new Set(songs.map(song => song.genre))];
    artists.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        artistFilter.appendChild(option);
    });
    genres.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        genreFilter.appendChild(option);
    });
    artistList.innerHTML = "";
    const allButton = document.createElement("button");
    allButton.textContent = "All Artists";
    allButton.classList.add("active");
    allButton.addEventListener("click", () => {
        selectedArtist = "all";
        artistFilter.value = "all";
        viewMode = "all";
        renderSongs();
    });
    artistList.appendChild(allButton);
    artists.forEach(name => {
        const button = document.createElement("button");
        button.textContent = name;
        button.addEventListener("click", () => {
            selectedArtist = name;
            artistFilter.value = name;
            viewMode = "artist";
            renderSongs();
        });
        artistList.appendChild(button);
    });
}
// Load a song into the player
function loadSong(index) {
    songIndex = (index + songs.length) % songs.length;
    const song = songs[songIndex];
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    songGenre.textContent = song.genre;
    audio.src = song.src;
    progress.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
    updateLikeButton();
    renderSongs();
    renderUpNext();
}
// Play current song
async function playSong() {
    try {
        await audio.play();
    } catch (error) {
        console.error("Audio playback failed:", error);
        playBtn.textContent = "▶";
    }
}
// Pause current song
function pauseSong() {
    audio.pause();
}
// Synchronize play button with audio state
audio.addEventListener("play", () => {
    playBtn.textContent = "⏸";
    playBtn.setAttribute("aria-label", "Pause");
});

audio.addEventListener("pause", () => {
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play");
});
playBtn.addEventListener("click", () => {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
});
// Next and previous tracks
function nextSong() {
    loadSong(songIndex + 1);
    playSong();
}

function prevSong() {
    loadSong(songIndex - 1);
    playSong();
}
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// Duration and progress
audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        progress.value = (audio.currentTime / audio.duration) * 100;
        currentTime.textContent = formatTime(audio.currentTime);
    }
});
progress.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = Number(progress.value) / 100 * audio.duration;
    }
});
// Volume
volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
});
// Autoplay next song
audio.addEventListener("ended", () => {
    if (autoplay.checked) {
        nextSong();
    } else {
        progress.value = 0;
        currentTime.textContent = "0:00";
        pauseSong();
    }
});
// Like and unlike current song
function updateLikeButton() {
    const liked = likedSongs.includes(songs[songIndex].id);
    likeBtn.textContent = liked ? "♥ Liked" : "♡ Like";
    likeBtn.classList.toggle("liked", liked);
    likeBtn.setAttribute(
        "aria-label",
        liked ? "Unlike song" : "Like song"
    );
}
function toggleLike(songId) {
    if (likedSongs.includes(songId)) {
        likedSongs = likedSongs.filter(id => id !== songId);
    } else {
        likedSongs.push(songId);
    }
    saveData();
    updateLikeButton();
    renderSongs();
    renderUpNext();
}
likeBtn.addEventListener("click", () => {
    toggleLike(songs[songIndex].id);
});
// Get songs matching the active search/filter/view
function getVisibleSongs() {
    let result = [...songs];
    if (viewMode === "liked") {
        result = result.filter(song => likedSongs.includes(song.id));
    }
    if (viewMode === "recommended") {
        const current = songs[songIndex];
        result = result.filter(song =>
            song.id !== current.id &&
            (song.artist === current.artist ||
             song.genre === current.genre)
        );
        // Show other songs if no similar songs are available
        if (result.length === 0) {
            result = songs.filter(song => song.id !== current.id);
        }
    }
    if (viewMode === "artist") {
        result = result.filter(song => song.artist === selectedArtist);
    }
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        result = result.filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query) ||
            song.genre.toLowerCase().includes(query)
        );
    }
    const artistValue = artistFilter.value;
    const genreValue = genreFilter.value;
    if (artistValue !== "all") {
        result = result.filter(song => song.artist === artistValue);
    }

    if (genreValue !== "all") {
        result = result.filter(song => song.genre === genreValue);
    }

    return result;
}
// Build song cards
function renderSongs() {
    const visibleSongs = getVisibleSongs();

    const titles = {
        all: "All Songs",
        liked: "❤️ Liked Songs",
        recommended: "✨ Recommended Songs",
        artist: `🎤 ${selectedArtist}'s Music`
    };
    sectionTitle.textContent = titles[viewMode] || "All Songs";
    songGrid.innerHTML = "";
    emptyMessage.hidden = visibleSongs.length > 0;
    visibleSongs.forEach(song => {
        const card = document.createElement("article");
        card.className = "song-card";

        const cover = document.createElement("div");
        cover.className = "song-cover";
        cover.textContent = "🎵";

        const title = document.createElement("h3");
        title.textContent = song.title;

        const details = document.createElement("p");
        details.textContent = `${song.artist} · ${song.genre}`;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const playButton = document.createElement("button");
        playButton.textContent = "▶ Play";
        playButton.addEventListener("click", () => {
            loadSong(songs.findIndex(item => item.id === song.id));
            playSong();
        });

        const likeButton = document.createElement("button");
        likeButton.className = "card-like";
        likeButton.textContent = likedSongs.includes(song.id) ? "♥" : "♡";
        likeButton.classList.toggle(
            "liked",
            likedSongs.includes(song.id)
        );
        likeButton.setAttribute(
            "aria-label",
            likedSongs.includes(song.id) ? "Unlike song" : "Like song"
        );
        likeButton.addEventListener("click", () => toggleLike(song.id));

        actions.append(playButton, likeButton);
        card.append(cover, title, details, actions);
        songGrid.appendChild(card);
    });
    // Highlight selected artist
    [...artistList.children].forEach(button => {
        const isActive = viewMode === "artist"
            ? button.textContent === selectedArtist
            : viewMode === "all" && button.textContent === "All Artists";

        button.classList.toggle("active", isActive);
    });
}
// Navigation buttons
document.getElementById("showAllBtn").addEventListener("click", () => {
    viewMode = "all";
    selectedArtist = "all";
    artistFilter.value = "all";
    genreFilter.value = "all";
    searchInput.value = "";
    renderSongs();
});
document.getElementById("showLikedBtn").addEventListener("click", () => {
    viewMode = "liked";
    renderSongs();
});
document.getElementById("showRecommendedBtn").addEventListener("click", () => {
    viewMode = "recommended";
    renderSongs();
});
// Search and filters
searchInput.addEventListener("input", renderSongs);

artistFilter.addEventListener("change", () => {
    selectedArtist = artistFilter.value;
    viewMode = selectedArtist === "all" ? "all" : "artist";
    renderSongs();
});
genreFilter.addEventListener("change", renderSongs);
// Up Next list
function renderUpNext() {
    upNextList.innerHTML = "";
    // Show the other songs in their normal playlist order
    const upcoming = songs.filter(song => song.id !== songs[songIndex].id);
    upcoming.forEach(song => {
        const li = document.createElement("li");
        li.classList.toggle("active", song.id === songs[songIndex].id);

        const text = document.createElement("span");
        text.textContent = `${song.title} — ${song.artist}`;

        const button = document.createElement("button");
        button.textContent = "▶";
        button.setAttribute("aria-label", `Play ${song.title}`);

        button.addEventListener("click", () => {
            loadSong(songs.findIndex(item => item.id === song.id));
            playSong();
        });
        li.append(text, button);
        upNextList.appendChild(li);
    });
}
// Create a custom playlist
function renderPlaylistOptions() {
    const previousSelection = customPlaylistSelect.value;
    customPlaylistSelect.innerHTML =
        '<option value="">Select a playlist</option>';

    Object.keys(customPlaylists).forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        customPlaylistSelect.appendChild(option);
    });
    if (Object.hasOwn(customPlaylists, previousSelection)) {
        customPlaylistSelect.value = previousSelection;
    }
    renderCustomPlaylistSongs();
}
playlistForm.addEventListener("submit", event => {
    event.preventDefault();
    const name = playlistName.value.trim();
    if (!name) return;

    if (Object.keys(customPlaylists).some(
        existing => existing.toLowerCase() === name.toLowerCase()
    )) {
        alert("A playlist with this name already exists.");
        return;
    }
    customPlaylists[name] = [];
    saveData();
    renderPlaylistOptions();

    customPlaylistSelect.value = name;
    renderCustomPlaylistSongs();
    playlistName.value = "";
});
addToPlaylistBtn.addEventListener("click", () => {
    const name = customPlaylistSelect.value;
    if (!name) {
        alert("Please create or select a playlist first.");
        return;
    }
    const currentSongId = songs[songIndex].id;
    if (!customPlaylists[name].includes(currentSongId)) {
        customPlaylists[name].push(currentSongId);
        saveData();
        renderCustomPlaylistSongs();
    } else {
        alert("This song is already in the playlist.");
    }
});
customPlaylistSelect.addEventListener("change", renderCustomPlaylistSongs);
function renderCustomPlaylistSongs() {
    customPlaylistSongs.innerHTML = "";
    const name = customPlaylistSelect.value;
    if (!name || !customPlaylists[name]) return;
    customPlaylists[name].forEach(songId => {
        const song = songs.find(item => item.id === songId);
        if (!song) return;
        const li = document.createElement("li");
        const title = document.createElement("span");
        title.textContent = `${song.title} — ${song.artist}`;
        const actions = document.createElement("span");
        const playButton = document.createElement("button");
        playButton.textContent = "▶";
        playButton.setAttribute("aria-label", `Play ${song.title}`);
        playButton.addEventListener("click", () => {
            loadSong(songs.findIndex(item => item.id === song.id));
            playSong();
        });

        const removeButton = document.createElement("button");
        removeButton.textContent = "✕";
        removeButton.setAttribute("aria-label", `Remove ${song.title}`);
        removeButton.addEventListener("click", () => {
            customPlaylists[name] = customPlaylists[name].filter(
                id => id !== song.id
            );
            saveData();
            renderCustomPlaylistSongs();
        });

        actions.append(playButton, removeButton);
        li.append(title, actions);
        customPlaylistSongs.appendChild(li);
    });
}
// Initialize player
audio.volume = Number(volume.value);
initializeFilters();
loadSong(0);
renderPlaylistOptions();