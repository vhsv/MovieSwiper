const SUPABASE_URL = "https://hxaqbpcufdlzfhmgddds.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YXFicGN1ZmRsemZobWdkZGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzY3ODQsImV4cCI6MjA3MjQxMjc4NH0.o38-3lqMWMAESf5I3oXaGXqTp1fXw6mkZ310b7-EhXo";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const API_KEY = "9b02e967dce99b746fc634d03605d150";
const currentUser = sessionStorage.getItem("currentUser") || "guest";
let otherUser = ""
if(currentUser == "Julcia")
{
    otherUser = "Emiś"
}
else
{
    otherUser = "Julcia"
}

let sharedMovies = [];
let currentIndex = 0;
 document.getElementById("logoutBtn").addEventListener("click", () => {
      // usuń zapisany userId
      sessionStorage.removeItem("currentUser");
      // przekieruj na stronę logowania
      window.location.href = "../index.html"; // lub "login.html" jeśli masz osobną stronę logowania
    });


    // Zamknij dropdown jeśli klikniesz poza nim
    window.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
async function fetchSharedItem(item) {
  let url = "";

  if(item.type === "movie") {
    url = `https://api.themoviedb.org/3/movie/${item.movie_id}?api_key=${API_KEY}&language=pl-PL`;
  } else if(item.type === "tv") {
    url = `https://api.themoviedb.org/3/tv/${item.movie_id}?api_key=${API_KEY}&language=pl-PL`;
  } else if(item.type === "anime") {
    // jeśli traktujesz anime jak film w TMDB
    url = `https://api.themoviedb.org/3/movie/${item.movie_id}?api_key=${API_KEY}&language=pl-PL`;
  }

  const res = await fetch(url);
  const data = await res.json();
  return data;
}

    const footer = document.getElementById("footer");
    const footerToggle = document.getElementById("footerToggle");

    footerToggle.addEventListener("click", () => {
      footer.classList.toggle("open");
      footerToggle.classList.toggle("open");
    });

