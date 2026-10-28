document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.talent-card[data-talent-id]'));
  if (cards.length === 0) return;

  const objectUrls = new Map();
  const maxPhotoSize = 8 * 1024 * 1024;
  let database;

  cards.forEach((card) => {
    card.querySelector('.talent-photo-input').disabled = true;
    setStatus(card, 'Loading photo storage…');
  });

  function openPhotoDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('birthdayTalentPhotos', 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('photos', { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open photo storage.'));
    });
  }

  function runTransaction(mode, action) {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('photos', mode);
      let result;
      let request;

      try {
        request = action(transaction.objectStore('photos'));
      } catch (error) {
        reject(error);
        return;
      }

      if (request) {
        request.onsuccess = () => {
          result = request.result;
        };
        request.onerror = () => reject(request.error || new Error('Could not access saved photos.'));
      }

      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error || new Error('Photo storage failed.'));
      transaction.onabort = () => reject(transaction.error || new Error('Photo storage was interrupted.'));
    });
  }

  function showPhoto(card, blob) {
    const id = card.dataset.talentId;
    const previousUrl = objectUrls.get(id);
    if (previousUrl) URL.revokeObjectURL(previousUrl);

    const url = URL.createObjectURL(blob);
    objectUrls.set(id, url);
    const image = card.querySelector('.talent-photo-image');
    image.src = url;
    image.hidden = false;
    card.querySelector('.talent-icon').hidden = true;
    card.querySelector('.talent-photo-remove').hidden = false;
  }

  function clearPhoto(card) {
    const id = card.dataset.talentId;
    const url = objectUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    objectUrls.delete(id);

    const image = card.querySelector('.talent-photo-image');
    image.removeAttribute('src');
    image.hidden = true;
    card.querySelector('.talent-icon').hidden = false;
    card.querySelector('.talent-photo-remove').hidden = true;
  }

  function setStatus(card, message) {
    card.querySelector('.talent-photo-status').textContent = message;
  }

  async function loadSavedPhotos() {
    database = await openPhotoDatabase();
    const savedPhotos = await runTransaction('readonly', (store) => store.getAll());
    const cardsById = new Map(cards.map((card) => [card.dataset.talentId, card]));

    savedPhotos.forEach((photo) => {
      const card = cardsById.get(photo.id);
      if (card && photo.blob instanceof Blob) showPhoto(card, photo.blob);
    });
    cards.forEach((card) => {
      card.querySelector('.talent-photo-input').disabled = false;
      setStatus(card, '');
    });
  }

  cards.forEach((card) => {
    const input = card.querySelector('.talent-photo-input');
    const removeButton = card.querySelector('.talent-photo-remove');

    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setStatus(card, 'Please choose an image file.');
        input.value = '';
        return;
      }

      if (file.size > maxPhotoSize) {
        setStatus(card, 'Choose an image smaller than 8 MB.');
        input.value = '';
        return;
      }

      setStatus(card, 'Saving photo…');
      try {
        await runTransaction('readwrite', (store) => store.put({
          id: card.dataset.talentId,
          blob: file
        }));
        showPhoto(card, file);
        setStatus(card, 'Photo saved in this browser.');
      } catch (error) {
        setStatus(card, 'Could not save this photo. Try a smaller image or another browser.');
        console.error('Could not save talent photo:', error);
      }
      input.value = '';
    });

    removeButton.addEventListener('click', async () => {
      setStatus(card, 'Removing photo…');
      try {
        await runTransaction('readwrite', (store) => store.delete(card.dataset.talentId));
        clearPhoto(card);
        setStatus(card, 'Photo removed.');
      } catch (error) {
        setStatus(card, 'Could not remove this photo. Please try again.');
        console.error('Could not remove talent photo:', error);
      }
    });
  });

  loadSavedPhotos().catch((error) => {
    cards.forEach((card) => setStatus(card, 'Photo storage is unavailable in this browser.'));
    cards.forEach((card) => {
      card.querySelector('.talent-photo-input').disabled = true;
    });
    console.error('Could not load talent photos:', error);
  });

  window.addEventListener('pagehide', () => {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
  });
});
