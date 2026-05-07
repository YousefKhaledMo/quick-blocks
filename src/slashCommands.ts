export type SlashCommandId =
	| "heading-1"
	| "heading-2"
	| "heading-3"
	| "todo"
	| "bullet-list"
	| "numbered-list"
	| "code-block"
	| "quote"
	| "callout-note"
	| "callout-warning"
	| "table"
	| "divider"
	| "internal-link"
	| "external-link"
	| "embed"
	| "attachment"
	| "math-block"
	| "today"
	| "yesterday"
	| "tomorrow"
	| "current-time"
	| "tag"
	| "frontmatter"
	| "footnote"
	| "comment"
	| "callout-tip"
	| "callout-info"
	| "callout-question"
	| "callout-success"
	| "callout-failure"
	| "callout-danger"
	| "callout-bug"
	| "turn-line-into-todo"
	| "turn-line-into-quote";

export type SlashCommandSettings = Record<SlashCommandId, boolean>;
export type TriggerBehavior = "anywhere" | "line-start" | "after-whitespace";

export interface SlashCommand {
	type: "markdown";
	id: SlashCommandId;
	label: string;
	aliases: string[];
	insertText: string;
	icon: string;
	cursorOffset?: number;
	getInsertText?: (referenceDate: Date) => string;
	action?: "turn-line-into-todo" | "turn-line-into-quote" | "pick-attachment";
}

export interface CommandPaletteSlashCommandSetting {
	id: string;
	commandId: string;
	label: string;
	aliases: string[];
	enabled: boolean;
}

export interface CommandPaletteSlashCommand {
	type: "command-palette";
	id: string;
	commandId: string;
	label: string;
	aliases: string[];
	icon: string;
}

export interface CustomSlashCommandSetting {
	id: string;
	label: string;
	aliases: string[];
	insertText: string;
	icon: string;
	enabled: boolean;
}

export interface CustomSlashCommand {
	type: "custom";
	id: string;
	customCommandId: string;
	label: string;
	aliases: string[];
	insertText: string;
	icon: string;
}

export interface SuggestionRankingOptions {
	pinnedCommandIds?: string[];
	commandUsageCounts?: Record<string, number>;
}

export type SlashMenuSuggestion = SlashCommand | CommandPaletteSlashCommand | CustomSlashCommand;

