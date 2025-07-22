import { test, expect } from "@playwright/test"

test.describe("Deep Reasoning System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should display reasoning path for deep analysis", async ({ page }) => {
    // Send a message that requires deep reasoning
    await page.fill('[data-testid="chat-input"]', "حلل هذه المشكلة الرياضية: ما هو الجذر التربيعي لـ 144؟")
    await page.click('[data-testid="send-button"]')

    // Wait for response
    await page.waitForSelector('[data-testid="message-response"]')

    // Check if reasoning path button appears
    const reasoningButton = page.locator('button:has-text("مسار التفكير")')
    await expect(reasoningButton).toBeVisible()

    // Click to expand reasoning
    await reasoningButton.click()

    // Verify reasoning steps are displayed
    await expect(page.locator('[data-testid="reasoning-step"]')).toHaveCount.greaterThan(0)

    // Check for analysis step
    await expect(page.locator("text=التحليل")).toBeVisible()

    // Check for reasoning step
    await expect(page.locator("text=التفكير")).toBeVisible()

    // Check for conclusion
    await expect(page.locator("text=الخلاصة")).toBeVisible()
  })

  test("should handle visual reasoning with images", async ({ page }) => {
    // Upload an image
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles("test-image.jpg")

    // Send visual analysis request
    await page.fill('[data-testid="chat-input"]', "حلل هذه الصورة وأخبرني ماذا ترى")
    await page.click('[data-testid="send-button"]')

    // Wait for visual analysis response
    await page.waitForSelector('[data-testid="message-response"]')

    // Check for visual reasoning badge
    await expect(page.locator("text=تحليل مرئي")).toBeVisible()

    // Expand reasoning path
    await page.click('button:has-text("مسار التفكير")')

    // Verify visual analysis steps
    await expect(page.locator("text=الوصف المرئي")).toBeVisible()
    await expect(page.locator("text=التحليل التفصيلي")).toBeVisible()
  })

  test("should show chain of thought for problem solving", async ({ page }) => {
    // Send a complex problem
    await page.fill('[data-testid="chat-input"]', "إذا كان لدي 10 تفاحات وأعطيت 3 لأحمد و 2 لفاطمة، كم تفاحة تبقى معي؟")
    await page.click('[data-testid="send-button"]')

    await page.waitForSelector('[data-testid="message-response"]')

    // Expand reasoning
    await page.click('button:has-text("مسار التفكير")')

    // Check for step-by-step solution
    await expect(page.locator("text=فهم المشكلة")).toBeVisible()
    await expect(page.locator("text=خطوات الحل")).toBeVisible()
    await expect(page.locator("text=الإجابة النهائية")).toBeVisible()
  })

  test("should display confidence levels for reasoning steps", async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', "ما هي عاصمة فرنسا؟")
    await page.click('[data-testid="send-button"]')

    await page.waitForSelector('[data-testid="message-response"]')
    await page.click('button:has-text("مسار التفكير")')

    // Check for confidence badges
    const confidenceBadges = page.locator('[data-testid="confidence-badge"]')
    await expect(confidenceBadges.first()).toBeVisible()

    // Verify confidence percentage is displayed
    await expect(page.locator("text=/\\d+%/")).toBeVisible()
  })

  test("should support both Arabic and English reasoning", async ({ page }) => {
    // Test Arabic reasoning
    await page.fill('[data-testid="chat-input"]', "اشرح لي نظرية فيثاغورس")
    await page.click('[data-testid="send-button"]')

    await page.waitForSelector('[data-testid="message-response"]')
    await page.click('button:has-text("مسار التفكير")')

    await expect(page.locator("text=تفكير عميق")).toBeVisible()

    // Clear and test English
    await page.click('[data-testid="new-chat"]')
    await page.fill('[data-testid="chat-input"]', "Explain the Pythagorean theorem")
    await page.click('[data-testid="send-button"]')

    await page.waitForSelector('[data-testid="message-response"]')
    await page.click('button:has-text("Reasoning Path")')

    await expect(page.locator("text=Deep Reasoning")).toBeVisible()
  })

  test("should allow expanding and collapsing individual reasoning steps", async ({ page }) => {
    await page.fill('[data-testid="chat-input"]', "حل هذه المعادلة: 2x + 5 = 15")
    await page.click('[data-testid="send-button"]')

    await page.waitForSelector('[data-testid="message-response"]')
    await page.click('button:has-text("مسار التفكير")')

    // Find first reasoning step
    const firstStep = page.locator('[data-testid="reasoning-step"]').first()

    // Click to expand
    await firstStep.click()
    await expect(firstStep.locator('[data-testid="step-content"]')).toBeVisible()

    // Click to collapse
    await firstStep.click()
    await expect(firstStep.locator('[data-testid="step-content"]')).toBeHidden()
  })
})
