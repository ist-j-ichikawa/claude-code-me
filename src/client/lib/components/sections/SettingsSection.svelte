<script lang="ts">
	import Section from '../Section.svelte';
	import InfoGrid, { type InfoItem } from '../InfoGrid.svelte';
	import TagList from '../TagList.svelte';
	import ScopeBadge from '../ScopeBadge.svelte';
	import type { ScopeConfig, ScopeType } from '$lib/types';

	let { config }: { config: ScopeConfig } = $props();
	let s = $derived((config.settings ?? {}) as Record<string, unknown>);
	let provenance = $derived(config.settingsProvenance ?? {});
	function scopeOf(key: string): ScopeType | undefined {
		return provenance[key];
	}

	// Fields that have their own dedicated section elsewhere in the hub
	const HANDLED_ELSEWHERE = new Set([
		'permissions',
		'attribution',
		'hooks',
		'env',
		'enabledPlugins',
		'extraKnownMarketplaces',
		'blockedMarketplaces',
		'strictKnownMarketplaces',
	]);

	// Field groups (label -> [key, displayLabel])
	const GROUPS: { title: string; fields: [string, string][] }[] = [
		{
			title: 'General',
			fields: [
				['language', 'Language'],
				['model', 'Model'],
				['outputStyle', 'Output Style'],
				['effortLevel', 'Effort Level'],
				['autoUpdatesChannel', 'Updates Channel'],
				['minimumVersion', 'Minimum Version'],
				['agent', 'Default Agent'],
			],
		},
		{
			title: 'Editor / UI',
			fields: [
				['editorMode', 'Editor Mode'],
				['tui', 'TUI Renderer'],
				['viewMode', 'View Mode'],
				['teammateMode', 'Teammate Mode'],
				['syntaxHighlightingDisabled', 'Syntax Highlighting Off'],
				['prefersReducedMotion', 'Reduced Motion'],
				['autoScrollEnabled', 'Auto Scroll'],
				['terminalProgressBarEnabled', 'Progress Bar'],
				['preferredNotifChannel', 'Notification Channel'],
				['showThinkingSummaries', 'Show Thinking Summaries'],
				['showTurnDuration', 'Show Turn Duration'],
				['spinnerTipsEnabled', 'Spinner Tips'],
			],
		},
		{
			title: 'Behavior',
			fields: [
				['autoCompactEnabled', 'Auto Compact'],
				['alwaysThinkingEnabled', 'Always Thinking'],
				['skipAutoPermissionPrompt', 'Skip Auto Permission Prompt'],
				['awaySummaryEnabled', 'Away Summary'],
				['includeGitInstructions', 'Include Git Instructions'],
				['respectGitignore', 'Respect .gitignore'],
				['skipWebFetchPreflight', 'Skip WebFetch Preflight'],
				['disableAllHooks', 'Disable All Hooks'],
				['disableAgentView', 'Disable Agent View'],
				['disableRemoteControl', 'Disable Remote Control'],
				['disableDeepLinkRegistration', 'Disable Deep Link'],
				['useAutoModeDuringPlan', 'Auto Mode During Plan'],
				['fastModePerSessionOptIn', 'Fast Mode Opt-in'],
			],
		},
		{
			title: 'Storage / Paths',
			fields: [
				['cleanupPeriodDays', 'Cleanup Period (days)'],
				['autoMemoryEnabled', 'Auto Memory'],
				['autoMemoryDirectory', 'Auto Memory Dir'],
				['plansDirectory', 'Plans Dir'],
				['defaultShell', 'Default Shell'],
				['parentSettingsBehavior', 'Parent Settings Behavior'],
			],
		},
		{
			title: 'Auth / API',
			fields: [
				['apiKeyHelper', 'API Key Helper'],
				['awsAuthRefresh', 'AWS Auth Refresh'],
				['awsCredentialExport', 'AWS Credential Export'],
				['gcpAuthRefresh', 'GCP Auth Refresh'],
				['otelHeadersHelper', 'OTel Headers Helper'],
				['forceLoginMethod', 'Force Login Method'],
				['forceLoginOrgUUID', 'Force Login Org UUID'],
			],
		},
		{
			title: 'Voice',
			fields: [
				['voiceEnabled', 'Voice Enabled (legacy)'],
			],
		},
	];

	function fmt(v: unknown): string {
		if (v === null || v === undefined) return '';
		if (typeof v === 'boolean') return v ? 'true' : 'false';
		if (typeof v === 'object') return JSON.stringify(v);
		return String(v);
	}

	function groupItems(fields: [string, string][]): InfoItem[] {
		return fields
			.filter(([key]) => key in s && s[key] !== null && s[key] !== '')
			.map(([key, label]) => ({ label, value: fmt(s[key]), scope: scopeOf(key) }));
	}

	let perms = $derived(s.permissions as Record<string, unknown> | undefined);
	let attribution = $derived(s.attribution as Record<string, unknown> | undefined);
	let statusLine = $derived(s.statusLine as Record<string, unknown> | undefined);
	let autoMode = $derived(s.autoMode as Record<string, unknown> | undefined);
	let worktree = $derived(s.worktree as Record<string, unknown> | undefined);
	let sandbox = $derived(s.sandbox as Record<string, unknown> | undefined);

	// Fields not covered by GROUPS or HANDLED_ELSEWHERE — surfaced as Other
	let knownKeys = $derived(
		new Set([
			...HANDLED_ELSEWHERE,
			...GROUPS.flatMap((g) => g.fields.map(([k]) => k)),
			'statusLine',
			'autoMode',
			'worktree',
			'sandbox',
		]),
	);
	let otherEntries = $derived(
		Object.entries(s).filter(([k]) => !knownKeys.has(k)),
	);
