# Domain Tab Organizer

A Chrome extension that automatically groups tabs by domain, keeping your
workspace organized.

## Features

- **Automatic Grouping:**
  - Your open tabs are automatically grouped by their website domain.
    This means that tabs from the same site (e.g., google.com) will be kept together in your current window for better organization.

- **Keyboard Shortcuts:**
  - Quickly perform actions using keyboard shortcuts:
    - **Group Tabs:** Press `Ctrl+Shift+U` (or `Command+Shift+U` on Mac) to group all open tabs automatically.
    - **Delete Group:** Press `Ctrl+E` (or `Command+E` on Mac) to delete the currently active tab group.

- **Popup/Options Page:**
  - Access these settings via the extension's Popup or Options page (click the extension icon in Chrome):
    - **Settings:** Configure your extension preferences.
    - **Deleted History:** Review the history of tab groups that have been deleted.
  - Note: While your configuration settings are synchronized across devices, the deleted history is stored only locally on the device.

- **Customizable Options:**
  - Personalize the extension to fit your workflow:
    - **Group Pinned Tabs:** Option to include or exclude pinned tabs from automatic grouping.
    - **Regroup Tabs:** Option to reorganize tabs that are already grouped.
    - **Merge Subdomains:** Option to combine related subdomains (e.g., `mail.example.com` and `www.example.com`) into one group.
    - **Exception Domains:** Specify any websites that should not be grouped automatically.

## Important Information

1. If the keyboard shortcuts do not work as expected, please visit
   `chrome://extensions/shortcuts` and reassign the keys.
2. You can customize the grouping behavior via the extension's options page.

## Installation

You can install the extension from the [Chrome Web Store]() or load it as an
unpacked extension:

1. Clone the repository.
2. Build the extension using the instructions in the **Development** section.
3. Open Chrome and navigate to `chrome://extensions`.
4. Enable Developer Mode.
5. Click "Load unpacked" and select the `dist` folder generated during the build
   process.

## Development

### Prerequisites

- Ensure you have [Deno](https://deno.land/#installation) installed.

### Without Containers

1. Clone the repository and navigate to its root directory.
2. Build the extension:
   ```bash
   deno task build
   ```
   For a production build with minification:
   ```bash
   deno task build:prod
   ```
3. The build output will be located in the `dist` directory.

## License

This project is licensed under the [MIT License](LICENSE). See the license file
for more details.
