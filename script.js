const resultsNav = document.getElementById('resultsNav');
const favoritesNav = document.getElementById('favoritesNav');
const imagesContainer = document.querySelector('.images-container');
const saveConfirmed = document.querySelector('.save-confirmed');
const removeConfirmed = document.querySelector('.remove-confirmed');
const loader = document.querySelector('.loader');

// NASA API
const count = 10;
const apiKey = 'DEMO_KEY';
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

let resultsArray = [];
let favorites = {};

function showContent(page) {
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (page === 'results') {
    resultsNav.classList.remove('hidden');
    favoritesNav.classList.add('hidden');
  } else {
    resultsNav.classList.add('hidden');
    favoritesNav.classList.remove('hidden');
  }

  loader.classList.add('hidden');
}

function createMediaContainer(result) {
  let mediaContainer;
  if (result.media_type === 'image') {
    mediaContainer = document.createElement('a');
    mediaContainer.href = result.hdurl;
    mediaContainer.title = 'View Full Image';
    mediaContainer.target = '_blank';

    const image = document.createElement('img');
    image.src = result.url;
    image.alt = 'NASA Picture of the Day';
    image.loading = 'lazy';
    image.classList.add('card-img-top');
    mediaContainer.appendChild(image);
  } else if (result.media_type === 'video') {
    mediaContainer = document.createElement('iframe');
    mediaContainer.src = result.url;
    mediaContainer.title = 'NASA Video of the Day';
    mediaContainer.classList.add('card-img-top', 'video-frame');
    mediaContainer.style.border = 'none';
    mediaContainer.style.width = '100%';
    mediaContainer.style.height = '500px';
  }
  return mediaContainer;
}

function createCardBody(result, page) {
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const titleAndIconContainer = document.createElement('div');
  titleAndIconContainer.classList.add('title-icon-container');

  const cardTitle = document.createElement('h5');
  cardTitle.classList.add('card-title');
  cardTitle.textContent = result.title;

  const saveText = document.createElement('span');
  saveText.classList.add('clickable');
  saveText.innerHTML =
    page === 'results'
      ? `<i class="far fa-heart clickable" data-url="${result.url}" title="Add to Favorites"></i>`
      : `<i class="fas fa-heart clickable" data-url="${result.url}" title="Remove from Favorites"></i>`;
  saveText.onclick = () =>
    page === 'results' ? saveFavorite(result.url) : removeFavorite(result.url);

  const cardText = document.createElement('p');
  cardText.textContent = result.explanation;

  const date = document.createElement('strong');
  date.textContent = result.date;

  const copyright = document.createElement('span');
  copyright.textContent = ` ${result.copyright || ''}`;

  const textMuted = document.createElement('small');
  textMuted.classList.add('text-muted');
  textMuted.append(date, copyright);

  titleAndIconContainer.append(cardTitle, saveText);
  cardBody.append(titleAndIconContainer, cardText, textMuted);

  return cardBody;
}

function appendCardElements(card, mediaContainer, cardBody) {
  card.append(mediaContainer, cardBody);
  imagesContainer.appendChild(card);
}

function createDOMNodes(page) {
  const currentArray = page === 'results' ? resultsArray : Object.values(favorites);

  currentArray.forEach((result) => {
    const card = document.createElement('div');
    card.classList.add('card');

    const mediaContainer = createMediaContainer(result);
    const cardBody = createCardBody(result, page);

    appendCardElements(card, mediaContainer, cardBody);
  });
}

//
function updateDOM(page) {
  // Get Favorites from LocalStorage
  if (localStorage.getItem('nasaFavorites')) {
    favorites = JSON.parse(localStorage.getItem('nasaFavorites'));
  }

  imagesContainer.textContent = '';

  // Check if updating 'favorites' page and favorites is empty
  if (page === 'favorites' && Object.keys(favorites).length === 0) {
    const noFavoritesMessage = document.createElement('p');
    noFavoritesMessage.textContent = 'No favorites yet!';
    noFavoritesMessage.classList.add('no-favorites-message');
    imagesContainer.appendChild(noFavoritesMessage);
  } else {
    createDOMNodes(page);
  }

  showContent(page);
}

// Get 10 Images from NASA API
async function getNasaPictures() {
  // Show Loader
  loader.classList.remove('hidden');

  try {
    const response = await fetch(apiUrl);
    resultsArray = await response.json();
    updateDOM('results');
  } catch (error) {
    // Catch Error Here
    console.log(error);
  }
}

function showSaveConfirmation() {
  saveConfirmed.hidden = false;
  setTimeout(() => {
    saveConfirmed.hidden = true;
  }, 2000);
}

function showRemoveConfirmation() {
  removeConfirmed.hidden = false;
  setTimeout(() => {
    removeConfirmed.hidden = true;
  }, 2000);
}

// Add result to Favorites
function saveFavorite(itemUrl) {
  // Loop through Results Array to select Favorite
  resultsArray.forEach((item) => {
    if (item.url.includes(itemUrl)) {
      if (!favorites[itemUrl]) {
        favorites[itemUrl] = item;
        showSaveConfirmation();
      } else {
        delete favorites[itemUrl];
        showRemoveConfirmation();
      }
      const iconElement = document.querySelector(`.fa-heart[data-url="${itemUrl}"]`);
      if (iconElement) {
        iconElement.classList.toggle('far');
        iconElement.classList.toggle('fas');
        iconElement.title = favorites[itemUrl]
          ? 'Remove from Favorites'
          : 'Add to Favorites';
      }
      // Set Favorites in localStorage
      localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
    }
  });
}

// Remove item from Favorites
function removeFavorite(itemUrl) {
  if (favorites[itemUrl]) {
    delete favorites[itemUrl];
    const iconElement = document.querySelector(`.fa-heart[data-url="${itemUrl}"]`);
    if (iconElement) {
      iconElement.classList.replace('fas', 'far');
      iconElement.title = 'Add to Favorites';
    }
    showRemoveConfirmation();
    // Set Favorites in localStorage
    localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
    updateDOM('favorites');
  }
}

// On Load
// getNasaPictures();
