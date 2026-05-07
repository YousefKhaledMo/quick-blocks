import {describe, expect, it} from "vitest";
import {
	buildCommandPaletteSuggestions,
	buildCustomCommandSuggestions,
	DEFAULT_COMMAND_SETTINGS,
	getEnabledSlashCommands,
	getSlashCommandById,
	getInsertedCursorOffset,
	getSlashCommandDisplayText,
	getSlashCommandIcon,
	getSlashCommandInsertText,
	getSlashCommandPreviewText,
	getSlashQuery,
	insertSlashCommand,
	isAttachmentPath,
	parseTriggerKeys,
	renderCustomCommandInsertText,
	searchSlashCommands,
	searchMenuSuggestions,
} from "./slashCommands";

describe("slash command definitions", () => {
	it("defines the expected markdown snippets", () => {
		expect(getSlashCommandById("heading-1")?.insertText).toBe("# ");
		expect(getSlashCommandById("heading-2")?.insertText).toBe("## ");
		expect(getSlashCommandById("heading-3")?.insertText).toBe("### ");
		expect(getSlashCommandById("todo")?.insertText).toBe("- [ ] ");
		expect(getSlashCommandById("bullet-list")?.insertText).toBe("- ");
		expect(getSlashCommandById("numbered-list")?.insertText).toBe("1. ");
		expect(getSlashCommandById("code-block")?.insertText).toBe("```\n\n```");
		expect(getSlashCommandById("quote")?.insertText).toBe("> ");
		expect(getSlashCommandById("callout-note")?.insertText).toBe("> [!NOTE]\n> ");
		expect(getSlashCommandById("callout-warning")?.insertText).toBe("> [!WARNING]\n> ");
		expect(getSlashCommandById("table")?.insertText).toBe("| Header | Header |\n| --- | --- |\n| Cell | Cell |");
		expect(getSlashCommandById("divider")?.insertText).toBe("---");
		expect(getSlashCommandById("internal-link")?.insertText).toBe("[[]]");
		expect(getSlashCommandById("external-link")?.insertText).toBe("[]()");
		expect(getSlashCommandById("embed")?.insertText).toBe("![[]]");
		expect(getSlashCommandById("attachment")?.insertText).toBe("![[]]");
		expect(getSlashCommandById("math-block")?.insertText).toBe("$$\n\n$$");
		expect(getSlashCommandInsertText("today", new Date(2026, 4, 7))).toBe("2026-05-07");
		expect(getSlashCommandInsertText("yesterday", new Date(2026, 4, 7))).toBe("2026-05-06");
	});

	it("enables every command by default", () => {
		expect(getEnabledSlashCommands(DEFAULT_COMMAND_SETTINGS).map((command) => command.id)).toEqual([
			"heading-1",
			"heading-2",
			"heading-3",
			"todo",
			"bullet-list",
			"numbered-list",
			"code-block",
			"quote",
			"callout-note",
			"callout-warning",
			"table",
			"divider",
			"internal-link",
			"external-link",
			"embed",
			"attachment",
			"math-block",
			"today",
			"yesterday",
			"tomorrow",
			"current-time",
			"tag",
			"frontmatter",
			"footnote",
			"comment",
			"callout-tip",
			"callout-info",
			"callout-question",
			"callout-success",
			"callout-failure",
			"callout-danger",
			"callout-bug",
			"turn-line-into-todo",
			"turn-line-into-quote",
		]);
	});

	it("filters disabled commands out of search results", () => {
		const settings = {...DEFAULT_COMMAND_SETTINGS, table: false};

		expect(searchSlashCommands("table", settings)).toEqual([]);
	});

	it("matches commands by label and aliases case-insensitively", () => {
		expect(searchSlashCommands("H2", DEFAULT_COMMAND_SETTINGS).map((command) => command.id)).toEqual(["heading-2"]);
		expect(searchSlashCommands("check", DEFAULT_COMMAND_SETTINGS).map((command) => command.id)).toEqual(["todo"]);
		expect(searchSlashCommands("CALLOUT", DEFAULT_COMMAND_SETTINGS).map((command) => command.id)).toEqual([
			"callout-note",
			"callout-warning",
			"callout-tip",
			"callout-info",
			"callout-question",
			"callout-success",
			"callout-failure",
			"callout-danger",
			"callout-bug",
		]);
	});

	it("sorts closest prefix matches above earlier default commands", () => {
		expect(searchSlashCommands("t", DEFAULT_COMMAND_SETTINGS).map((command) => command.id).slice(0, 2)).toEqual([
			"todo",
			"table",
		]);
	});

	it("shows only the command label in suggestion rows", () => {
		expect(getSlashCommandDisplayText("code-block")).toBe("Code block");
	});

	it("defines an icon for each command", () => {
		for (const command of getEnabledSlashCommands(DEFAULT_COMMAND_SETTINGS)) {
			expect(getSlashCommandIcon(command.id).length).toBeGreaterThan(0);
		}
	});
});