async function loadSharedList() {
  const container = document.getElementById("sharedList");
  container.innerHTML = "";

  const { data, error } = await supabaseClient.from('shared_list').select('*');

  if (error) {
    console.error("Błąd pobierania wspólnej listy:", error);
    container.innerHTML = "<p>Nie udało się pobrać listy.</p>";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>Brak filmów na wspólnej liście.</p>";
    return;
  }

  for (const item of data) {
    try {
      // Pobierz szczegóły filmu/serialu w zależności od typu
      const movie = await fetchSharedItem(item);

      const poster = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` 
        : 'https://via.placeholder.com/300x450?text=No+Poster';

      const title = movie.title || movie.name || "Brak tytułu";
      const release = movie.release_date || movie.first_air_date || "brak danych";

      const div = document.createElement("div");
      div.classList.add("movie");
      div.innerHTML = `
        <img src="${poster}" alt="${title}">


      `;
      container.appendChild(div);

      // Kliknięcie w obrazek lub tytuł -> otwórz modal
      const img = div.querySelector("img");

      img.addEventListener("click", () => openMovieModal(item.movie_id, item.type));

    } catch (err) {
      console.error("Błąd pobierania filmu/serialu do gridu:", err);
    }
  }
}


document.getElementById("profileName").textContent = currentUser;
    document.getElementById("profilePicture").innerHTML = '<img src="../img/avatar'+currentUser+'.jpg" alt="">'
    // Toggle dropdown
    const profileBtn = document.getElementById("profileBtn");
    const dropdown = document.getElementById("dropdown");

    profileBtn.addEventListener("click", () => {
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    document.getElementById("sharedListBtn").addEventListener("click", () => {
      // otwórz nową stronę np. shared.html
    window.location.href = "shared.html";

    });

// Załaduj filmy z tabeli shared_list
async function loadSharedMovies() {
    console.log(currentUser)
     try {
    // Usuń wszystkie swipes dla bieżącego użytkownika
    const { data, error } = await supabaseClient
      .from("swipes")
      .delete()
      .eq("user_id", currentUser);

    if (error) {
      console.error("Błąd czyszczenia swipes:", error);
    } else {
      console.log("Swipes wyczyszczone:", data);
    }

  } catch (err) {
    console.error("Nieoczekiwany błąd:", err);
  }

document.querySelector(".swiper-container").style.display = "block"
document.getElementById("sharedListContainer").style.display = "none"
  const { data, error } = await supabaseClient.from("shared_list").select("*");

  if (error) {
    console.error("❌ Błąd pobierania shared_list:", error);
    document.getElementById("movieCard").innerHTML = "<p>Błąd pobierania filmów.</p>";
    return;
  }

  console.log("📀 Załadowano shared_list:", data);

  sharedMovies = data;
  if (sharedMovies.length === 0) {
    document.getElementById("movieCard").innerHTML = "<p>Brak filmów do swipe’owania 😞</p>";
  } else {
    currentIndex = 0;
    showMovie(sharedMovies[currentIndex]);
  }
}
 const modal = document.getElementById("movieModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalOverview = document.getElementById("modalOverview");
  const modalTrailer = document.getElementById("modalTrailer");
  const modalGenres = document.getElementById("modalGenres");
  const closeBtn = document.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  modalTrailer.innerHTML = "";
});

window.addEventListener("click", e => {
  if (e.target === modal) {
    modal.style.display = "none";
    modalTrailer.innerHTML = "";
  }
});
// Pokaż pojedynczy film
async function showMovie(movieData) {
  if (!movieData) return;

  const movieId = movieData.movie_id;
  const type = movieData.type || "movie";

  const res = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}?api_key=${API_KEY}&language=pl-PL`);
  const movie = await res.json();

  document.getElementById("movieCard").innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title || movie.name}">
    <h2>${movie.title || movie.name}</h2>
  `;
}

// Zapisz decyzję swipe
async function saveSwipe(action) {
  const movie = sharedMovies[currentIndex];
  if (!movie) return;

  const { error } = await supabaseClient.from("swipes").insert([
    {
      user_id: currentUser,
      movie_id: movie.movie_id,
      type: movie.type || "movie",
      action: action
    }
  ]);

  if (error) {
    console.error("❌ Błąd zapisu swipe:", error);
  } else {
    console.log(`💾 Zapisano: ${action} dla ${movie.movie_id}`);
  }

  currentIndex++;
  if (currentIndex < sharedMovies.length) {
    showMovie(sharedMovies[currentIndex]);
  } else {
    console.log("🎉 Koniec listy — pokazuję polubione filmy");
    window.location.href = "swipeResult.html"
  }
}

// Pokaż tylko polubione filmy
async function showLikedMovies(otherUser) {
  const container = document.getElementById("movieCard");
  container.innerHTML = "<h2>Ładowanie wspólnych polubionych filmów...</h2>";

  try {
    // Polubione przez Ciebie
    const { data: myLikes, error: myError } = await supabaseClient
      .from("swipes")
      .select("movie_id, type")
      .eq("action", "liked")
      .eq("user_id", currentUser);

    if (myError) throw myError;

    // Polubione przez drugiego użytkownika
    const { data: otherLikes, error: otherError } = await supabaseClient
      .from("swipes")
      .select("movie_id, type")
      .eq("action", "liked")
      .eq("user_id", otherUser);

    if (otherError) throw otherError;

    if (!myLikes.length || !otherLikes.length) {
      container.innerHTML = "<p>Brak wspólnych polubionych filmów 😅</p>";
      return;
    }

    // Przecięcie po movie_id
    const myMovieIds = new Set(myLikes.map(m => m.movie_id));
    const mutualLikes = otherLikes.filter(m => myMovieIds.has(m.movie_id));

    if (mutualLikes.length === 0) {
      container.innerHTML = "<p>Brak wspólnych polubionych filmów 😅</p>";
      return;
    }

    container.innerHTML = "<h2>🎬 Wspólnie polubione filmy:</h2>";
    const grid = document.createElement("div");
    grid.classList.add("liked-grid");

    // Pobierz szczegóły z TMDB równolegle
    await Promise.all(mutualLikes.map(async item => {
      const res = await fetch(`https://api.themoviedb.org/3/${item.type}/${item.movie_id}?api_key=${API_KEY}&language=pl-PL`);
      const movie = await res.json();

      const div = document.createElement("div");
      div.classList.add("liked-item");
      div.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title || movie.name}">
        <h4>${movie.title || movie.name}</h4>
      `;
      grid.appendChild(div);
    }));

    container.appendChild(grid);

  } catch (err) {
    console.error("Błąd:", err);
    container.innerHTML = "<p>Wystąpił błąd podczas ładowania wspólnych polubionych filmów.</p>";
  }
  document.querySelector(".buttons").style.display = "none"
  document.getElementById("swipeAgain").style.display = "inline-block"
  document.getElementById("swipeAgain").addEventListener("click", async () => {
  await startMutualSwipe(otherUser);
});
}

async function startMutualSwipe(otherUser) {
    document.getElementById("swipeAgain").style.display = "none"
    document.querySelector(".buttons").style.display = "inline-block"
  try {
   
    const { data: myLikes, error: myError } = await supabaseClient
      .from("swipes")
      .select("movie_id, type")
      .eq("action", "liked")
      .eq("user_id", currentUser);

    if (myError) throw myError;

    // 2️⃣ Pobieramy polubione przez drugiego użytkownika
     // podaj tu id drugiego użytkownika
    const { data: otherLikes, error: otherError } = await supabaseClient
      .from("swipes")
      .select("movie_id, type")
      .eq("action", "liked")
      .eq("user_id", otherUser);

    if (otherError) throw otherError;

    const otherMovieIds = new Set(otherLikes.map(m => m.movie_id));

    // 3️⃣ Wspólne polubione filmy
    const mutualLikes = myLikes.filter(m => otherMovieIds.has(m.movie_id));

    if (!mutualLikes.length) {
      alert("Brak wspólnie polubionych filmów do swipe’owania 😅");
      return;
    }

    // 4️⃣ Resetujemy swipe
    sharedMovies = mutualLikes;
    currentIndex = 0;

    // 5️⃣ Czyścimy stare swipes dla bieżącego użytkownika
    const { error: delError } = await supabaseClient
      .from("swipes")
      .delete()
      .eq("user_id", currentUser);

    if (delError) console.error("Błąd czyszczenia swipes:", delError);

    // 6️⃣ Pokaż pierwszy film
    document.querySelector(".swiper-container").style.display = "block";
    document.getElementById("sharedListContainer").style.display = "none";
    showMovie(sharedMovies[currentIndex]);

  } catch (err) {
    console.error("Błąd podczas ponownego swipe’owania:", err);
  }
}

    async function openMovieModal(movieId) {
  try {
    // DODATKOWE LOGI (usuń jeśli za dużo)
    console.log("openMovieModal() movieId:", movieId);

    // Pobieramy pełne szczegóły + videos
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=pl-PL&append_to_response=videos`);
    const movie = await res.json();

    // pokażemy obiekt w konsoli (debug)
    console.log("TMDB movie object:", movie);

    // Bezpieczeństwo: jeśli brak overview/genres - użyj fallbacku
    modalTitle.textContent = movie.title || "Brak tytułu";
    modalOverview.textContent = movie.overview && movie.overview.trim().length > 0 ? movie.overview : "Brak opisu.";
    if (movie.genres && movie.genres.length > 0) {
      modalGenres.innerHTML = "<b>Gatunki: </b>" + movie.genres.map(g => g.name).join(", ");
    } else {
      modalGenres.textContent = "Gatunki: brak danych";
    }

    // TRAILER - bezpieczne wyszukiwanie (Trailer -> Teaser -> pierwszy YouTube)
    let trailer = null;
    if (movie.videos && Array.isArray(movie.videos.results) && movie.videos.results.length > 0) {
      trailer = movie.videos.results.find(v => v.type === "Trailer" && v.site === "YouTube")
             || movie.videos.results.find(v => v.type === "Teaser" && v.site === "YouTube")
             || movie.videos.results.find(v => v.site === "YouTube");
    }

    // Wyczyść poprzedni iframe
    modalTrailer.innerHTML = "";

    if (trailer && trailer.key) {
      modalTrailer.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>`;
    } else {
      // Jeśli brak video w TMDB - pokaż prosty link do wyszukania na YouTube
      const safeTitle = encodeURIComponent(movie.title || "");
      modalTrailer.innerHTML = `<p>Brak trailera w TMDB. <a href="https://www.youtube.com/results?search_query=${safeTitle}+trailer" target="_blank" rel="noopener">Szukaj na YouTube</a></p>`;
      console.log("Brak trailera w TMDB dla id:", movieId, "movie.videos:", movie.videos);
    }

    modal.style.display = "block";
  } catch (err) {
    console.error("Błąd ładowania filmu w modalu:", err);
    modalOverview.textContent = "Nie udało się załadować opisu.";
    modalGenres.textContent = "";
    modalTrailer.innerHTML = "<p>Brak trailera.</p>";
    modal.style.display = "block";
  }
}
document.getElementById("startSwipe").addEventListener("click", () =>loadSharedMovies());


// Obsługa kliknięć
document.getElementById("likeBtn").addEventListener("click", () => saveSwipe("liked"));
document.getElementById("dislikeBtn").addEventListener("click", () => saveSwipe("disliked"));


 loadSharedList();
