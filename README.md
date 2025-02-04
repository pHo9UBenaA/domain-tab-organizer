# Domain Tab Organizer

A Chrome extension that automatically groups tabs by domain, keeping your workspace organized.

## Features

- Automatically group tabs by domain in the current window.
- Keyboard shortcuts for quick actions:
  - Group tabs: Ctrl+Shift+U (or Command+Shift+U on Mac)
  - Delete the active tab group: Ctrl+Shift+E (or Command+Shift+E on Mac)
- Customizable options include:
  - Whether to group pinned tabs
  - Whether to regroup tabs in existing groups
  - Whether to merge subdomains into a single group
  - Specifying exception domains to skip grouping

## Important Information

1. If the keyboard shortcuts do not work as expected, please visit `chrome://extensions/shortcuts` and reassign the keys.
2. You can customize the grouping behavior via the extension's options page.

## Installation

You can install the extension from the [Chrome Web Store]() or load it as an unpacked extension:

1. Clone the repository.
2. Build the extension using the instructions in the **Development** section.
3. Open Chrome and navigate to `chrome://extensions`.
4. Enable Developer Mode.
5. Click "Load unpacked" and select the `dist` folder generated during the build process.

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

This project is licensed under the [MIT License](LICENSE). See the license file for more details.