describe("slash command insertion", () => {
	it("replaces the slash query with the selected markdown", () => {
		expect(insertSlashCommand("Before /quo after", 7, 11, "quote")).toBe("Before >  after");
	});

	it("uses dynamic markdown when inserting date commands", () => {
		expect(insertSlashCommand("Date: /tod", 6, 10, "today", new Date(2026, 4, 7))).toBe("Date: 2026-05-07");
	});

	it("places the cursor inside paired snippets after insertion", () => {
		expect(getInsertedCursorOffset("code-block")).toBe(4);
		expect(getInsertedCursorOffset("internal-link")).toBe(2);
		expect(getInsertedCursorOffset("external-link")).toBe(1);
		expect(getInsertedCursorOffset("embed")).toBe(3);
		expect(getInsertedCursorOffset("math-block")).toBe(3);
	});

	it("returns the query after the most recent slash when it is on the same line", () => {
		expect(getSlashQuery("hello\n/hea", 10, ["/"])).toEqual({
			from: 6,
			to: 10,
			query: "hea",
		});
	});

	it("does not trigger when the slash is separated from the cursor by whitespace", () => {
		expect(getSlashQuery("/hea now", 8, ["/"])).toBeNull();
	});

	it("supports custom trigger keys", () => {
		expect(getSlashQuery("hello ;;tab", 11, [";;", "/"])).toEqual({
			from: 6,
			to: 11,
			query: "tab",
		});
	});

	it("parses comma separated trigger settings", () => {
		expect(parseTriggerKeys(" /, ;; , + ")).toEqual(["/", ";;", "+"]);
		expect(parseTriggerKeys("")).toEqual(["/"]);
	});

	it("supports line-start trigger behavior", () => {
		expect(getSlashQuery("hello /hea", 10, ["/"], "line-start")).toBeNull();
		expect(getSlashQuery("  /hea", 6, ["/"], "line-start")).toEqual({
			from: 2,
			to: 6,
			query: "hea",
		});
	});

	it("supports after-whitespace trigger behavior", () => {
		expect(getSlashQuery("hello/hea", 9, ["/"], "after-whitespace")).toBeNull();
		expect(getSlashQuery("hello /hea", 10, ["/"], "after-whitespace")).toEqual({
			from: 6,
			to: 10,
			query: "hea",
		});
	});

	it("ignores triggers in simple url-like text", () => {
		expect(getSlashQuery("https://example.com/hea", 23, ["/"])).toBeNull();
	});

	it("renders custom snippet placeholders and cursor offsets", () => {
		expect(renderCustomCommandInsertText("Hello ${cursor}world ${date} ${time}", new Date(2026, 4, 7, 9, 5))).toEqual({
			insertText: "Hello world 2026-05-07 09:05",
			cursorOffset: 6,
		});
	});

	it("builds enabled custom command suggestions", () => {
		expect(buildCustomCommandSuggestions([
			{
				id: "snippet",
				label: "Meeting note",
				aliases: ["meeting"],
				insertText: "## Meeting",
				icon: "calendar",
				enabled: true,
			},
			{
				id: "disabled",
				label: "Disabled",
				aliases: [],
				insertText: "No",
				icon: "square",
				enabled: false,
			},
		])).toEqual([
			{
				type: "custom",
				id: "custom:snippet",
				customCommandId: "snippet",
				label: "Meeting note",
				aliases: ["meeting"],
				insertText: "## Meeting",
				icon: "calendar",
			},
		]);
	});

	it("ranks pinned and frequently used suggestions first", () => {
		expect(searchMenuSuggestions("he", DEFAULT_COMMAND_SETTINGS, [], [], {
			pinnedCommandIds: ["heading-2"],
			commandUsageCounts: {
				"heading-3": 10,
			},
		}).map((suggestion) => suggestion.id).slice(0, 3)).toEqual([
			"heading-2",
			"heading-3",
			"heading-1",
		]);
	});

	it("creates concise preview text for suggestions", () => {
		expect(getSlashCommandPreviewText(getSlashCommandById("callout-note")!)).toBe("Insert > [!NOTE]\\n> ");
		expect(getSlashCommandPreviewText(getSlashCommandById("attachment")!)).toBe("Pick a vault file to embed");
		expect(getSlashCommandPreviewText({
			type: "custom",
			id: "custom:snippet",
			customCommandId: "snippet",
			label: "Snippet",
			aliases: [],
			insertText: "A very long snippet that should be shortened for display in the suggestion menu",
			icon: "sparkles",
		})).toBe("Insert A very long snippet that should be shortened for display...");
	});

	it("treats non-markdown vault files as attachments", () => {
		expect(isAttachmentPath("Images/photo.png")).toBe(true);
		expect(isAttachmentPath("Documents/file.pdf")).toBe(true);
		expect(isAttachmentPath("Notes/example.md")).toBe(false);
		expect(isAttachmentPath("Notes/example.canvas")).toBe(true);
	});
});

describe("command palette suggestions", () => {
	it("builds slash menu options from saved command palette commands", () => {
		expect(buildCommandPaletteSuggestions([
			{
				id: "custom-1",
				commandId: "workspace:open",
				label: "Open command",
				aliases: ["open"],
				enabled: true,
			},
			{
				id: "custom-2",
				commandId: "workspace:close",
				label: "Close command",
				aliases: [],
				enabled: false,
			},
		])).toEqual([
			{
				type: "command-palette",
			id: "custom-1",
			commandId: "workspace:open",
			label: "Open command",
			aliases: ["open", "Open command", "workspace:open"],
			icon: "terminal-square",
		},
	]);
	});
});