export interface SlashQuery {
	from: number;
	to: number;
	query: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
	{
		type: "markdown",
		id: "heading-1",
		label: "Heading 1",
		aliases: ["h1", "title"],
		insertText: "# ",
		icon: "heading-1",
	},
	{
		type: "markdown",
		id: "heading-2",
		label: "Heading 2",
		aliases: ["h2", "subtitle"],
		insertText: "## ",
		icon: "heading-2",
	},
	{
		type: "markdown",
		id: "heading-3",
		label: "Heading 3",
		aliases: ["h3"],
		insertText: "### ",
		icon: "heading-3",
	},
	{
		type: "markdown",
		id: "todo",
		label: "Todo",
		aliases: ["todo", "task", "check", "checkbox"],
		insertText: "- [ ] ",
		icon: "check-square",
	},
	{
		type: "markdown",
		id: "bullet-list",
		label: "Bullet list",
		aliases: ["bullet", "unordered", "list"],
		insertText: "- ",
		icon: "list",
	},
	{
		type: "markdown",
		id: "numbered-list",
		label: "Numbered list",
		aliases: ["number", "ordered", "list"],
		insertText: "1. ",
		icon: "list-ordered",
	},
	{
		type: "markdown",
		id: "code-block",
		label: "Code block",
		aliases: ["code", "fence", "pre"],
		insertText: "```\n\n```",
		icon: "code",
		cursorOffset: 4,
	},
	{
		type: "markdown",
		id: "quote",
		label: "Quote",
		aliases: ["quote", "blockquote"],
		insertText: "> ",
		icon: "quote",
	},
	{
		type: "markdown",
		id: "callout-note",
		label: "Callout note",
		aliases: ["callout", "note", "admonition"],
		insertText: "> [!NOTE]\n> ",
		icon: "notebook",
	},
	{
		type: "markdown",
		id: "callout-warning",
		label: "Callout warning",
		aliases: ["callout", "warning", "warn", "admonition"],
		insertText: "> [!WARNING]\n> ",
		icon: "alert-triangle",
	},
	{
		type: "markdown",
		id: "table",
		label: "Table",
		aliases: ["grid"],
		insertText: "| Header | Header |\n| --- | --- |\n| Cell | Cell |",
		icon: "table",
	},
	{
		type: "markdown",
		id: "divider",
		label: "Divider",
		aliases: ["hr", "rule", "separator"],
		insertText: "---",
		icon: "minus",
	},
	{
		type: "markdown",
		id: "internal-link",
		label: "Internal link",
		aliases: ["link", "wikilink"],
		insertText: "[[]]",
		icon: "link",
		cursorOffset: 2,
	},
	{
		type: "markdown",
		id: "external-link",
		label: "External link",
		aliases: ["external", "url", "link", "markdown link"],
		insertText: "[]()",
		icon: "external-link",
		cursorOffset: 1,
	},
	{
		type: "markdown",
		id: "embed",
		label: "Embed",
		aliases: ["embed", "transclude"],
		insertText: "![[]]",
		icon: "file-input",
		cursorOffset: 3,
	},
	{
		type: "markdown",
		id: "attachment",
		label: "Attachment",
		aliases: ["attachment", "file", "upload", "image", "pdf"],
		insertText: "![[]]",
		icon: "paperclip",
		action: "pick-attachment",
	},
	{
		type: "markdown",
		id: "math-block",
		label: "Math block",
		aliases: ["math", "latex", "equation"],
		insertText: "$$\n\n$$",
		icon: "sigma",
		cursorOffset: 3,
	},
	{
		type: "markdown",
		id: "today",
		label: "Today",
		aliases: ["date", "today"],
		insertText: "",
		icon: "calendar-days",
		getInsertText: (referenceDate: Date) => formatDate(referenceDate),
	},
	{
		type: "markdown",
		id: "yesterday",
		label: "Yesterday",
		aliases: ["date", "yesterday"],
		insertText: "",
		icon: "calendar-minus",
		getInsertText: (referenceDate: Date) => {
			const yesterday = new Date(referenceDate);
			yesterday.setDate(referenceDate.getDate() - 1);
			return formatDate(yesterday);
		},
	},
	{
		type: "markdown",
		id: "tomorrow",
		label: "Tomorrow",
		aliases: ["date", "tomorrow"],
		insertText: "",
		icon: "calendar-plus",
		getInsertText: (referenceDate: Date) => {
			const tomorrow = new Date(referenceDate);
			tomorrow.setDate(referenceDate.getDate() + 1);
			return formatDate(tomorrow);
		},
	},
	{
		type: "markdown",
		id: "current-time",
		label: "Current time",
		aliases: ["time", "now"],
		insertText: "",
		icon: "clock",
		getInsertText: (referenceDate: Date) => formatTime(referenceDate),
	},
	{
		type: "markdown",
		id: "tag",
		label: "Tag",
		aliases: ["hashtag"],
		insertText: "#",
		icon: "hash",
	},
	{
		type: "markdown",
		id: "frontmatter",
		label: "Frontmatter",
		aliases: ["properties", "yaml"],
		insertText: "---\n\n---",
		icon: "panel-top",
		cursorOffset: 4,
	},
	{
		type: "markdown",
		id: "footnote",
		label: "Footnote",
		aliases: ["reference", "citation"],
		insertText: "[^1]\n\n[^1]: ",
		icon: "pilcrow",
		cursorOffset: 10,
	},
	{
		type: "markdown",
		id: "comment",
		label: "Comment",
		aliases: ["html comment", "note"],
		insertText: "%%  %%",
		icon: "message-square",
		cursorOffset: 3,
	},
	{
		type: "markdown",
		id: "callout-tip",
		label: "Callout tip",
		aliases: ["callout", "tip"],
		insertText: "> [!TIP]\n> ",
		icon: "lightbulb",
	},
	{
		type: "markdown",
		id: "callout-info",
		label: "Callout info",
		aliases: ["callout", "info"],
		insertText: "> [!INFO]\n> ",
		icon: "info",
	},
	{
		type: "markdown",
		id: "callout-question",
		label: "Callout question",
		aliases: ["callout", "question", "faq"],
		insertText: "> [!QUESTION]\n> ",
		icon: "circle-help",
	},
	{
		type: "markdown",
		id: "callout-success",
		label: "Callout success",
		aliases: ["callout", "success"],
		insertText: "> [!SUCCESS]\n> ",
		icon: "check-circle",
	},
	{
		type: "markdown",
		id: "callout-failure",
		label: "Callout failure",
		aliases: ["callout", "failure", "fail"],
		insertText: "> [!FAILURE]\n> ",
		icon: "x-circle",
	},
	{
		type: "markdown",
		id: "callout-danger",
		label: "Callout danger",
		aliases: ["callout", "danger", "error"],
		insertText: "> [!DANGER]\n> ",
		icon: "octagon-alert",
	},
	{
		type: "markdown",
		id: "callout-bug",
		label: "Callout bug",
		aliases: ["callout", "bug"],
		insertText: "> [!BUG]\n> ",
		icon: "bug",
	},
	{
		type: "markdown",
		id: "turn-line-into-todo",
		label: "Turn line into todo",
		aliases: ["transform", "task", "line"],
		insertText: "- [ ] ",
		icon: "list-checks",
		action: "turn-line-into-todo",
	},
	{
		type: "markdown",
		id: "turn-line-into-quote",
		label: "Turn line into quote",
		aliases: ["transform", "quote", "line"],
		insertText: "> ",
		icon: "quote",
		action: "turn-line-into-quote",
	},
];

