import {
  fetchCollections,
  fetchCollection,
  deleteSession,
  createCollection
} from './api.js';

async function renderSessions(sessions, collectionId) {
  const sessionsList = document.getElementById("sessionsList");
  sessionsList.innerHTML = "";

  if (!sessions || sessions.length === 0) {
    sessionsList.innerHTML = '<div class="empty-state">No saved sessions.</div>';
    return;
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  sortedSessions.forEach((session) => {
    const sessionGroup = document.createElement("div");
    sessionGroup.className = "session-group";
    
    sessionGroup.innerHTML = `
      <div class="session-header">
        <div class="session-date">${session.timestamp || "Unknown Date"}</div>
        <div class="session-actions">
          <button class="restore-btn">Restore</button>
          <button class="delete-btn" title="Delete Session">✕</button>
        </div>
      </div>
      <div class="tabs-container">
        ${session.tabs.map(tab => `
          <div class="tab-card" title="${tab.url}">
            <div class="tab-favicon">${tab.favicon ? 
              `<img src="${tab.favicon}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><text y=\\'.9em\\' font-size=\\'90\\'>🌐</text></svg>';">` : 
              '🌐'}</div>
            <div class="tab-title">${tab.title || "Untitled"}</div>
            <div class="tab-link">${tryGetHostname(tab.url)}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Add event listeners
    sessionGroup.querySelector(".restore-btn").addEventListener("click", () => {
      session.tabs.forEach(tab => chrome.tabs.create({ url: tab.url }));
    });

    sessionGroup.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this session?")) {
        try {
          await deleteSession(collectionId, session.timestamp);
          const collection = await fetchCollection(collectionId);
          renderSessions(collection.data.sessions, collectionId);
        } catch (error) {
          console.error('Failed to delete session:', error);
          alert('Failed to delete session. Please try again.');
        }
      }
    });

    sessionGroup.querySelectorAll(".tab-card").forEach((card, index) => {
      card.addEventListener("click", () => {
        chrome.tabs.create({ url: session.tabs[index].url });
      });
    });

    sessionsList.appendChild(sessionGroup);
  });
}

function tryGetHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

async function renderCollectionsList() {
  try {
    const { data: collections } = await fetchCollections();
    const sidebarCollections = document.getElementById("sidebarCollections");
    sidebarCollections.innerHTML = "";
    
    // Sort collections based on their ID (timestamp)
    const sortedCollections = [...collections].sort((b, a) => {
      return parseInt(b.id) - parseInt(a.id);
    });
    
    sortedCollections.forEach(collection => {
      const div = document.createElement("div");
      div.className = "collection-item";
      div.textContent = collection.name;
      div.dataset.id = collection.id;
      
      div.addEventListener("click", async () => {
        document.querySelectorAll(".collection-item").forEach(item => {
          item.classList.remove("active");
        });
        div.classList.add("active");
        const collectionData = await fetchCollection(collection.id);
        renderSessions(collectionData.data.sessions, collection.id);
      });
      
      sidebarCollections.appendChild(div);
    });

    // Activate first collection
    const firstCollection = document.querySelector(".collection-item");
    if (firstCollection) firstCollection.click();
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    alert('Failed to load collections. Please try again.');
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication
  const data = await chrome.storage.local.get(['data', 'name']);
  if (!data?.data || Object.keys(data.data).length === 0) {
    window.location.href = 'https://tabs.revenuelogy.com/auth/signin';
    return;
  }

  // Set display name from storage
  const displayName = document.getElementById("displayName");
  displayName.textContent = data.data.name || "Guest";

  // Handle name editing
  const editNameBtn = document.getElementById("editNameBtn");
  const nameEditContainer = document.getElementById("nameEditContainer");
  const nameInput = document.getElementById("nameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");

  editNameBtn.addEventListener("click", () => {
    nameEditContainer.classList.remove("hidden");
    nameInput.value = displayName.textContent;
    nameInput.focus();
  });

  saveNameBtn.addEventListener("click", async () => {
    const newName = nameInput.value.trim();
    if (newName) {
      await chrome.storage.local.set({ name: newName });
      displayName.textContent = newName;
      nameEditContainer.classList.add("hidden");
    }
  });

  // Initialize collections list
  await renderCollectionsList();

  // Handle new collection creation
  const newCollectionBtn = document.getElementById("newCollectionBtn");
  const newCollectionForm = document.getElementById("newCollectionForm");
  const newCollectionInput = document.getElementById("newCollectionInput");
  const saveCollectionBtn = document.getElementById("saveCollectionBtn");
  const cancelCollectionBtn = document.getElementById("cancelCollectionBtn");

  newCollectionBtn.addEventListener("click", () => {
    newCollectionForm.classList.remove("hidden");
    newCollectionInput.focus();
  });

  saveCollectionBtn.addEventListener("click", async () => {
    const name = newCollectionInput.value.trim();
    if (!name) return;

    try {
      await createCollection({
        id: Date.now().toString(),
        name,
        sessions: []
      });
      await renderCollectionsList();
      newCollectionForm.classList.add("hidden");
      newCollectionInput.value = "";
    } catch (error) {
      console.error('Failed to create collection:', error);
      alert('Failed to create collection. Please try again.');
    }
  });

  cancelCollectionBtn.addEventListener("click", () => {
    newCollectionForm.classList.add("hidden");
    newCollectionInput.value = "";
  });
});
