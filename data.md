# Data Structure Documentation

## Chrome Storage Schema

### Authentication Data

## Storage Overview

The extension uses Chrome's local storage (`chrome.storage.local`) to persist data. Here are the main data structures:

### Username
```javascript
{
  "username": string  // User's display name
}
```

### Sessions
```javascript
{
  "sessions": [
    {
      timestamp: string,      // e.g., "12/25/2023, 3:45 PM"
      tabs: [
        {
          url: string,       // Full URL of the tab
          title: string      // Tab title
        }
      ],
      isSingleTab?: boolean  // Optional flag for single-tab saves
    }
  ]
}
```

### Collections
```javascript
{
  "collections": [
    {
      id: string,           // Unique identifier (timestamp)
      name: string,         // Collection name
      sessions: [           // Array of sessions in this collection
        {
          timestamp: string,
          tabs: [
            {
              url: string,
              title: string
            }
          ],
          isSingleTab?: boolean
        }
      ]
    }
  ]
}
```

## Example Data

Here's a complete example of how the data might look in storage:

```javascript
{
  "username": "John Doe",
  
  "sessions": [
    {
      "timestamp": "12/25/2023, 3:45 PM",
      "tabs": [
        {
          "url": "https://example.com",
          "title": "Example Website"
        },
        {
          "url": "https://google.com",
          "title": "Google"
        }
      ]
    }
  ],
  
  "collections": [
    {
      "id": "1703521234567",
      "name": "Work",
      "sessions": [
        {
          "timestamp": "12/25/2023, 4:00 PM",
          "tabs": [
            {
              "url": "https://github.com",
              "title": "GitHub"
            }
          ],
          "isSingleTab": true
        }
      ]
    },
    {
      "id": "1703521234568",
      "name": "Research",
      "sessions": []
    }
  ]
}
```

## Storage Limits

- Chrome's local storage has a limit of 5MB
- Each saved session consists of minimal data (URLs and titles)
- Collections are lightweight containers
- Consider implementing cleanup functionality for old sessions if needed

## Data Operations

The extension performs these main operations on the data:

1. **Read Operations**
   - Load user profile
   - Fetch sessions
   - Get collection list
   - Get sessions within collections

2. **Write Operations**
   - Save new sessions
   - Update username
   - Create collections
   - Add sessions to collections

3. **Update Operations**
   - Modify collection names
   - Add sessions to collections
   - Update user preferences

4. **Delete Operations**
   - Remove sessions
   - Delete collections
   - Clear history (not implemented)

## Data Persistence

- All data is automatically persisted by Chrome's storage API
- Data survives browser restarts
- Data syncs across devices if using `chrome.storage.sync` (future feature)

## API Endpoints Overview

The extension interacts with a backend server at `http://localhost:3000/api` with the following endpoints:

### Collections Endpoints
