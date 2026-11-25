// Generated from tests/e2e/specs/teams-and-draw.json (spec c7cc97a7219499a1). Edit the spec, not this file.
import { test } from "@e2e-dev/web";
import type { Locator, Screen } from "e2e";
import { expect } from "e2e";

/** Steps this flow's recording found already done; strict replay skips them, as they have nothing to replay. */
const skippedSteps: readonly number[] = JSON.parse(process.env.CAFFEINE_E2E_SKIP_STEPS ?? "[]");

const recording = process.env.CAFFEINE_E2E_MODE === "record" || process.env.CAFFEINE_E2E_MODE === "heal";

/** Whether `holds` turns true within the assertion timeout. */
async function eventually(holds: () => Promise<boolean>): Promise<boolean> {
  const deadline = Date.now() + 5000;
  for (;;) {
    if (await holds()) return true;
    if (Date.now() >= deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

function flowChecks() {
  let failed = 0;
  return {
    /** Spec check `index`: a failure fails a strict replay at once and is kept otherwise. */
    async check(index: number, verify: () => Promise<void>, holds: () => Promise<boolean>): Promise<void> {
      if (!recording) return verify();
      if (failed === 0) {
        try {
          return await verify();
        } catch (error) {
          if ((error as { code?: unknown }).code !== "ASSERTION_FAILED") throw error;
        }
      } else if (await eventually(holds)) {
        return;
      }
      failed += 1;
      expect.soft(false, `check ${String(index)}`).toBe(true);
    },
  };
}

/** `text` as a case-insensitive pattern in which each run of spaces also matches none. */
function spacedText(text: string): RegExp {
  const words = text.trim().split(/\s+/).map((word) => word.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&"));
  return new RegExp(words.join("\\s*"), "i");
}

/** Words the screen shows: visible text, the placeholder of an input that shows it, or a field that holds it right after the step that typed it. */
async function shownText(screen: Screen, text: string, typed = false, pattern?: RegExp): Promise<Locator> {
  const asText = screen.getByText(pattern ?? spacedText(text), { visible: true }).first();
  const field = pattern === undefined ? { exact: false, visible: true } : { exact: true, visible: true };
  const asPlaceholder = screen.getByPlaceholder(text, field).first();
  const asValue = screen.getByDisplayValue(text, field).first();
  for (let waited = 0; waited < 5000; waited += 250) {
    if (await asText.isVisible()) return asText;
    if (await asPlaceholder.isVisible()) return asPlaceholder;
    if (typed && (await asValue.isVisible())) return asValue;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return asText;
}

const SIGN_IN_CONTROL_WAIT_MS = 15000;
const SIGN_IN_CONTROL_GRACE_MS = 1500;
const SIGN_IN_CONTROL_POLL_MS = 250;

function signInControlSettled(state, elapsed, sawGate) {
  if (state.ready || elapsed >= SIGN_IN_CONTROL_WAIT_MS) return true;
  if (!state.gate && !state.blank && (sawGate || elapsed >= SIGN_IN_CONTROL_GRACE_MS)) return true;
  return false;
}

/** Waits until a sign-in or sign-out control is visible, or the page has settled without the auth loading gate. */
async function waitForSignInControl(browser) {
  const started = Date.now();
  let sawGate = false;
  for (;;) {
    const state = await browser.evaluate("(() => {\n  const text = document.body?.innerText ?? \"\";\n  const nameOf = (element) => (element.getAttribute(\"aria-label\") || element.innerText || \"\").replace(/\\s+/gu, \" \").trim();\n  const visible = (element) => {\n    const rect = element.getBoundingClientRect();\n    const style = getComputedStyle(element);\n    return rect.width > 0 && rect.height > 0 && style.visibility !== \"hidden\" && style.display !== \"none\";\n  };\n  const controls = [...document.querySelectorAll(\"button, [role=button], a[href]\")].filter(visible);\n  const disabled = (element) => element.disabled || element.getAttribute(\"aria-disabled\") === \"true\";\n  const gateText = /\\b(?:signing|logging) in\\b|\\bloading (?:your session|sign-?in)\\b/iu.test(text);\n  const loadingName = /^(?:loading(?:\\.{3}|\\u2026)?|signing in|logging in|loading sign-?in)\\b/iu;\n  const loadingControl = controls.some((element) => disabled(element) && loadingName.test(nameOf(element)));\n  const readyName = /\\b(?:sign|log)[\\s-]?(?:in|out)\\b|\\binternet identity\\b/iu;\n  const busyName = /\\bloading\\b|\\b(?:signing|logging) in\\b/iu;\n  const ready = controls.some((element) => {\n    const name = nameOf(element);\n    return !disabled(element) && readyName.test(name) && !busyName.test(name);\n  });\n  return { gate: gateText || loadingControl, ready, blank: text.trim() === \"\" };\n})()");
    if (state.gate) sawGate = true;
    if (signInControlSettled(state, Date.now() - started, sawGate)) return;
    await new Promise((resolve) => setTimeout(resolve, SIGN_IN_CONTROL_POLL_MS));
  }
}

test("teams-and-draw", async ({ app, agent, screen, browser }) => {
  const flow = flowChecks();
  await app.open("/");

  if (!skippedSteps.includes(0)) {
    await waitForSignInControl(browser);
    await agent.act("Sign in\nDo not do the next step yet: Open the Equipos tab");
  }
  await flow.check(0, async () => { await expect(await shownText(screen, "Sorteo")).toBeVisible({ timeout: 15000 }); }, async () => (await shownText(screen, "Sorteo")).isVisible());

  if (!skippedSteps.includes(1)) await agent.act("Open the Equipos tab\nDo not do the next step yet: Create a team named Leones Rojos and press Guardar", { maxModelCalls: 20 });
  await flow.check(1, async () => { await expect(await shownText(screen, "Equipos", true)).toBeVisible(); }, async () => (await shownText(screen, "Equipos", true)).isVisible());

  if (!skippedSteps.includes(2)) await agent.act("Create a team named Leones Rojos and press Guardar\nDo not do the next step yet: Create a team named Tigres Azules and press Guardar", { maxModelCalls: 20 });
  await flow.check(2, async () => { await expect(await shownText(screen, "Leones Rojos", true)).toBeVisible(); }, async () => (await shownText(screen, "Leones Rojos", true)).isVisible());

  if (!skippedSteps.includes(3)) await agent.act("Create a team named Tigres Azules and press Guardar\nDo not do the next step yet: Open the Sorteo tab", { maxModelCalls: 20 });
  await flow.check(3, async () => { await expect(await shownText(screen, "Tigres Azules", true)).toBeVisible(); }, async () => (await shownText(screen, "Tigres Azules", true)).isVisible());

  if (!skippedSteps.includes(4)) await agent.act("Open the Sorteo tab\nDo not do the next step yet: Create a round named Jornada 1 and press Crear jornada", { maxModelCalls: 20 });
  await flow.check(4, async () => { await expect(await shownText(screen, "Sorteo", true)).toBeVisible(); }, async () => (await shownText(screen, "Sorteo", true)).isVisible());

  if (!skippedSteps.includes(5)) await agent.act("Create a round named Jornada 1 and press Crear jornada\nDo not do the next step yet: Add a match with Leones Rojos as home team and Tigres Azules as away team and press Añadir partido", { maxModelCalls: 20 });
  await flow.check(5, async () => { await expect(await shownText(screen, "Jornada 1", true)).toBeVisible(); }, async () => (await shownText(screen, "Jornada 1", true)).isVisible());

  if (!skippedSteps.includes(6)) await agent.act("Add a match with Leones Rojos as home team and Tigres Azules as away team and press Añadir partido", { maxModelCalls: 20 });
  await flow.check(6, async () => { await expect(await shownText(screen, "Leones Rojos", true)).toBeVisible(); }, async () => (await shownText(screen, "Leones Rojos", true)).isVisible());
  await flow.check(7, async () => { await expect(await shownText(screen, "Tigres Azules", true)).toBeVisible(); }, async () => (await shownText(screen, "Tigres Azules", true)).isVisible());
});
