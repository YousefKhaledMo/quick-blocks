import {
	CommandPaletteSlashCommandSetting,
	CustomSlashCommandSetting,
	DEFAULT_COMMAND_SETTINGS,
	SlashCommandSettings,
	TriggerBehavior,
} from "./slashCommands";

export const CURRENT_SETTINGS_VERSION = 2;

export interface QuickBlocksSettings {
	schemaVersion: number;
	triggerKeys: string;
	triggerBehavior: TriggerBehavior;
	showDescriptions: boolean;
	commands: SlashCommandSettings;
	commandPaletteCommands: CommandPaletteSlashCommandSetting[];
	customCommands: CustomSlashCommandSetting[];
	pinnedCommandIds: string[];
	commandUsageCounts: Record<string, number>;
}

export interface SavedQuickBlocksSettings {
	schemaVersion?: number;
	triggerKeys?: string;
	triggerBehavior?: string;
	showDescriptions?: boolean;
	commands?: Partial<SlashCommandSettings>;
	commandPaletteCommands?: Partial<CommandPaletteSlashCommandSetting>[];
	customCommands?: Partial<CustomSlashCommandSetting>[];
	pinnedCommandIds?: string[];
	commandUsageCounts?: Record<string, number>;
}

export const DEFAULT_SETTINGS: QuickBlocksSettings = {
	schemaVersion: CURRENT_SETTINGS_VERSION,
	triggerKeys: "/",
	triggerBehavior: "anywhere",
	showDescriptions: true,
	commands: {...DEFAULT_COMMAND_SETTINGS},
	commandPaletteCommands: [],
	customCommands: [],
	pinnedCommandIds: [],
	commandUsageCounts: {},
};

export function mergeSettings(savedSettings: SavedQuickBlocksSettings | null | undefined): QuickBlocksSettings {
	return {
		schemaVersion: CURRENT_SETTINGS_VERSION,
		triggerKeys: normalizeTriggerKeys(savedSettings?.triggerKeys),
		triggerBehavior: normalizeTriggerBehavior(savedSettings?.triggerBehavior),
		showDescriptions: savedSettings?.showDescriptions ?? DEFAULT_SETTINGS.showDescriptions,
		commands: {
			...DEFAULT_COMMAND_SETTINGS,
			...savedSettings?.commands,
		},
		commandPaletteCommands: normalizeCommandPaletteCommands(savedSettings?.commandPaletteCommands),
		customCommands: normalizeCustomCommands(savedSettings?.customCommands),
		pinnedCommandIds: normalizeUniqueStrings(savedSettings?.pinnedCommandIds),
		commandUsageCounts: normalizeUsageCounts(savedSettings?.commandUsageCounts),
	};
}

function normalizeTriggerKeys(triggerKeys: string | undefined): string {
	const normalized = triggerKeys?.split(",")
		.map((triggerKey) => triggerKey.trim())
		.filter((triggerKey) => triggerKey.length > 0)
		.join(", ");

	return normalized || DEFAULT_SETTINGS.triggerKeys;
}

function normalizeTriggerBehavior(triggerBehavior: string | undefined): TriggerBehavior {
	if (triggerBehavior === "line-start" || triggerBehavior === "after-whitespace") {
		return triggerBehavior;
	}

	return DEFAULT_SETTINGS.triggerBehavior;
}

function normalizeCommandPaletteCommands(
	commands: Partial<CommandPaletteSlashCommandSetting>[] | undefined,
): CommandPaletteSlashCommandSetting[] {
	const seenCommandIds = new Set<string>();
	const normalized: CommandPaletteSlashCommandSetting[] = [];

	for (const command of commands ?? []) {
		const commandId = command.commandId?.trim() ?? "";
		const label = command.label?.trim() ?? "";
		if (!commandId || !label || seenCommandIds.has(commandId)) {
			continue;
		}

		seenCommandIds.add(commandId);
		normalized.push({
			id: command.id?.trim() || commandId,
			commandId,
			label,
			aliases: normalizeUniqueStrings(command.aliases),
			enabled: command.enabled ?? true,
		});
	}

	return normalized;
}

function normalizeCustomCommands(commands: Partial<CustomSlashCommandSetting>[] | undefined): CustomSlashCommandSetting[] {
	const seenIds = new Set<string>();
	const normalized: CustomSlashCommandSetting[] = [];

	for (const command of commands ?? []) {
		const id = command.id?.trim() ?? "";
		const label = command.label?.trim() ?? "";
		const insertText = command.insertText ?? "";
		if (!id || !label || !insertText || seenIds.has(id)) {
			continue;
		}

		seenIds.add(id);
		normalized.push({
			id,
			label,
			aliases: normalizeUniqueStrings(command.aliases),
			insertText,
			icon: command.icon?.trim() || "sparkles",
			enabled: command.enabled ?? true,
		});
	}

	return normalized;
}

function normalizeUsageCounts(commandUsageCounts: Record<string, number> | undefined): Record<string, number> {
	const normalized: Record<string, number> = {};

	for (const [commandId, count] of Object.entries(commandUsageCounts ?? {})) {
		if (!commandId.trim() || !Number.isFinite(count) || count <= 0) {
			continue;
		}

		normalized[commandId] = Math.floor(count);
	}

	return normalized;
}

function normalizeUniqueStrings(values: string[] | undefined): string[] {
	const seen = new Set<string>();
	const normalized: string[] = [];

	for (const value of values ?? []) {
		const trimmedValue = value.trim();
		if (!trimmedValue || seen.has(trimmedValue)) {
			continue;
		}

		seen.add(trimmedValue);
		normalized.push(trimmedValue);
	}

	return normalized;
}
