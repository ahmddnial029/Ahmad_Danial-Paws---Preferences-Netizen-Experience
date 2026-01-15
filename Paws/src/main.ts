
const container = document.querySelector<HTMLDivElement>('.card-container');
const CAT_COUNT = 15;
const SWIPE_THRESHOLD = 120;
const likedCats: string[] = [];

let startX = 0;
let deltaX = 0;
let currentX = 0;
let isDragging = false;
let activeCard: HTMLDivElement | null = null;

function createCards() {
  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i < CAT_COUNT; i++) {
    const card = document.createElement('div');
    card.className = 'cat-card';
    card.style.zIndex = `${CAT_COUNT - i}`;

const imageUrl = `https://cataas.com/cat?width=400&height=400&random=${i}`;

const img = document.createElement('img');
img.src = imageUrl;
img.alt = 'Cute cat';

card.dataset.image = imageUrl;

    card.appendChild(img);
    const likeOverlay = document.createElement('div');
    likeOverlay.className = 'swipe-overlay like';
    likeOverlay.textContent = '❤️';

    const dislikeOverlay = document.createElement('div');
    dislikeOverlay.className = 'swipe-overlay dislike';
    dislikeOverlay.textContent = '👎';

    card.appendChild(likeOverlay);
    card.appendChild(dislikeOverlay);
    container.appendChild(card);
  }
  attachTopCardEvents();
}

function attachTopCardEvents() {
  const cards = document.querySelectorAll<HTMLDivElement>('.cat-card');

  let topCard: HTMLDivElement | null = null;
  let highestZ = -1;

  for (const card of cards) {
    const z = Number(card.style.zIndex);
    if (z > highestZ) {
      highestZ = z;
      topCard = card;
    }
  }

  if (topCard === null) return;

  activeCard = topCard;

  topCard.addEventListener('mousedown', onStart);
  topCard.addEventListener('touchstart', onStart);

  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove);

  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
}

function onStart(event: MouseEvent | TouchEvent) {
  event.preventDefault();
  isDragging = true;
  deltaX = 0;
  startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  currentX = startX;

  if (activeCard) {
  activeCard.style.transition = 'none';
  activeCard.style.transform += ' scale(1.03)';
}
}

function onMove(event: MouseEvent | TouchEvent) {
  if (!isDragging || !activeCard) return;

  currentX = 'touches' in event
    ? event.touches[0].clientX
    : event.clientX;

  const deltaX = currentX - startX;
  const rotation = deltaX * 0.05;

  activeCard.style.transform =
    `translateX(${deltaX}px) rotate(${rotation}deg)`;

  const likeOverlay = activeCard.querySelector<HTMLDivElement>('.swipe-overlay.like');
  const dislikeOverlay = activeCard.querySelector<HTMLDivElement>('.swipe-overlay.dislike');

  const opacity = Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);

  if (deltaX > 0) {
    if (likeOverlay) likeOverlay.style.opacity = opacity.toString();
    if (dislikeOverlay) dislikeOverlay.style.opacity = '0';
  } else {
    if (dislikeOverlay) dislikeOverlay.style.opacity = opacity.toString();
    if (likeOverlay) likeOverlay.style.opacity = '0';
  }
}

function onEnd() {
  if (!isDragging || !activeCard) return;

  isDragging = false;

  const deltaX = currentX - startX;

  activeCard.style.transition = 'transform 0.3s ease';

  const overlays = activeCard.querySelectorAll('.swipe-overlay');
  overlays.forEach(o => (o as HTMLElement).style.opacity = '0');

  if (deltaX > SWIPE_THRESHOLD) {
    // LIKE → swipe right
    swipeCard(1);
  } else if (deltaX < -SWIPE_THRESHOLD) {
    // DISLIKE → swipe left
    swipeCard(-1);
  } else {
    // Snap back
    activeCard.style.transform = 'translateX(0) rotate(0deg)';
  }

  setTimeout(() => {
    if (activeCard) activeCard.style.transition = '';
  }, 300);
}

createCards();

const likeBtn = document.getElementById('like-btn');
const dislikeBtn = document.getElementById('dislike-btn');

likeBtn?.addEventListener('click', () => {
  if (activeCard) swipeCard(1);
});

dislikeBtn?.addEventListener('click', () => {
  if (activeCard) swipeCard(-1);
});


function swipeCard(direction: 1 | -1) {
  if (!activeCard) return;

  const moveX = direction * window.innerWidth;

  activeCard.style.transform = `translateX(${moveX}px) rotate(${direction * 30}deg)`;

  const removedCard = activeCard;

  if (direction === 1) {
    const imgUrl = removedCard.dataset.image;
    if (imgUrl) likedCats.push(imgUrl);
  }

  setTimeout(() => {
    removedCard.remove();
    activeCard = null;

    if (document.querySelectorAll('.cat-card').length === 0) {
      showSummary();
    } else {
      attachTopCardEvents();
    }
  }, 300);
}

function showSummary() {
  const overlay = document.getElementById("summary-overlay");
  const likedGrid = document.getElementById("liked-cats");
  const likeCount = document.getElementById("like-count");
  const actions = document.getElementById("actions");

  if (!overlay || !likedGrid || !likeCount) return;

  // Hide swipe buttons if any
  if (actions) actions.style.display = "none";

  // Set count
  likeCount.textContent = likedCats.length.toString();

  // Populate liked images
  likedGrid.innerHTML = likedCats
    .map(
      (url) => `<img src="${url}" alt="Liked cat" />`
    )
    .join("");

  // Show popup
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";

  if (likedCats.length === 0) {
  likedGrid.innerHTML = "<p>No cats liked yet 😿</p>";
} else {
  likedGrid.innerHTML = likedCats
    .map((url) => `<img src="${url}" alt="Liked cat" />`)
    .join("");
}
}

document
  .getElementById("close-summary")
  ?.addEventListener("click", () => {
    const overlay = document.getElementById("summary-overlay");
    const actions = document.getElementById("actions");

    if (overlay) overlay.style.display = "none";
    if (actions) actions.style.display = "flex";

    document.body.style.overflow = "";
  });


document
  .getElementById("view-summary")
  ?.addEventListener("click", () => {
    showSummary();
  });

const instructionOverlay = document.getElementById('instruction-overlay');
const closeInstruction = document.getElementById('close-instruction');

closeInstruction?.addEventListener('click', () => {
  if (instructionOverlay) {
    instructionOverlay.style.display = 'none';
  }
});
