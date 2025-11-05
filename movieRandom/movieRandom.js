const SUPABASE_URL = "https://hxaqbpcufdlzfhmgddds.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YXFicGN1ZmRsemZobWdkZGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzY3ODQsImV4cCI6MjA3MjQxMjc4NH0.o38-3lqMWMAESf5I3oXaGXqTp1fXw6mkZ310b7-EhXo";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const API_KEY = "9b02e967dce99b746fc634d03605d150";
const currentUser = sessionStorage.getItem("currentUser") || "guest";

let allMovies = [];
let isRandomizing = false;

// Inicjalizacja
document.addEventListener('DOMContentLoaded', function() {
    initProfile();
    loadSharedMovies();
    setupEventListeners();
});

function initProfile() {
    document.getElementById("profileName").textContent = currentUser;
    document.getElementById("profilePicture").innerHTML = '<img src="../img/avatar'+currentUser+'.jpg" alt="">';
    
    const profileBtn = document.getElementById("profileBtn");
    const dropdown = document.getElementById("dropdown");

    profileBtn.addEventListener("click", () => {
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    document.getElementById("sharedListBtn").addEventListener("click", () => {
        window.location.href = "shared.html";
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        sessionStorage.removeItem("currentUser");
        window.location.href = "../index.html";
    });

    window.addEventListener("click", (e) => {
        if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = "none";
        }
    });
}

function setupEventListeners() {
    document.getElementById("startRandom").addEventListener("click", startRandomization);
    
    // Footer toggle
    const footer = document.getElementById("footer");
    const footerToggle = document.getElementById("footerToggle");
    footerToggle.addEventListener("click", () => {
        footer.classList.toggle("open");
        footerToggle.classList.toggle("open");
    });
}

async function loadSharedMovies() {
    try {
        const { data, error } = await supabaseClient.from('shared_list').select('*');
        
        if (error) throw error;

        if (!data || data.length === 0) {
            document.getElementById("randomResult").innerHTML = "<p>Brak filmów na wspólnej liście! 😅</p>";
            document.getElementById("startRandom").disabled = true;
            return;
        }

        allMovies = data;
        document.getElementById("startRandom").disabled = false;
        
        // Pokaż listę filmów
        showMoviesList(allMovies);
        
    } catch (err) {
        console.error("Błąd ładowania filmów:", err);
        document.getElementById("randomResult").innerHTML = "<p>Błąd ładowania filmów</p>";
    }
}

function showMoviesList(movies) {
    const container = document.getElementById("moviesGrid");
    const listContainer = document.getElementById("moviesList");
    
    container.innerHTML = "";
    listContainer.style.display = "block";

    movies.forEach(movie => {
        const div = document.createElement("div");
        div.classList.add("movie-item");
        div.innerHTML = `
            <img src="https://via.placeholder.com/150x200/333/fff?text=Ładowanie..." 
                 data-movie-id="${movie.movie_id}" 
                 data-type="${movie.type}"
                 alt="Film">
        `;
        container.appendChild(div);
        
        // Załaduj prawdziwy poster
        loadMoviePoster(movie.movie_id, movie.type, div.querySelector('img'));
    });
}

async function loadMoviePoster(movieId, type, imgElement) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}?api_key=${API_KEY}&language=pl-PL`);
        const movie = await res.json();
        
        if (movie.poster_path) {
            imgElement.src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
            imgElement.alt = movie.title || movie.name;
            
            // Kliknięcie otwiera modal
            imgElement.parentElement.addEventListener('click', () => {
                openMovieModal(movieId, type);
            });
        }
    } catch (err) {
        console.error("Błąd ładowania posteru:", err);
    }
}

async function startRandomization() {
    if (isRandomizing || allMovies.length === 0) return;
    
    isRandomizing = true;
    const startBtn = document.getElementById("startRandom");
    const resultDiv = document.getElementById("randomResult");
    
    startBtn.disabled = true;
    startBtn.textContent = "LOSUJĘ...";
    resultDiv.classList.add('spinning', 'glowing');
    
    // Animacja losowania
    let counter = 0;
    const maxCycles = 20;
    const interval = setInterval(() => {
        const randomMovie = allMovies[Math.floor(Math.random() * allMovies.length)];
        showRandomMoviePreview(randomMovie);
        counter++;
        
        if (counter >= maxCycles) {
            clearInterval(interval);
            finishRandomization();
        }
    }, 100);
}

function showRandomMoviePreview(movie) {
    const resultDiv = document.getElementById("randomResult");
    resultDiv.innerHTML = `
        <div>
            <h2>🎬 Losowanie...</h2>
            <p>Wybieram dla Ciebie film...</p>
        </div>
    `;
}

async function finishRandomization() {
    const resultDiv = document.getElementById("randomResult");
    const startBtn = document.getElementById("startRandom");
    
    // Wybierz zwycięski film
    const winner = allMovies[Math.floor(Math.random() * allMovies.length)];
    
    try {
        const res = await fetch(`https://api.themoviedb.org/3/${winner.type}/${winner.movie_id}?api_key=${API_KEY}&language=pl-PL`);
        const movieData = await res.json();
        
        resultDiv.classList.remove('spinning', 'glowing');
        resultDiv.classList.add('winner');
        
        resultDiv.innerHTML = `
            <h2>🎉 WYLOSOWANO!</h2>
            <img src="https://image.tmdb.org/t/p/w500${movieData.poster_path}" alt="${movieData.title || movieData.name}">
            <h3>${movieData.title || movieData.name}</h3>
            <p>${movieData.overview?.substring(0, 150)}...</p>
            <button onclick="openMovieModal(${winner.movie_id}, '${winner.type}')" class="start-btn" style="margin-top: 15px; padding: 10px 20px;">
                Zobacz szczegóły
            </button>
        `;
        
    } catch (err) {
        resultDiv.innerHTML = "<p>Błąd ładowania wylosowanego filmu</p>";
    }
    
    startBtn.disabled = false;
    startBtn.textContent = "🎬 LOSUJ PONOWNIE";
    isRandomizing = false;
}

// Funkcje modala
async function openMovieModal(movieId, type = 'movie') {
    try {
        const modal = document.getElementById("movieModal");
        const modalTitle = document.getElementById("modalTitle");
        const modalOverview = document.getElementById("modalOverview");
        const modalGenres = document.getElementById("modalGenres");
        const modalTrailer = document.getElementById("modalTrailer");

        const res = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}?api_key=${API_KEY}&language=pl-PL&append_to_response=videos`);
        const movie = await res.json();

        modalTitle.textContent = movie.title || movie.name;
        modalOverview.textContent = movie.overview || "Brak opisu.";
        modalGenres.innerHTML = movie.genres?.length ? "<b>Gatunki: </b>" + movie.genres.map(g => g.name).join(", ") : "Gatunki: brak danych";

        const trailer = movie.videos?.results?.find(v => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube");
        modalTrailer.innerHTML = trailer ? 
            `<iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>` :
            `<p>Brak trailera. <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title || movie.name)}+trailer" target="_blank">Szukaj na YouTube</a></p>`;

        modal.style.display = "block";
    } catch (err) {
        console.error("Błąd ładowania modala:", err);
    }
}

// Zamknięcie modala
document.querySelector(".close-btn").addEventListener("click", () => {
    document.getElementById("movieModal").style.display = "none";
    document.getElementById("modalTrailer").innerHTML = "";
});

window.addEventListener("click", e => {
    if (e.target === document.getElementById("movieModal")) {
        document.getElementById("movieModal").style.display = "none";
        document.getElementById("modalTrailer").innerHTML = "";
    }
});