import {
  addSessionToCollection,
  createCollection,
  fetchCollections
} from './api.js';

async function renderCollections() {
  try {
    const collectionsList = document.getElementById("collectionsList");
    collectionsList.innerHTML = '<div class="loading">Loading collections...</div>';
    
    const response = await fetchCollections();
    const collections = response.data || [];
    
    collectionsList.innerHTML = '';
    
    if (collections.length === 0) {
      collectionsList.innerHTML = '<div class="empty-state">No collections yet</div>';
      return;
    }
    
    collections.forEach(collection => {
      const div = createCollectionItem(collection);
      collectionsList.appendChild(div);
    });
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    const collectionsList = document.getElementById("collectionsList");
    collectionsList.innerHTML = '<div class="error">Failed to load collections</div>';
  }
}

function createCollectionItem(collection) {
  const div = document.createElement("div");
  div.className = "collection-item";
  div.innerHTML = `
    <span>${collection.name}</span>
    <div class="actions">
      <button class="save-tab-btn" title="Save Tab">💾</button>
      <button class="save-session-btn" title="Save Session">📚</button>
    </div>
  `;
  
  div.querySelector(".save-tab-btn").addEventListener("click", () => {
    saveTabToCollection(collection.id);
  });
  
  div.querySelector(".save-session-btn").addEventListener("click", () => {
    saveSessionToCollection(collection.id);
  });
  
  return div;
}

async function saveTabToCollection(collectionId) {
  try {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const session = {
      isSingleTab: true,
      tabs: [{
        url: currentTab.url,
        title: currentTab.title,
        favicon: currentTab.favIconUrl || null
      }],
      timestamp: new Date().toISOString()
    };
    
    await addSessionToCollection(collectionId, session);
    alert('Tab saved successfully!');
  } catch (error) {
    console.error('Failed to save tab:', error);
    alert('Failed to save tab. Please try again.');
  }
}

async function saveSessionToCollection(collectionId) {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const session = {
      isSingleTab: false,
      tabs: tabs.map(tab => ({
        url: tab.url,
        title: tab.title,
        favicon: tab.favIconUrl || null
      })),
      timestamp: new Date().toISOString()
    };
    
    await addSessionToCollection(collectionId, session);
    alert('Session saved successfully!');
    
    // Close tabs after successful save
    tabs.forEach(tab => {
      chrome.tabs.remove(tab.id);
    });
  } catch (error) {
    console.error('Failed to save session:', error);
    alert('Failed to save session. Please try again.');
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication first
  const data = await chrome.storage.local.get(['data', 'name']);
  if (!data?.data || Object.keys(data.data).length === 0) {
    window.location.href = 'http://localhost:3000/auth/signin';
    return;
  }

  // Set username if it exists
  const username = data.name;
  if (username && document.getElementById("username")) {
    document.getElementById("username").textContent = username;
  }

  // Initialize collections
  await renderCollections();

  // New collection form handlers
  const newCollectionBtn = document.getElementById("newCollectionBtn");
  const newCollectionForm = document.getElementById("newCollectionForm");
  const newCollectionInput = document.getElementById("newCollectionInput");
  const saveCollectionBtn = document.getElementById("saveCollectionBtn");
  const cancelCollectionBtn = document.getElementById("cancelCollectionBtn");

  newCollectionBtn.addEventListener("click", () => {
    newCollectionForm.classList.remove("hidden");
    newCollectionInput.focus();
  });

  async function handleCreateCollection() {
    const name = newCollectionInput.value.trim();
    if (!name) return;

    try {
      saveCollectionBtn.disabled = true;
      saveCollectionBtn.textContent = 'Creating...';
      
      await createCollection({
        id: Date.now().toString(),
        name,
        sessions: []
      });
      
      await renderCollections();
      newCollectionForm.classList.add("hidden");
      newCollectionInput.value = "";
    } catch (error) {
      console.error('Failed to create collection:', error);
      alert('Failed to create collection. Please try again.');
    } finally {
      saveCollectionBtn.disabled = false;
      saveCollectionBtn.textContent = 'Save';
    }
  }

  saveCollectionBtn.addEventListener("click", handleCreateCollection);

  newCollectionInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleCreateCollection();
    }
  });

  cancelCollectionBtn.addEventListener("click", () => {
    newCollectionForm.classList.add("hidden");
    newCollectionInput.value = "";
  });

  // Collections button handler
  document.getElementById("openCollectionsBtn").addEventListener("click", () => {
    window.open("sessions.html");
  });
});