export const DEFAULT_COMMAND_SETTINGS = SLASH_COMMANDS.reduce((settings, command) => {
	settings[command.id] = true;
	return settings;
}, {} as SlashCommandSettings);

export function getSlashCommandById(id: SlashCommandId): SlashCommand | undefined {
	return SLASH_COMMANDS.find((command) => command.id === id);
}

export function getEnabledSlashCommands(settings: SlashCommandSettings): SlashCommand[] {
	return SLASH_COMMANDS.filter((command) => settings[command.id]);
}

export function searchSlashCommands(query: string, settings: SlashCommandSettings): SlashCommand[] {
	const normalizedQuery = query.trim().toLowerCase();

	const enabledCommands = getEnabledSlashCommands(settings);
	if (normalizedQuery.length === 0) {
		return enabledCommands;
	}

	return enabledCommands.filter((command) => {
		if (normalizedQuery.length === 0) {
			return true;
		}

		const searchableTerms = [command.label, command.id, ...command.aliases];
		return searchableTerms.some((term) => term.toLowerCase().includes(normalizedQuery));
	}).sort((first, second) => getMatchScore(first, normalizedQuery) - getMatchScore(second, normalizedQuery));
}

export function buildCommandPaletteSuggestions(settings: CommandPaletteSlashCommandSetting[]): CommandPaletteSlashCommand[] {
	return settings
		.filter((command) => command.enabled)
		.map((command) => ({
			type: "command-palette",
			id: command.id,
			commandId: command.commandId,
			label: command.label,
			aliases: [...command.aliases, command.label, command.commandId],
			icon: "terminal-square",
		}));
}

export function buildCustomCommandSuggestions(settings: CustomSlashCommandSetting[]): CustomSlashCommand[] {
	return settings
		.filter((command) => command.enabled)
		.map((command) => ({
			type: "custom",
			id: `custom:${command.id}`,
			customCommandId: command.id,
			label: command.label,
			aliases: command.aliases,
			insertText: command.insertText,
			icon: command.icon,
		}));
}

