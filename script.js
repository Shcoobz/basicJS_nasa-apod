/**
 * @fileOverview Script to fetch and display NASA's Picture of the Day using NASA API. Allows users to view images, mark them as favorites, and toggle between all images and favorites.
 */

/** @const {number} RESULTS_COUNT - The number of results to fetch from the NASA API. */
const RESULTS_COUNT = 10;

/** @const {string} MESSAGE_ADDED - Message displayed when an item is added to favorites. */
const MESSAGE_ADDED = 'ADDED!';

/** @const {string} MESSAGE_REMOVED - Message displayed when an item is removed from favorites. */
const MESSAGE_REMOVED = 'DELETED!';

/** @type {Array<Object>} results - Stores the results fetched from the NASA API. */
let results = [];

/** @type {Object} favorites - Stores the user's favorite images/videos. */
let favorites = {};

/**
 * @type {Object} DOM - Cache of DOM elements used in the script to avoid repeated DOM queries.
 */
const DOM = {
  resultsNav: document.getElementById('resultsNav'),
  favoritesNav: document.getElementById('favoritesNav'),
  imagesContainer: document.querySelector('.images-container'),
  saveConfirmed: document.querySelector('.save-confirmed'),
  removeConfirmed: document.querySelector('.remove-confirmed'),
  loader: document.querySelector('.loader'),
};

/**
 * @type {Object} NASA_API - Configuration for NASA API requests.
 */
const NASA_API = {
  count: RESULTS_COUNT,
  apiKey: 'DEMO_KEY',
};

