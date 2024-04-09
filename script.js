const RESULTS_COUNT = 10;
const MESSAGE_ADDED = 'ADDED!';
const MESSAGE_REMOVED = 'DELETED!';

let resultsArray = [];
let favorites = {};

const DOM = {
  resultsNav: document.getElementById('resultsNav'),
  favoritesNav: document.getElementById('favoritesNav'),
  imagesContainer: document.querySelector('.images-container'),
  saveConfirmed: document.querySelector('.save-confirmed'),
  removeConfirmed: document.querySelector('.remove-confirmed'),
  loader: document.querySelector('.loader'),
};

const NASA_API = {
  count: RESULTS_COUNT,
  apiKey: 'DEMO_KEY',
  apiUrl: `https://api.nasa.gov/planetary/apod?api_key=${NASA_API.apiKey}&count=${RESULTS_COUNT}`,
};

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

function createTitleAndIconContainer(result, page) {
  const titleAndIconContainer = document.createElement('div');
  titleAndIconContainer.classList.add('title-icon-container');

  const cardTitle = createCardTitle(result);
  const saveText = createSaveText(result, page);

  titleAndIconContainer.append(cardTitle, saveText);

  return titleAndIconContainer;
}

function createCardTitle(result) {
  const cardTitle = document.createElement('h5');
  cardTitle.classList.add('card-title');
  cardTitle.textContent = result.title;

  return cardTitle;
}

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

function createCardText(result) {
  const cardText = document.createElement('p');
  cardText.textContent = result.explanation;

  return cardText;
}

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

function createCardBody(result, page) {
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const titleAndIconContainer = createTitleAndIconContainer(result, page);
  const cardText = createCardText(result);
  const textMuted = createTextMuted(result);

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

function showConfirmation(message) {
  const confirmationElement = document.querySelector('.confirmation-message');
  const confirmationText = document.getElementById('confirmationText');

  confirmationText.textContent = message;
  confirmationElement.hidden = false;

  setTimeout(() => {
    confirmationElement.hidden = true;
  }, 2000);
}

function toggleFavorite(itemUrl) {
  const isAdding = !favorites[itemUrl];

  if (isAdding) {
    const itemToAdd = resultsArray.find((item) => item.url.includes(itemUrl));

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

function updateFavoriteIcon(itemUrl, isAdding) {
  const iconElement = document.querySelector(`.fa-heart[data-url="${itemUrl}"]`);

  if (iconElement) {
    iconElement.classList.toggle('far', !isAdding);
    iconElement.classList.toggle('fas', isAdding);
    iconElement.title = isAdding ? 'Remove from Favorites' : 'Add to Favorites';
  }
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

function init() {
  getNasaPictures();
}

init();
