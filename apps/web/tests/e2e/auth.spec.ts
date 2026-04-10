import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("e2e@example.com");
  await page.getByLabel("Senha").fill("e2e-password");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

test("critical auth flow redirects into the dashboard", async ({ page }) => {
  await login(page);

  await expect(page.getByText("Operação diária do estudo assistido.")).toBeVisible();
  await expect(page.getByText("E2E Student")).toBeVisible();
});
