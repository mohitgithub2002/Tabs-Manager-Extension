# Tab Manager Extension Data Flow

## 1. Authentication Flow

When the extension starts:
```
1. background.js checks authentication
2. If not authenticated → Redirect to auth page
3. After auth → Server sends token
4. Token stored in chrome.storage.local
5. Redirect to sessions.html
```

## 2. Creating a New Collection

Example flow when user creates "Work Tabs":
```
User Action: Click "New Collection" → Enter "Work Tabs" → Click Save

Flow:
1. UI (sessions.js/popup.js):
   - Capture input value
   - Call createCollection({id: Date.now(), name: "Work Tabs", sessions: []})

2. API Layer (api.js):
   - First update local cache:
     cache.collections.add({
       id: "1234567890",
       name: "Work Tabs",
       sessions: [],
       lastUpdated: Date.now()
     })
   - Then send to server
   - On success, collection is now in both cache and server

3. Cache (cache.js):
   - Stores in IndexedDB
   - Collection immediately available for rendering

4. UI Update:
   - renderCollectionsList() reads from cache
   - New collection appears instantly
```

## 3. Saving a Tab/Session

Example flow when saving current tab to "Work Tabs":
```
User Action: Click "Save Tab" on "Work Tabs" collection

Flow:
1. Popup (popup.js):
   - Get current tab info using chrome.tabs.query
   - Create session object:
     {
       isSingleTab: true,
       timestamp: "2023-XX-XX...",
       tabs: [{
         url: "https://example.com",
         title: "Example",
         favicon: "favicon_url"
       }]
     }

2. API Layer:
   - First update cache:
     cache.addSession(collectionId, session)
   - Then send to server
   - Queues sync operation if offline

3. Cache:
   - Updates sessions array in IndexedDB
   - Updates collection's lastUpdated timestamp

4. Background Sync:
   - Debounced syncToServer function runs after 5 seconds
   - Processes any queued changes
```

## 4. Rendering Collections and Sessions

Flow for displaying data:
```
1. Initial Load:
   cache.getCollections()
   ↓
   If cache empty:
     fetch from server
     populate cache
   ↓
   render from cache data

2. Subsequent Loads:
   - Always read from cache first
   - Background refresh if needed
   - Instant UI updates

Example Timeline:
t+0ms: User opens sessions page
t+1ms: Start reading from cache
t+2ms: UI renders with cached data
t+100ms: Background refresh starts
t+300ms: Fresh data updates cache if changed
```

## 5. Hard Refresh Flow

When user clicks refresh button:
```
1. UI Action:
   - Add spinning animation to refresh button
   - Clear existing cache
   
2. Data Fetch:
   - Fetch fresh data from server
   - Rebuild entire cache
   
3. UI Update:
   - Re-render collections
   - Re-render active collection's sessions
   - Remove spinning animation
```

## 6. Error Handling & Offline Support

```
1. Network Error:
   - Continue serving from cache
   - Queue changes in syncQueue table
   - Show sync status indicator
   
2. Cache Miss:
   - Fallback to server request
   - Show loading state
   - Handle error gracefully with user feedback

3. Background Sync:
   - Attempts sync every 30 seconds
   - Processes queued changes in order
   - Handles conflicts with server timestamp checks
```

## 7. Performance Considerations

Cache Strategy:
```
- Read-first from IndexedDB
- Write-first to IndexedDB
- Background sync to server
- Periodic cache cleanup
- Cache invalidation on version changes
```

This design ensures:
- Instant UI feedback
- Offline functionality
- Data consistency
- Smooth user experience
