import {Plugin} from "obsidian";
import {mergeSettings, NotionLikeSlashMenuSettings, SavedNotionLikeSlashMenuSettings} from "./settings";
import {SlashMenuSettingTab} from "./settingsTab";
import {SlashCommandSuggest} from "./slashSuggest";

export default class NotionLikeSlashMenuPlugin extends Plugin {
	settings: NotionLikeSlashMenuSettings;

	async onload() {
		await this.loadSettings();

		this.registerEditorSuggest(new SlashCommandSuggest(this.app, () => this.settings, async (commandId) => {
			this.settings.commandUsageCounts[commandId] = (this.settings.commandUsageCounts[commandId] ?? 0) + 1;
			await this.saveSettings();
		}));
		this.addSettingTab(new SlashMenuSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = mergeSettings(await this.loadData() as SavedNotionLikeSlashMenuSettings | null);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
