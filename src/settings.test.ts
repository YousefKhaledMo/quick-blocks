import {describe, expect, it} from "vitest";
import {DEFAULT_SETTINGS, mergeSettings} from "./settings";

describe("settings", () => {
	it("defaults all slash commands to enabled", () => {
		expect(Object.values(DEFAULT_SETTINGS.commands).every(Boolean)).toBe(true);
	});

	it("shows slash menu descriptions by default", () => {
		expect(mergeSettings(null).showDescriptions).toBe(true);
	});

	it("preserves saved command toggles while filling missing defaults", () => {
		const settings = mergeSettings({
			triggerKeys: ";;",
			schemaVersion: 1,
			showDescriptions: false,
			commandPaletteCommands: [
				{
					id: "custom-1",
					commandId: "workspace:open",
					label: "Open command",
					aliases: [],
					enabled: true,
				},
			],
			commands: {
				table: false,
			},
		});

		expect(settings.triggerKeys).toBe(";;");
		expect(settings.showDescriptions).toBe(false);
		expect(settings.commandPaletteCommands).toEqual([
				{
					id: "custom-1",
					commandId: "workspace:open",
					label: "Open command",
					aliases: [],
					enabled: true,
				},
			]);
		expect(settings.commands.table).toBe(false);
		expect(settings.commands["heading-1"]).toBe(true);
	});

	it("normalizes invalid saved settings into safe defaults", () => {
		const settings = mergeSettings({
			schemaVersion: 999,
			triggerKeys: " , , ",
			triggerBehavior: "unknown",
			commandPaletteCommands: [
				{
					id: "",
					commandId: "",
					label: "",
					enabled: true,
				},
			],
			customCommands: [
				{
					id: "",
					label: "",
					aliases: ["", "note"],
					insertText: "",
					icon: "",
					enabled: true,
				},
			],
			pinnedCommandIds: ["", "heading-1", "heading-1"],
			commandUsageCounts: {
				"heading-1": 2,
				"bad-count": -4,
			},
		});

		expect(settings.schemaVersion).toBe(DEFAULT_SETTINGS.schemaVersion);
		expect(settings.triggerKeys).toBe("/");
		expect(settings.triggerBehavior).toBe("anywhere");
		expect(settings.commandPaletteCommands).toEqual([]);
		expect(settings.customCommands).toEqual([]);
		expect(settings.pinnedCommandIds).toEqual(["heading-1"]);
		expect(settings.commandUsageCounts).toEqual({"heading-1": 2});
	});

	it("deduplicates custom snippets and command palette entries", () => {
		const settings = mergeSettings({
			customCommands: [
				{
					id: "snippet",
					label: "Snippet",
					aliases: ["snip", "snip"],
					insertText: "Hello ${cursor}",
					icon: "sparkles",
					enabled: true,
				},
				{
					id: "snippet",
					label: "Duplicate",
					aliases: [],
					insertText: "Ignored",
					icon: "star",
					enabled: true,
				},
			],
			commandPaletteCommands: [
				{
					id: "open",
					commandId: "workspace:open",
					label: "Open",
					aliases: ["open", "quick"],
					enabled: true,
				},
				{
					id: "open-again",
					commandId: "workspace:open",
					label: "Open duplicate",
					aliases: [],
					enabled: true,
				},
			],
		});

		expect(settings.customCommands).toEqual([
			{
				id: "snippet",
				label: "Snippet",
				aliases: ["snip"],
				insertText: "Hello ${cursor}",
				icon: "sparkles",
				enabled: true,
			},
		]);
		expect(settings.commandPaletteCommands).toEqual([
			{
				id: "open",
				commandId: "workspace:open",
				label: "Open",
				aliases: ["open", "quick"],
				enabled: true,
			},
		]);
	});
});
