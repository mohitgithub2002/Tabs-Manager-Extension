# Revenuelogy Tab Manager

A powerful Chrome extension for managing browser tabs and sessions. This extension helps teams organize, save, and restore browser tabs efficiently.

## Features

- **Quick Save Actions**:
  - Save individual tabs
  - Save entire window sessions
  - Auto-close tabs after saving sessions
- **Collections**:
  - Create custom collections
  - Organize tabs by project or theme
  - Easy switching between collections
- **Session Management**:
  - View session history with timestamps
  - Restore entire sessions with one click
  - Delete individual sessions
- **User Experience**:
  - Clean, modern interface
  - Customizable display name
  - Quick access popup
  - Detailed sessions view

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the project directory

## Usage

### Popup Interface

- Click the extension icon to access quick actions:
  - Save current tab
  - Save all tabs in current window
  - Create new collections
  - Access saved sessions
  - Group tabs

### Sessions Page

- View all saved sessions and collections
- Each session displays:
  - Timestamp
  - List of saved tabs
  - Restore button
- Click on any tab card to open that URL
- Use collections in the sidebar to organize your sessions

### Collections

- Create custom collections for different purposes
- Save tabs and sessions directly to specific collections
- Switch between collections in the sidebar
- Default collection always available for quick access

## Project Structure

```
v1/
├── popup.html      # Extension popup interface
├── popup.js        # Popup functionality
├── popup.css       # Popup styles
├── sessions.html   # Sessions view page
├── sessions.js     # Sessions management
└── sessions.css    # Sessions page styles
```

## Storage

The extension uses Chrome's local storage to save:
- User preferences
- Saved sessions
- Collections data
- Tab information

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
