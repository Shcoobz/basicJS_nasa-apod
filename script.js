// DOM Elements Object
const DOM = {
  resultsNav: document.getElementById('resultsNav'),
  favoritesNav: document.getElementById('favoritesNav'),
  imagesContainer: document.querySelector('.images-container'),
  saveConfirmed: document.querySelector('.save-confirmed'),
  removeConfirmed: document.querySelector('.remove-confirmed'),
  loader: document.querySelector('.loader'),
};

// NASA API Configurations
const NASA_API = {
  count: 10,
  apiKey: 'DEMO_KEY',
  apiUrl: `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=10`,
};

let resultsArray = [];
let favorites = {};

function showContent(page) {
  window.scrollTo({ top: 0, behavior: 'instant' });
  DOM.resultsNav.classList.toggle('hidden', page !== 'results');
  DOM.favoritesNav.classList.toggle('hidden', page === 'results');
  DOM.loader.classList.add('hidden');
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
  DOM.imagesContainer.appendChild(card);
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

function updateDOM(page) {
  if (localStorage.getItem('nasaFavorites')) {
    favorites = JSON.parse(localStorage.getItem('nasaFavorites'));
  }

  DOM.imagesContainer.textContent = '';

  if (page === 'favorites' && Object.keys(favorites).length === 0) {
    const noFavoritesMessage = document.createElement('p');
    noFavoritesMessage.textContent = 'No favorites yet!';
    noFavoritesMessage.classList.add('no-favorites-message');
    DOM.imagesContainer.appendChild(noFavoritesMessage);
  } else {
    createDOMNodes(page);
  }

  showContent(page);
}

async function getNasaPictures() {
  DOM.loader.classList.remove('hidden');

  try {
    const response = await fetch(NASA_API.apiUrl);
    resultsArray = await response.json();
    updateDOM('results');
  } catch (error) {
    console.log(error);
  }
}

function showConfirmation(confirmationElement) {
  confirmationElement.hidden = false;
  setTimeout(() => {
    confirmationElement.hidden = true;
  }, 2000);
}

function manageFavorites(itemUrl, isAdding) {
  const item =
    resultsArray.find((item) => item.url.includes(itemUrl)) || favorites[itemUrl];
  if (isAdding && !favorites[itemUrl]) {
    favorites[itemUrl] = item;
    showConfirmation(DOM.saveConfirmed);
  } else if (!isAdding && favorites[itemUrl]) {
    delete favorites[itemUrl];
    showConfirmation(DOM.removeConfirmed);
  }
  const iconElement = document.querySelector(`.fa-heart[data-url="${itemUrl}"]`);
  if (iconElement) {
    iconElement.classList.toggle('far', !isAdding);
    iconElement.classList.toggle('fas', isAdding);
    iconElement.title = isAdding ? 'Remove from Favorites' : 'Add to Favorites';
  }
  localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
  if (!isAdding) updateDOM('favorites');
}

// Add result to Favorites
function saveFavorite(itemUrl) {
  // Loop through Results Array to select Favorite
  resultsArray.forEach((item) => {
    if (item.url.includes(itemUrl)) {
      if (!favorites[itemUrl]) {
        favorites[itemUrl] = item;
        showConfirmation(DOM.saveConfirmed);
      } else {
        delete favorites[itemUrl];
        showConfirmation(DOM.removeConfirmed);
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
    showConfirmation(DOM.removeConfirmed);
    // Set Favorites in localStorage
    localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
    updateDOM('favorites');
  }
}

// On Load
// getNasaPictures();