</script>

<Section title="Settings" id="settings">
	{#each GROUPS as g}
		{@const items = groupItems(g.fields)}
		{#if items.length > 0}
			<h4>{g.title}</h4>
			<InfoGrid {items} />
		{/if}
	{/each}

	{#if perms}
		<h4>Permissions {#if scopeOf('permissions')}<ScopeBadge scope={scopeOf('permissions')} />{/if}</h4>
		{#if (perms.allow as string[])?.length}
			<div class="subsection">
				<div class="subsection-label allow">Allow ({(perms.allow as string[]).length})</div>
				<TagList items={perms.allow as string[]} variant="enabled" />
			</div>
		{/if}
		{#if (perms.ask as string[])?.length}
			<div class="subsection">
				<div class="subsection-label">Ask ({(perms.ask as string[]).length})</div>
				<TagList items={perms.ask as string[]} />
			</div>
		{/if}
		{#if (perms.deny as string[])?.length}
			<div class="subsection">
				<div class="subsection-label deny">Deny ({(perms.deny as string[]).length})</div>
				<TagList items={perms.deny as string[]} variant="denied" />
			</div>
		{/if}
		{#if (perms.additionalDirectories as string[])?.length}
			<div class="subsection">
				<div class="subsection-label">Additional Directories</div>
				<TagList items={perms.additionalDirectories as string[]} />
			</div>
		{/if}
		{#if perms.defaultMode}
			<div class="subsection">
				<div class="subsection-label">Default Mode</div>
				<span class="badge">{perms.defaultMode}</span>
			</div>
		{/if}
	{/if}

	{#if attribution}
		<h4>Attribution {#if scopeOf('attribution')}<ScopeBadge scope={scopeOf('attribution')} />{/if}</h4>
		{@const attrScope = scopeOf('attribution')}
		<InfoGrid items={[
			attribution.commit !== undefined ? { label: 'Commit Message', value: String(attribution.commit || '(empty)'), scope: attrScope } : null,
			attribution.pr !== undefined ? { label: 'PR Message', value: String(attribution.pr || '(empty)'), scope: attrScope } : null,
			attribution.prUrlTemplate !== undefined ? { label: 'PR URL Template', value: String(attribution.prUrlTemplate), scope: attrScope } : null,
		].filter((x): x is InfoItem => x !== null)} />
	{/if}

	{#if statusLine}
		<h4>Status Line {#if scopeOf('statusLine')}<ScopeBadge scope={scopeOf('statusLine')} />{/if}</h4>
		<pre class="json-view">{JSON.stringify(statusLine, null, 2)}</pre>
	{/if}

	{#if autoMode}
		<h4>Auto Mode {#if scopeOf('autoMode')}<ScopeBadge scope={scopeOf('autoMode')} />{/if}</h4>
		<pre class="json-view">{JSON.stringify(autoMode, null, 2)}</pre>
	{/if}

	{#if worktree}
		<h4>Worktree {#if scopeOf('worktree')}<ScopeBadge scope={scopeOf('worktree')} />{/if}</h4>
		<pre class="json-view">{JSON.stringify(worktree, null, 2)}</pre>
	{/if}

	{#if sandbox}
		<h4>Sandbox {#if scopeOf('sandbox')}<ScopeBadge scope={scopeOf('sandbox')} />{/if}</h4>
		<pre class="json-view">{JSON.stringify(sandbox, null, 2)}</pre>
	{/if}

	{#if otherEntries.length > 0}
		<h4>Other</h4>
		<InfoGrid items={otherEntries.map(([k, v]) => ({ label: k, value: fmt(v), scope: scopeOf(k) }))} />
	{/if}
</Section>

<style>
	h4 { font-size: 13px; font-weight: 600; margin: 20px 0 8px; color: var(--text-secondary); }
	h4:first-of-type { margin-top: 0; }
	.subsection { margin-bottom: 12px; }
	.subsection-label { font-weight: 600; font-size: 12px; margin-bottom: 6px; color: var(--text-secondary); }
	.subsection-label.allow { color: var(--success); }
	.subsection-label.deny { color: #c53030; }
	.badge { font-size: 12px; padding: 2px 8px; border-radius: 4px; background: var(--info-light); color: var(--info); }
	.json-view {
		font-family: var(--font-code);
		font-size: 12px;
		color: var(--text-secondary);
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
		padding: 8px 12px;
		background: var(--bg);
		border-radius: 4px;
		max-height: 240px;
		overflow-y: auto;
	}
</style>