export function searchMenuSuggestions(
	query: string,
	settings: SlashCommandSettings,
	commandPaletteCommands: CommandPaletteSlashCommandSetting[],
	customCommands: CustomSlashCommandSetting[] = [],
	rankingOptions: SuggestionRankingOptions = {},
): SlashMenuSuggestion[] {
	const normalizedQuery = query.trim().toLowerCase();
	const suggestions: SlashMenuSuggestion[] = [
		...getEnabledSlashCommands(settings),
		...buildCommandPaletteSuggestions(commandPaletteCommands),
		...buildCustomCommandSuggestions(customCommands),
	];

	if (normalizedQuery.length === 0) {
		return sortSuggestions(suggestions, normalizedQuery, rankingOptions);
	}

	return suggestions
		.filter((suggestion) => {
			const searchableTerms = [suggestion.label, suggestion.id, ...suggestion.aliases];
			return searchableTerms.some((term) => term.toLowerCase().includes(normalizedQuery));
		})
		.sort((first, second) => compareSuggestions(first, second, normalizedQuery, rankingOptions));
}

export function insertSlashCommand(text: string, from: number, to: number, commandId: SlashCommandId, referenceDate = new Date()): string {
	const command = getSlashCommandById(commandId);
	if (!command) {
		return text;
	}

	return `${text.slice(0, from)}${getSlashCommandInsertText(commandId, referenceDate)}${text.slice(to)}`;
}

export function getInsertedCursorOffset(commandId: SlashCommandId, referenceDate = new Date()): number {
	const command = getSlashCommandById(commandId);
	if (!command) {
		return 0;
	}

	return command.cursorOffset ?? getSlashCommandInsertText(commandId, referenceDate).length;
}

export function getSlashCommandDisplayText(commandId: SlashCommandId): string {
	const command = getSlashCommandById(commandId);
	return command?.label ?? "";
}

export function getSlashCommandIcon(commandId: SlashCommandId): string {
	const command = getSlashCommandById(commandId);
	return command?.icon ?? "square";
}

export function getSlashCommandInsertText(commandId: SlashCommandId, referenceDate = new Date()): string {
	const command = getSlashCommandById(commandId);
	if (!command) {
		return "";
	}

	return command.getInsertText?.(referenceDate) ?? command.insertText;
}

export function getSlashCommandPreviewText(suggestion: SlashMenuSuggestion): string {
	if (suggestion.type === "command-palette") {
		return `Run ${suggestion.commandId}`;
	}

	if (suggestion.type === "markdown" && suggestion.action === "pick-attachment") {
		return "Pick a vault file to embed";
	}

	const insertText = suggestion.type === "custom" ? suggestion.insertText : suggestion.insertText;
	const preview = insertText.replace(/\n/g, "\\n");
	const shortenedPreview = preview.length > 60 ? `${preview.slice(0, 57).trimEnd()}...` : preview;
	return `Insert ${shortenedPreview}`;
}

export function isAttachmentPath(path: string): boolean {
	return path.split(".").pop()?.toLowerCase() !== "md";
}

export function renderCustomCommandInsertText(template: string, referenceDate = new Date()): {insertText: string; cursorOffset: number} {
	let cursorOffset = template.indexOf("${cursor}");
	let insertText = template.replace("${cursor}", "");

	insertText = insertText
		.replace(/\$\{date\}/g, formatDate(referenceDate))
		.replace(/\$\{time\}/g, formatTime(referenceDate));

	if (cursorOffset === -1) {
		cursorOffset = insertText.length;
	}

	return {
		insertText,
		cursorOffset,
	};
}

export function parseTriggerKeys(triggerKeys: string): string[] {
	const parsedTriggerKeys = triggerKeys
		.split(",")
		.map((triggerKey) => triggerKey.trim())
		.filter((triggerKey) => triggerKey.length > 0);

	return parsedTriggerKeys.length > 0 ? parsedTriggerKeys : ["/"];
}

