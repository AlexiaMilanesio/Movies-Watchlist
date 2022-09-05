// *VARIABLES DECLARATIONS

const url = "https://www.omdbapi.com/?apikey=4ff83cda&";
let currentMovies = [];
let savedMovies = [];

// Start Exploring Page
const startExploringPage = document.getElementById("startingPage");
// Search Page
const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
// Movie list - Search or My Watchlist
const movieList = document.getElementById("movieList");
// No Results Page
const noResultPage = document.getElementById("noResultPage");
if(noResultPage) {
  noResultPage.style.display = "none";
}
// My Watchlist empty Page
const emptyWatchlist = document.getElementById("emptyWatchlist");


// *HANDLING EVENTS

// Handling Search events
if(searchButton) {
  searchButton.addEventListener("click", searchMovie);
}
if(searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchMovie();
  });
}


// *FETCH REQUESTS

async function searchMovie() {
  // Stop rendering Start Exploring Page - "conditional rendering"
  startExploringPage.style.display = "none";

  // Accessing the input value the user enter
  const search = searchInput.value.toLowerCase();

  if (!search) {
    noResultPage.style.display = "flex";
  } else {
    // Fetch request to the original API
    const response = await fetch(`${url}s=${search.replace(" ", "+")}`);
    const data = await response.json();
    const dataArray = data.Search;

    currentMovies.length = 0; // ---> Needed to reload search results

    // RENDERING NO RESULTS
    if (!dataArray) {
      setTimeout(() => {
        movieList.style.display = "none";
        noResultPage.style.display = "flex";
      }, 500);
      return;
    } else {
      noResultPage.style.display = "none";
      movieList.style.display = "flex";
    }

    // Access the imdbID info of every movie in the API
    for (const movie of dataArray) {
      const res = await fetch(`${url}i=${movie.imdbID}`);
      const dat = await res.json();

      // Push complete movie data to currentMovies array
      currentMovies.push(dat);

      // Render movies of currentMovies array
      renderMovies(currentMovies);
    }
  }
}


// *RENDERING

// Rendering movies
function renderMovies() {
  let html = "";

  for (let i = 0; i < currentMovies.length; i++) {
    html += movieHtml(currentMovies[i], i);
  }
  movieList.innerHTML = html;

  addOrRemoveWatchlistMovie();
}

// Creating movies HTML
function movieHtml(movie, id) {
  // Watchlist button - "conditional rendering"
  let watchListBtnHtml = "";

  if (!arrayContainsMovie(savedMovies, movie)) {
    // Watchlist add button
    watchListBtnHtml = `
      <button class="watchlistAddButton" id="index-${id}" onclick="addOrRemoveWatchlistMovie()">
        <img src="images/add-icon.png" class="movie-add-icon">Add to Watchlist
      </button>
    `;
  } else {
    // Watchlist remove button
    watchListBtnHtml = `
      <button class="watchlistRemoveButton" id="index-${id}" onclick="addOrRemoveWatchlistMovie()">
        <img src="images/remove-icon.png" class="movie-remove-icon">Remove from Watchlist
      </button>
    `;
  }

  // HTML for every movie
  return `
    <div class="line-center">
      <div class="movie-container">
        <div class="movie-image">
          <img src=${movie.Poster}>
        </div>

        <div class="movie-info">
          <div class="movie-primary-info">
            <p class="movie-title">
              ${movie.Title}
              <span class="movie-rating">
                <img src="images/star-icon.png" class="movie-star-icon">
                ${movie.Ratings.length > 0 ? movie.Ratings[0].Value : "No ratings"}
              </span>
            </p>
          </div>
          <div class="movie-secondary-info">
            <p class="movie-duration">${movie.Runtime}</p>
            <p class="movie-genre">${movie.Genre}</p>
            ${watchListBtnHtml}
          </div>  
          <p class="movie-plot">${movie.Plot}</p> 
        </div>

      </div>
    </div>
  `;
}


// *MY WATCHLIST

// Add or remove movie from My Watchlist 
function addOrRemoveWatchlistMovie() {
  for (let i = 0; i < currentMovies.length; i++) {
    const element = document.getElementById("index-" + i);

    if(element) {
      element.addEventListener("click", () => {
        // Verify if the movie isn't already save in My Watchlist
        if(!arrayContainsMovie(savedMovies, currentMovies[i])) {
          // true: savedMovies array doesn't contain the movie ---> add movie to savedMovies array
          savedMovies.push(currentMovies[i]);
        } else {
          // false: savedMovies array does contain the movie ---> remove element from savedMovies array 
          // dividimos savedMovies array en el index de la movie clickeada, sino devuelve array dividido en index 1
          savedMovies.splice(savedMovies.indexOf(currentMovies[i]), 1);
          if(savedMovies.length === 0) {
            emptyWatchlist.style.display = "flex";  
          }
        }
        saveMovies();
        renderMovies();
      });
    }
  }
}

// Verify if array already contains a movie
function arrayContainsMovie(array, movie) {
  for (let i = 0; i < array.length; i++) {
    if(array[i].imdbID === movie.imdbID) return true;
  }
  return false;
}

// Save movies to localStorage
function saveMovies() {
  localStorage.setItem("SavedMovies", JSON.stringify(savedMovies));
}

// Get movies from localStorage
function getSavedMovies() {
  const loadedMovies = JSON.parse(localStorage.getItem("SavedMovies"));

  if (Array.isArray(loadedMovies)) {
    savedMovies = loadedMovies;
  }
}

// Call the function getSavedMovies to get saved movies from localStorage
getSavedMovies();

// Render My Watchlist
if (window.location.pathname === "/watchlist.html") {
  currentMovies = savedMovies;

  if(currentMovies.length > 0) {
    emptyWatchlist.style.display = "none";
    movieList.style.display = "flex";
    renderMovies();
  }
}
