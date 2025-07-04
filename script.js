// TMDB API Configuration
const API_KEY = 'd5c6cd5cb7bb4fcf1bc9b95fab9db44c'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Genre data
const genres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
];

// Selected genres
let selectedGenres = [];

// DOM Elements
const genreContainer = document.getElementById('genreContainer');
const movieContainer = document.getElementById('movieContainer');
const recommendBtn = document.getElementById('recommendBtn');

// Initialize the app
function init() {
    displayGenres();
    setupEventListeners();
}

// Display all genres
function displayGenres() {
    genreContainer.innerHTML = genres.map(genre => `
        <div class="genre-item" data-id="${genre.id}">${genre.name}</div>
    `).join('');
}

// Set up event listeners
function setupEventListeners() {
    // Genre selection
    document.querySelectorAll('.genre-item').forEach(item => {
        item.addEventListener('click', function() {
            const genreId = parseInt(this.getAttribute('data-id'));
            toggleGenreSelection(genreId, this);
        });
    });

    // Recommendation button
    recommendBtn.addEventListener('click', getRecommendations);
}

// Toggle genre selection
function toggleGenreSelection(genreId, element) {
    if (selectedGenres.includes(genreId)) {
        selectedGenres = selectedGenres.filter(id => id !== genreId);
        element.classList.remove('selected');
    } else {
        selectedGenres.push(genreId);
        element.classList.add('selected');
    }
}

// Get movie recommendations
async function getRecommendations() {
    if (selectedGenres.length === 0) {
        alert('Please select at least one genre');
        return;
    }

    movieContainer.innerHTML = '<div class="loading">Loading recommendations...</div>';

    try {
        // Get 3 random movies for each selected genre
        let allMovies = [];
        
        for (const genreId of selectedGenres) {
            const movies = await fetchMoviesByGenre(genreId);
            // Get 3 random movies from this genre
            const shuffled = movies.sort(() => 0.5 - Math.random());
            allMovies.push(...shuffled.slice(0, 3));
        }

        // Remove duplicates
        const uniqueMovies = removeDuplicates(allMovies, 'id');
        
        // Sort by rating (descending)
        uniqueMovies.sort((a, b) => b.vote_average - a.vote_average);
        
        displayMovies(uniqueMovies);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        movieContainer.innerHTML = '<div class="loading">Error loading recommendations. Please try again.</div>';
    }
}

// Fetch movies by genre
async function fetchMoviesByGenre(genreId) {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=100`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

// Remove duplicate movies
function removeDuplicates(array, key) {
    return array.filter((item, index, self) =>
        index === self.findIndex((t) => (
            t[key] === item[key]
        ))
    );
}

// Display movies
function displayMovies(movies) {
    if (movies.length === 0) {
        movieContainer.innerHTML = '<div class="loading">No movies found. Try selecting different genres.</div>';
        return;
    }

    movieContainer.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <img class="movie-poster" src="${movie.poster_path ? IMG_BASE_URL + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Poster'}" alt="${movie.title}">
            <div class="movie-info">
                <h3 class="movie-title" title="${movie.title}">${movie.title}</h3>
                <div class="movie-details">
                    <span class="rating">★ ${movie.vote_average.toFixed(1)}</span> | ${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
