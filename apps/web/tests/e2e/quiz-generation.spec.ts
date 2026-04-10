import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("e2e@example.com");
  await page.getByLabel("Senha").fill("e2e-password");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

test("quiz generation uses the mocked SSE flow in E2E mode", async ({ page }) => {
  await login(page);
  await page.goto("/quizzes/new");

  await page.getByLabel("Título do quiz").fill("Revisao Intensiva");
  await page.getByLabel("Quantidade de questões").fill("3");
  await page.locator('input[type="file"]').setInputFiles(path.join(__dirname, "fixtures", "context.pdf"));
  await page.getByRole("button", { name: "Gerar quiz" }).click();

  await page.waitForURL("**/quizzes/e2e-generated-quiz");
  await expect(page.getByText("Quiz de Revisão Guiada")).toBeVisible();
  await expect(page.getByText("Matemática")).toBeVisible();
});
