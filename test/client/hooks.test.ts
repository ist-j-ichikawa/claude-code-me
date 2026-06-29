import { describe, it, expect } from 'vitest';
import { hookType, hookPrimaryValue, hookRestFields } from '../../src/client/lib/hooks';

describe('hook entry rendering helpers', () => {
	it('defaults the type to command when omitted', () => {
		expect(hookType({ command: 'x' })).toBe('command');
		expect(hookType({ type: 'http', url: 'u' })).toBe('http');
	});

	it('picks the primary value per official hook type', () => {
		expect(hookPrimaryValue({ type: 'command', command: 'bash x.sh' })).toBe('bash x.sh');
		expect(hookPrimaryValue({ type: 'http', url: 'http://localhost/h' })).toBe('http://localhost/h');
		expect(hookPrimaryValue({ type: 'mcp_tool', server: 'sec', tool: 'scan' })).toBe('sec · scan');
		expect(hookPrimaryValue({ type: 'prompt', prompt: 'safe? $ARGUMENTS' })).toBe('safe? $ARGUMENTS');
		expect(hookPrimaryValue({ type: 'agent', prompt: 'verify $ARGUMENTS' })).toBe('verify $ARGUMENTS');
	});

	it('surfaces every non-primary field, objects JSON-stringified', () => {
		const rest = hookRestFields({
			type: 'command',
			command: 'bash x.sh',
			if: 'Bash(git push:*)',
			timeout: 30,
		});
		expect(rest).toContainEqual(['if', 'Bash(git push:*)']);
		expect(rest).toContainEqual(['timeout', '30']);
		// the primary field and type are NOT repeated as generic fields
		expect(rest.map(([k]) => k)).not.toContain('command');
		expect(rest.map(([k]) => k)).not.toContain('type');

		const httpRest = hookRestFields({
			type: 'http',
			url: 'http://localhost/h',
			headers: { Authorization: 'Bearer $TOKEN' },
		});
		expect(httpRest).toContainEqual(['headers', '{"Authorization":"Bearer $TOKEN"}']);
	});

	it('never silently drops a field from an unknown future type', () => {
		// A hook shape this app does not know about yet must still render fully.
		const h = { type: 'future_kind', someNewField: 'value', another: 42 };
		expect(hookType(h)).toBe('future_kind');
		const rest = hookRestFields(h);
		expect(rest).toContainEqual(['someNewField', 'value']);
		expect(rest).toContainEqual(['another', '42']);
	});

	it('does not repeat a fallback-sourced primary value as a generic field', () => {
		// type omitted (defaults to command) but only `url` present: the value
		// must appear once as primary, not again in the rest fields.
		const h = { url: 'http://localhost/h' };
		expect(hookPrimaryValue(h)).toBe('http://localhost/h');
		expect(hookRestFields(h).map(([k]) => k)).not.toContain('url');
	});

	it('skips null/empty values', () => {
		const rest = hookRestFields({ type: 'command', command: 'x', timeout: null, note: '' });
		expect(rest.map(([k]) => k)).not.toContain('timeout');
		expect(rest.map(([k]) => k)).not.toContain('note');
	});
});