export function getSlashQuery(
	text: string,
	cursorOffset: number,
	triggerKeys: string[] = ["/"],
	triggerBehavior: TriggerBehavior = "anywhere",
): SlashQuery | null {
	const beforeCursor = text.slice(0, cursorOffset);
	const lineStart = beforeCursor.lastIndexOf("\n") + 1;
	const lineBeforeCursor = beforeCursor.slice(lineStart);
	const triggerMatch = getLastTriggerMatch(lineBeforeCursor, triggerKeys);

	if (!triggerMatch) {
		return null;
	}

	const query = lineBeforeCursor.slice(triggerMatch.index + triggerMatch.triggerKey.length);
	if (/\s/.test(query)) {
		return null;
	}

	if (!isTriggerAllowed(lineBeforeCursor, triggerMatch.index, triggerBehavior)) {
		return null;
	}

	const from = lineStart + triggerMatch.index;
	return {
		from,
		to: cursorOffset,
		query,
	};
}

function getLastTriggerMatch(lineBeforeCursor: string, triggerKeys: string[]): {index: number; triggerKey: string} | null {
	let match: {index: number; triggerKey: string} | null = null;

	for (const triggerKey of triggerKeys) {
		const index = lineBeforeCursor.lastIndexOf(triggerKey);
		if (index === -1) {
			continue;
		}

		if (!match || index > match.index || (index === match.index && triggerKey.length > match.triggerKey.length)) {
			match = {index, triggerKey};
		}
	}

	return match;
}

function isTriggerAllowed(lineBeforeCursor: string, triggerIndex: number, triggerBehavior: TriggerBehavior): boolean {
	const beforeTrigger = lineBeforeCursor.slice(0, triggerIndex);

	if (isLikelyUrlBeforeTrigger(beforeTrigger)) {
		return false;
	}

	if (triggerBehavior === "line-start") {
		return beforeTrigger.trim().length === 0;
	}

	if (triggerBehavior === "after-whitespace") {
		return triggerIndex === 0 || /\s/.test(lineBeforeCursor.charAt(triggerIndex - 1));
	}

	return true;
}

function isLikelyUrlBeforeTrigger(beforeTrigger: string): boolean {
	return /(?:https?:|obsidian:|file:)\/\/\S*$/i.test(beforeTrigger);
}

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function formatTime(date: Date): string {
	const hours = `${date.getHours()}`.padStart(2, "0");
	const minutes = `${date.getMinutes()}`.padStart(2, "0");
	return `${hours}:${minutes}`;
}

function getMatchScore(command: SlashMenuSuggestion, normalizedQuery: string): number {
	const terms = [command.label, ...command.aliases, command.id].map((term) => term.toLowerCase());
	const prefixIndex = terms.findIndex((term) => term.startsWith(normalizedQuery));

	if (prefixIndex !== -1) {
		return prefixIndex;
	}

	const containsIndex = terms.findIndex((term) => term.includes(normalizedQuery));
	if (containsIndex !== -1) {
		return 100 + containsIndex;
	}

	return 1000;
}

function sortSuggestions(
	suggestions: SlashMenuSuggestion[],
	normalizedQuery: string,
	rankingOptions: SuggestionRankingOptions,
): SlashMenuSuggestion[] {
	return [...suggestions].sort((first, second) => compareSuggestions(first, second, normalizedQuery, rankingOptions));
}

function compareSuggestions(
	first: SlashMenuSuggestion,
	second: SlashMenuSuggestion,
	normalizedQuery: string,
	rankingOptions: SuggestionRankingOptions,
): number {
	const firstPinned = rankingOptions.pinnedCommandIds?.includes(first.id) ? 0 : 1;
	const secondPinned = rankingOptions.pinnedCommandIds?.includes(second.id) ? 0 : 1;
	if (firstPinned !== secondPinned) {
		return firstPinned - secondPinned;
	}

	const firstUsage = rankingOptions.commandUsageCounts?.[first.id] ?? 0;
	const secondUsage = rankingOptions.commandUsageCounts?.[second.id] ?? 0;
	if (firstUsage !== secondUsage) {
		return secondUsage - firstUsage;
	}

	const firstMatchScore = getMatchScore(first, normalizedQuery);
	const secondMatchScore = getMatchScore(second, normalizedQuery);
	if (firstMatchScore !== secondMatchScore) {
		return firstMatchScore - secondMatchScore;
	}

	return first.label.localeCompare(second.label);
}
