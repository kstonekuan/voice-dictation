import { Alert, Kbd, NavLink, Switch, Text, Title } from "@mantine/core";
import { AlertCircle, Home, Mic, Settings } from "lucide-react";
import { useState } from "react";
import { DeviceSelector } from "./components/DeviceSelector";
import { HistoryFeed } from "./components/HistoryFeed";
import { HotkeyInput } from "./components/HotkeyInput";
import {
	useSettings,
	useUpdateHoldHotkey,
	useUpdateSoundEnabled,
	useUpdateToggleHotkey,
} from "./lib/queries";
import type { HotkeyConfig } from "./lib/tauri";
import "./styles.css";

type View = "home" | "settings";

function Sidebar({
	activeView,
	onViewChange,
}: {
	activeView: View;
	onViewChange: (view: View) => void;
}) {
	return (
		<aside className="sidebar">
			<header className="sidebar-header">
				<div className="sidebar-logo">
					<div className="sidebar-logo-icon">
						<Mic size={16} />
					</div>
					<span className="sidebar-title">Voice</span>
				</div>
			</header>

			<nav className="sidebar-nav">
				<NavLink
					label="Home"
					leftSection={<Home size={18} />}
					active={activeView === "home"}
					onClick={() => onViewChange("home")}
					variant="filled"
					styles={{
						root: {
							borderRadius: 8,
							"&[data-active]": {
								backgroundColor: "var(--bg-elevated)",
							},
						},
						label: {
							color: "var(--text-primary)",
						},
					}}
				/>
				<NavLink
					label="Settings"
					leftSection={<Settings size={18} />}
					active={activeView === "settings"}
					onClick={() => onViewChange("settings")}
					variant="filled"
					styles={{
						root: {
							borderRadius: 8,
							"&[data-active]": {
								backgroundColor: "var(--bg-elevated)",
							},
						},
						label: {
							color: "var(--text-primary)",
						},
					}}
				/>
			</nav>

			<footer className="sidebar-footer">
				<p className="sidebar-footer-text">v1.0.0</p>
			</footer>
		</aside>
	);
}

function HotkeyDisplay({ config }: { config: HotkeyConfig }) {
	const parts = [
		...config.modifiers.map((m) => m.charAt(0).toUpperCase() + m.slice(1)),
		config.key,
	];

	return (
		<span className="kbd-combo">
			{parts.map((part, index) => (
				<span key={part}>
					<Kbd>{part}</Kbd>
					{index < parts.length - 1 && <span className="kbd-plus">+</span>}
				</span>
			))}
		</span>
	);
}

function InstructionsCard() {
	const { data: settings } = useSettings();

	const toggleHotkey = settings?.toggle_hotkey ?? {
		modifiers: ["ctrl", "alt"],
		key: "Space",
	};

	const holdHotkey = settings?.hold_hotkey ?? {
		modifiers: ["ctrl", "alt"],
		key: "Period",
	};

	return (
		<div className="instructions-card animate-in">
			<h2 className="instructions-card-title">
				<span className="highlight">Dictate</span> with your voice
			</h2>
			<div className="instructions-methods">
				<div className="instruction-method">
					<span className="instruction-label">Toggle:</span>
					<HotkeyDisplay config={toggleHotkey} />
					<span className="instruction-desc">Press to start/stop</span>
				</div>
				<div className="instruction-method">
					<span className="instruction-label">Hold:</span>
					<HotkeyDisplay config={holdHotkey} />
					<span className="instruction-desc">Hold to record</span>
				</div>
			</div>
			<p className="instructions-card-text">
				Speak clearly and your words will be typed wherever your cursor is. The
				overlay appears in the bottom-right corner of your screen.
			</p>
		</div>
	);
}

function HomeView() {
	return (
		<div className="main-content">
			<header className="animate-in" style={{ marginBottom: 32 }}>
				<Title order={1} mb={4}>
					Welcome back
				</Title>
				<Text c="dimmed" size="sm">
					Your voice dictation history
				</Text>
			</header>

			<InstructionsCard />

			<HistoryFeed />
		</div>
	);
}

function SettingsView() {
	const { data: settings, isLoading } = useSettings();
	const updateSoundEnabled = useUpdateSoundEnabled();
	const updateToggleHotkey = useUpdateToggleHotkey();
	const updateHoldHotkey = useUpdateHoldHotkey();

	const handleSoundToggle = (checked: boolean) => {
		updateSoundEnabled.mutate(checked);
	};

	const handleToggleHotkeyChange = (config: HotkeyConfig) => {
		updateToggleHotkey.mutate(config);
	};

	const handleHoldHotkeyChange = (config: HotkeyConfig) => {
		updateHoldHotkey.mutate(config);
	};

	const defaultToggleHotkey: HotkeyConfig = {
		modifiers: ["ctrl", "alt"],
		key: "Space",
	};

	const defaultHoldHotkey: HotkeyConfig = {
		modifiers: ["ctrl", "alt"],
		key: "Period",
	};

	return (
		<div className="main-content">
			<header className="animate-in" style={{ marginBottom: 32 }}>
				<Title order={1} mb={4}>
					Settings
				</Title>
				<Text c="dimmed" size="sm">
					Configure your voice dictation preferences
				</Text>
			</header>

			<div className="settings-section animate-in animate-in-delay-1">
				<h3 className="settings-section-title">Audio</h3>
				<div className="settings-card">
					<DeviceSelector />
					<div className="settings-row" style={{ marginTop: 16 }}>
						<div>
							<p className="settings-label">Sound feedback</p>
							<p className="settings-description">
								Play sounds when recording starts and stops
							</p>
						</div>
						<Switch
							checked={settings?.sound_enabled ?? true}
							onChange={(event) =>
								handleSoundToggle(event.currentTarget.checked)
							}
							disabled={isLoading}
							color="orange"
							size="md"
						/>
					</div>
				</div>
			</div>

			<div className="settings-section animate-in animate-in-delay-2">
				<h3 className="settings-section-title">Hotkeys</h3>
				<div className="settings-card">
					<HotkeyInput
						label="Toggle Recording"
						description="Press once to start recording, press again to stop"
						value={settings?.toggle_hotkey ?? defaultToggleHotkey}
						onChange={handleToggleHotkeyChange}
						disabled={isLoading}
					/>

					<div style={{ marginTop: 20 }}>
						<HotkeyInput
							label="Hold to Record"
							description="Hold to record, release to stop"
							value={settings?.hold_hotkey ?? defaultHoldHotkey}
							onChange={handleHoldHotkeyChange}
							disabled={isLoading}
						/>
					</div>
				</div>

				<Alert
					icon={<AlertCircle size={16} />}
					color="orange"
					variant="light"
					mt="md"
				>
					Hotkey changes require app restart to take effect.
				</Alert>
			</div>
		</div>
	);
}

export default function App() {
	const [activeView, setActiveView] = useState<View>("home");

	return (
		<div className="app-layout">
			<Sidebar activeView={activeView} onViewChange={setActiveView} />
			{activeView === "home" ? <HomeView /> : <SettingsView />}
		</div>
	);
}
