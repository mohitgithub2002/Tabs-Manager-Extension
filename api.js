import { cache } from './services/cache.js';

const API_BASE_URL = 'https://tabs.revenuelogy.com/api';

// Helper to get user ID from storage
async function getUserId() {
  const data = await chrome.storage.local.get('data');
  return data?.data?.['user-id'];
}

// Fetch all collections
async function fetchCollections() {
  // Try cache first
  try {
    const cachedCollections = await cache.getCollections();
    if (cachedCollections.length > 0) {
      return { data: cachedCollections };
    }
  } catch (error) {
    console.warn('Cache read failed:', error);
  }

  // If cache empty or failed, fetch from server
  const userId = await getUserId();
  const response = await fetch(`${API_BASE_URL}/collections`, {
    headers: { 'user-id': userId }
  });
  
  if (!response.ok) throw new Error('Failed to fetch collections');
  
  const data = await response.json();
  
  // Update cache
  try {
    await cache.initializeCache(data.data);
  } catch (error) {
    console.warn('Cache update failed:', error);
  }
  
  return data;
}

// Get single collection
async function fetchCollection(collectionId) {
  // Try cache first
  try {
    const cachedCollection = await cache.getCollection(collectionId);
    if (cachedCollection) {
      return { data: cachedCollection };
    }
  } catch (error) {
    console.warn('Cache read failed:', error);
  }

  // Fallback to server
  const userId = await getUserId();
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
    headers: { 'user-id': userId }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch collection');
  }
  
  return response.json();
}

// Add session to collection
async function addSessionToCollection(collectionId, session) {
  // Update cache first for immediate UI update
  try {
    await cache.addSession(collectionId, session);
  } catch (error) {
    console.warn('Cache update failed:', error);
  }

  // Then update server
  const userId = await getUserId();
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
    method: 'POST',
    headers: {
      'user-id': userId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(session)
  });
  
  if (!response.ok) {
    throw new Error('Failed to add session');
  }
  
  return response.json();
}

// Delete session from collection
async function deleteSession(collectionId, timestamp) {
  // Update cache first
  try {
    await cache.deleteSession(collectionId, timestamp);
  } catch (error) {
    console.warn('Cache update failed:', error);
  }

  // Then update server
  const userId = await getUserId();
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/sessions/delete`, {
    method: 'POST',
    headers: {
      'user-id': userId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ timestamp })
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete session');
  }

  return response.json();
}

// Modify collection (rename/delete)
async function modifyCollection(collectionId, action, newName = null) {
  const userId = await getUserId();
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/edit`, {
    method: 'POST',
    headers: {
      'user-id': userId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action,
      newName
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to ${action} collection`);
  }
  
  return response.json();
}

// Create new collection
async function createCollection(collectionData) {
  // Update cache first
  try {
    await cache.collections.add({
      ...collectionData,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.warn('Cache update failed:', error);
  }

  // Then update server
  const userId = await getUserId();
  const response = await fetch(`${API_BASE_URL}/collections/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...collectionData,
      userId
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create collection');
  }
  
  return response.json();
}

export {
  fetchCollections,
  fetchCollection,
  addSessionToCollection,
  deleteSession,
  modifyCollection,
  createCollection
};
