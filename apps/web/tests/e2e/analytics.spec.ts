import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("e2e@example.com");
  await page.getByLabel("Senha").fill("e2e-password");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

test("analytics dashboard and history render the critical study signals", async ({ page }) => {
  await login(page);

  await expect(page.getByText("Desempenho por período")).toBeVisible();
  await expect(page.getByText("Subtópicos frágeis")).toBeVisible();

  await page.goto("/history");
  await expect(page.getByText("Resultados para revisão contínua.")).toBeVisible();
  await expect(page.getByRole("button", { name: /exportar pdf/i })).toBeVisible();
});
