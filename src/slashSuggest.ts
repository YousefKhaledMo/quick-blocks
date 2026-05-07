import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	FuzzySuggestModal,
	setIcon,
	TFile,
} from "obsidian";
import {executeCommandPaletteCommand} from "./commandRegistry";
import {QuickBlocksSettings} from "./settings";
import {
	getInsertedCursorOffset,
	getSlashCommandDisplayText,
	getSlashCommandIcon,
	getSlashCommandInsertText,
	getSlashCommandPreviewText,
	getSlashQuery,
	isAttachmentPath,
	parseTriggerKeys,
	renderCustomCommandInsertText,
	searchMenuSuggestions,
	SlashMenuSuggestion,
} from "./slashCommands";

export class SlashCommandSuggest extends EditorSuggest<SlashMenuSuggestion> {
	private getSettings: () => QuickBlocksSettings;
	private onSuggestionUsed: (commandId: string) => Promise<void>;

	constructor(
		app: App,
		getSettings: () => QuickBlocksSettings,
		onSuggestionUsed: (commandId: string) => Promise<void>,
	) {
		super(app);
		this.getSettings = getSettings;
		this.onSuggestionUsed = onSuggestionUsed;
		this.limit = 100;
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile | null): EditorSuggestTriggerInfo | null {
		if (!file) {
			return null;
		}

		const lineBeforeCursor = editor.getLine(cursor.line).slice(0, cursor.ch);
		const settings = this.getSettings();
		const triggerQuery = getSlashQuery(
			lineBeforeCursor,
			lineBeforeCursor.length,
			parseTriggerKeys(settings.triggerKeys),
			settings.triggerBehavior,
		);
		if (!triggerQuery) {
			return null;
		}

		return {
			start: {
				line: cursor.line,
				ch: triggerQuery.from,
			},
			end: cursor,
			query: triggerQuery.query,
		};
	}

	getSuggestions(context: EditorSuggestContext): SlashMenuSuggestion[] {
		const settings = this.getSettings();
		return searchMenuSuggestions(context.query, settings.commands, settings.commandPaletteCommands, settings.customCommands, {
			pinnedCommandIds: settings.pinnedCommandIds,
			commandUsageCounts: settings.commandUsageCounts,
		});
	}

	renderSuggestion(command: SlashMenuSuggestion, el: HTMLElement): void {
		el.empty();
		const rowEl = el.createDiv({cls: "quick-blocks-menu-item"});
		const iconEl = rowEl.createSpan({cls: "quick-blocks-menu-icon"});
		const icon = command.type === "markdown" ? getSlashCommandIcon(command.id) : command.icon;
		const label = command.type === "markdown" ? getSlashCommandDisplayText(command.id) : command.label;
		setIcon(iconEl, icon);
		const textEl = rowEl.createDiv({cls: "quick-blocks-menu-text"});
		textEl.createSpan({text: label, cls: "quick-blocks-menu-label"});
		if (this.getSettings().showDescriptions) {
			textEl.createSpan({text: getSlashCommandPreviewText(command), cls: "quick-blocks-menu-preview"});
		}
	}

	selectSuggestion(command: SlashMenuSuggestion): void {
		const context = this.context;
		if (!context) {
			return;
		}

		if (command.type === "command-palette") {
			if (executeCommandPaletteCommand(this.app, command.commandId)) {
				context.editor.replaceRange("", context.start, context.end);
				void this.onSuggestionUsed(command.id);
			}
			return;
		}

		if (command.type === "custom") {
			const {insertText, cursorOffset} = renderCustomCommandInsertText(command.insertText);
			context.editor.replaceRange(insertText, context.start, context.end);
			context.editor.setCursor(getCursorAfterInsert(context.start, insertText, cursorOffset));
			void this.onSuggestionUsed(command.id);
			return;
		}

		if (command.action) {
			if (command.action === "pick-attachment") {
				this.openAttachmentPicker(context, command.id);
				return;
			}

			applyEditorAction(context.editor, context.start, context.end, command.action);
			void this.onSuggestionUsed(command.id);
			return;
		}

		const insertText = getSlashCommandInsertText(command.id);
		context.editor.replaceRange(insertText, context.start, context.end);
		const cursor = getCursorAfterInsert(context.start, insertText, getInsertedCursorOffset(command.id));
		context.editor.setCursor(cursor);
		void this.onSuggestionUsed(command.id);
	}

	private openAttachmentPicker(context: EditorSuggestContext, commandId: string): void {
		new AttachmentSuggestModal(this.app, context.file, (file) => {
			const markdownLink = this.app.fileManager.generateMarkdownLink(file, context.file.path);
			context.editor.replaceRange(`!${markdownLink}`, context.start, context.end);
			void this.onSuggestionUsed(commandId);
		}).open();
	}
}

class AttachmentSuggestModal extends FuzzySuggestModal<TFile> {
	private sourceFile: TFile;
	private onChooseAttachment: (file: TFile) => void;

	constructor(app: App, sourceFile: TFile, onChooseAttachment: (file: TFile) => void) {
		super(app);
		this.sourceFile = sourceFile;
		this.onChooseAttachment = onChooseAttachment;
		this.setPlaceholder("Choose an attachment from your vault");
	}

	getItems(): TFile[] {
		return this.app.vault.getFiles()
			.filter((file) => file.path !== this.sourceFile.path && isAttachmentPath(file.path))
			.sort((first, second) => first.path.localeCompare(second.path));
	}

	getItemText(file: TFile): string {
		return file.path;
	}

	onChooseItem(file: TFile): void {
		this.onChooseAttachment(file);
	}
}

function applyEditorAction(
	editor: Editor,
	start: EditorPosition,
	end: EditorPosition,
	action: "turn-line-into-todo" | "turn-line-into-quote",
): void {
	const line = editor.getLine(start.line);
	const lineWithoutQuery = `${line.slice(0, start.ch)}${line.slice(end.ch)}`;
	const trimmedLine = lineWithoutQuery.trimStart();
	const indentation = lineWithoutQuery.slice(0, lineWithoutQuery.length - trimmedLine.length);
	const prefix = action === "turn-line-into-todo" ? "- [ ] " : "> ";
	editor.setLine(start.line, `${indentation}${prefix}${trimmedLine}`);
	editor.setCursor({
		line: start.line,
		ch: indentation.length + prefix.length + trimmedLine.length,
	});
}

function getCursorAfterInsert(start: EditorPosition, insertText: string, cursorOffset: number): EditorPosition {
	const textBeforeCursor = insertText.slice(0, cursorOffset);
	const lines = textBeforeCursor.split("\n");
	const lastLine = lines[lines.length - 1] ?? "";

	if (lines.length === 1) {
		return {
			line: start.line,
			ch: start.ch + lastLine.length,
		};
	}

	return {
		line: start.line + lines.length - 1,
		ch: lastLine.length,
	};
}
