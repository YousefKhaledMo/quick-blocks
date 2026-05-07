# Quick Blocks

Quick Blocks is an Obsidian community plugin that opens a native slash menu when you type `/`. Use it to insert Markdown blocks, callouts, dates, custom snippets, attachments, and Obsidian commands without leaving the editor.

## Features

- Native slash suggestions with icons, previews, favorites, and usage-based ranking
- Configurable trigger keys and trigger behavior
- Built-in Markdown, callout, date, time, property, and transform commands
- Custom snippets with `${cursor}`, `${date}`, and `${time}` placeholders
- Optional Obsidian command palette commands inside the slash menu
- Local-only operation with no network calls or telemetry

## Commands

- Heading 1
- Heading 2
- Heading 3
- Todo
- Bullet list
- Numbered list
- Code block
- Quote
- Callout note
- Callout warning
- Table
- Divider
- Internal link
- External link
- Embed
- Attachment
- Math block
- Today
- Yesterday
- Tomorrow
- Current time
- Tag
- Frontmatter/properties
- Footnote
- Comment
- Callout variants
- Turn line into todo
- Turn line into quote

## Settings

Open the plugin settings to:

- Choose one or more trigger keys, separated by commas
- Choose whether triggers work anywhere, at line start, or after whitespace
- Enable or disable individual slash commands
- Pin favorite commands near the top of the menu
- Create custom snippets with aliases, icons, and placeholders
- Add Obsidian command palette commands to the slash menu
- Add aliases to command palette commands

## Custom snippets

Custom snippets are your own slash menu items. Fill the fields like this:

- **Name shown in the menu**: what you select, for example `Meeting note`
- **Search words, optional**: extra words that find it, for example `meeting, notes`
- **Text to insert**: what gets added to the note, for example `## ${cursor}`
- **Icon name**: an Obsidian/Lucide icon name, for example `sparkles`

Useful placeholders:

- `${cursor}` puts the cursor there after inserting
- `${date}` inserts today's date
- `${time}` inserts the current time

Example snippet:

```text
Name: Meeting note
Search words: meeting, notes
Text to insert:
## ${cursor}
Date: ${date}
Time: ${time}
```

After adding it, type `/meeting` in a note and select **Meeting note**.

## Development

```bash
npm install
npm test
npm run lint
npm run build
```

The production build writes `main.js` at the plugin root for Obsidian to load alongside `manifest.json` and `styles.css`.