NASA_API.apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API.apiKey}&count=${NASA_API.count}`;

/**
 * Toggles the display of content based on the selected page.
 * @param {string} page - The page to display ('results' or 'favorites').
 */
function showContent(page) {
  window.scrollTo({ top: 0, behavior: 'instant' });
  DOM.resultsNav.classList.toggle('hidden', page !== 'results');
  DOM.favoritesNav.classList.toggle('hidden', page === 'results');
  DOM.loader.classList.add('hidden');
}

/**
 * Creates a container for the media element (image or video) from the result.
 * @param {Object} result - The result object containing media information.
 * @returns {HTMLElement} - The media container element.
 */
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

/**
 * Creates the container for the title and the favorite icon.
 * @param {Object} result - The result object.
 * @param {string} page - The current page.
 * @returns {HTMLElement} - The title and icon container element.
 */
function createTitleAndIconContainer(result, page) {
  const titleAndIconContainer = document.createElement('div');
  titleAndIconContainer.classList.add('title-icon-container');

  const cardTitle = createCardTitle(result);
  const saveText = createSaveText(result, page);

  titleAndIconContainer.append(cardTitle, saveText);

  return titleAndIconContainer;
}

/**
 * Creates the title element for a card.
 * @param {Object} result - The result object.
 * @returns {HTMLElement} - The title element.
 */
function createCardTitle(result) {
  const cardTitle = document.createElement('h5');
  cardTitle.classList.add('card-title');
  cardTitle.textContent = result.title;

  return cardTitle;
}

/**
 * Creates the save text element, which includes the favorite icon.
 * @param {Object} result - The result object.
 * @param {string} page - The current page.
 * @returns {HTMLElement} - The save text element.
 */
function createSaveText(result, page) {
  const saveText = document.createElement('span');
  saveText.classList.add('clickable');

  saveText.innerHTML =
    page === 'results'
      ? `<i class="far fa-heart clickable" data-url="${result.url}" title="Add to Favorites"></i>`
      : `<i class="fas fa-heart clickable" data-url="${result.url}" title="Remove from Favorites"></i>`;

  saveText.onclick = () => toggleFavorite(result.url);

  return saveText;
}

/**
 * Creates the text element for a card, usually containing the description.
 * @param {Object} result - The result object.
 * @returns {HTMLElement} - The text element.
 */
function createCardText(result) {
  const cardText = document.createElement('p');
  cardText.textContent = result.explanation;

  return cardText;
}

/**
 * Creates the muted text element, usually containing copyright and date information.
 * @param {Object} result - The result object.
 * @returns {HTMLElement} - The text-muted element.
 */
function createTextMuted(result) {
  const date = document.createElement('strong');
  date.textContent = result.date;

  const copyright = document.createElement('span');
  copyright.textContent = ` ${result.copyright || ''}`;

  const textMuted = document.createElement('small');
  textMuted.classList.add('text-muted');
  textMuted.append(date, copyright);

  return textMuted;
}

/**
 * Creates the body of a card, containing the title, icons, text, and muted text.
 * @param {Object} result - The result object.
 * @param {string} page - The current page.
 * @returns {HTMLElement} - The card body element.
 */
function createCardBody(result, page) {
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const titleAndIconContainer = createTitleAndIconContainer(result, page);
  const cardText = createCardText(result);
  const textMuted = createTextMuted(result);

  cardBody.append(titleAndIconContainer, cardText, textMuted);

  return cardBody;
}

/**
 * Appends media and body elements to a card and then to the images container.
 * @param {HTMLElement} card - The card element.
 * @param {HTMLElement} mediaContainer - The media container element.
 * @param {HTMLElement} cardBody - The card body element.
 */
function appendCardElements(card, mediaContainer, cardBody) {
  card.append(mediaContainer, cardBody);
  DOM.imagesContainer.appendChild(card);
}

/**
 * Creates and appends DOM nodes for each result in the current array.
 * @param {string} page - The current page.
 */
function createDOMNodes(page) {
  const currentArray = page === 'results' ? results : Object.values(favorites);

  currentArray.forEach((result) => {
    const card = document.createElement('div');
    card.classList.add('card');

    const mediaContainer = createMediaContainer(result);
    const cardBody = createCardBody(result, page);

    appendCardElements(card, mediaContainer, cardBody);
  });
}

/**
 * Updates the DOM with new content based on the current page.
 * @param {string} page - The current page.
 */
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

/**
 * Displays a confirmation message.
 * @param {string} message - The message to display.
 */
function showConfirmation(message) {
  const confirmationElement = document.querySelector('.confirmation-message');
  const confirmationText = document.getElementById('confirmationText');

  confirmationText.textContent = message;
  confirmationElement.hidden = false;

  setTimeout(() => {
    confirmationElement.hidden = true;
  }, 2000);
}

/**
 * Updates the favorite icon based on whether an item is being added or removed from favorites.
 * @param {string} itemUrl - The URL of the item.
 * @param {boolean} isAdding - True if the item is being added, false if removed.
 */
function updateFavoriteIcon(itemUrl, isAdding) {
  const iconElement = document.querySelector(`.fa-heart[data-url="${itemUrl}"]`);

  if (iconElement) {
    iconElement.classList.toggle('far', !isAdding);
    iconElement.classList.toggle('fas', isAdding);
    iconElement.title = isAdding ? 'Remove from Favorites' : 'Add to Favorites';
  }
}

/**
 * Toggles an item as a favorite, adding or removing it from the favorites object.
 * @param {string} itemUrl - The URL of the item to toggle.
 */
function toggleFavorite(itemUrl) {
  const isAdding = !favorites[itemUrl];

  if (isAdding) {
    const itemToAdd = results.find((item) => item.url.includes(itemUrl));

    if (itemToAdd) {
      favorites[itemUrl] = itemToAdd;
      showConfirmation(MESSAGE_ADDED);
    }
  } else {
    delete favorites[itemUrl];
    showConfirmation(MESSAGE_REMOVED);
  }

  updateFavoriteIcon(itemUrl, isAdding);
  localStorage.setItem('nasaFavorites', JSON.stringify(favorites));

  const isFavoritesPageVisible = !DOM.favoritesNav.classList.contains('hidden');

  if (!isAdding && isFavoritesPageVisible) {
    updateDOM('favorites');
  }
}

/**
 * Fetches pictures from the NASA API and updates the DOM with the results.
 */
async function getNasaPictures() {
  DOM.loader.classList.remove('hidden');

  try {
    const response = await fetch(NASA_API.apiUrl);
    results = await response.json();
    updateDOM('results');
  } catch (error) {
    console.log(error);
  }
}

/**
 * Initializes the application by fetching initial pictures.
 */
function init() {
  getNasaPictures();
}

init();
