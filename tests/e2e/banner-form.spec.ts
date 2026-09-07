import { test, expect } from '@playwright/test'

test.describe('بنر صفحات فرود — فرم', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/banner/form/new')
  })

  test('پیش‌نمایش زنده به‌روز می‌شود با تغییر فرم', async ({ page }) => {
    // تیتر
    await page.fill('input[name="title"]', 'تیتر تست')
    await expect(page.locator('.banner-card__title')).toContainText('تیتر تست')

    // توضیح
    await page.fill('textarea[name="description"]', 'توضیح تست')
    await expect(page.locator('.banner-card__description')).toContainText('توضیح تست')

    // متن دکمه
    await page.fill('input[name="button_text"]', 'ثبت رایگان')
    await expect(page.locator('.banner-card__button')).toContainText('ثبت رایگان')

    // لینک دکمه
    await page.fill('input[name="button_link"]', '/search/type-villa')
    await expect(page.locator('.banner-card__button')).toHaveAttribute('href', '/search/type-villa')
  })

  test('زمان شروع و پایان معتبر است', async ({ page }) => {
    // انتخاب زمان
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const startsInput = page.locator('input[type="datetime-local"]').first()
    const endsInput = page.locator('input[type="datetime-local"]').last()

    // تنظیم زمان شروع
    const startsString = now.toISOString().slice(0, 16)
    await startsInput.fill(startsString)

    // تنظیم زمان پایان (بعد از شروع)
    const endsString = tomorrow.toISOString().slice(0, 16)
    await endsInput.fill(endsString)

    // ذخیره
    await page.click('button:has-text("اضافه کردن")')

    // پیام موفقیت
    await expect(page.locator('.toast')).toContainText('ثبت شد')
  })

  test('زمان پایان باید بعد از زمان شروع باشد', async ({ page }) => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const startsInput = page.locator('input[type="datetime-local"]').first()
    const endsInput = page.locator('input[type="datetime-local"]').last()

    // زمان شروع: امروز
    await startsInput.fill(now.toISOString().slice(0, 16))

    // زمان پایان: دیروز
    await endsInput.fill(yesterday.toISOString().slice(0, 16))

    // ذخیره
    await page.click('button:has-text("اضافه کردن")')

    // پیام خطا
    await expect(page.locator('.toast')).toContainText('زمان پایان باید بعد از زمان شروع باشد')
  })

  test('dropdown جایگاه معتبر', async ({ page }) => {
    // انتخاب جایگاه
    await page.selectOption('select[name="placement"]', 'landing-type-villa')

    // بررسی اینکه تیتر به‌روز می‌شود
    await expect(page.locator('.banner-card__title')).toBeVisible()
  })

  test('ذخیره با تمام فیلدها', async ({ page }) => {
    // پر کردن فرم
    await page.selectOption('select[name="placement"]', 'landing')
    await page.fill('input[name="title"]', 'تیتر تست')
    await page.fill('textarea[name="description"]', 'توضیح تست')
    await page.fill('input[name="button_text"]', 'ثبت رایگان')
    await page.fill('input[name="button_link"]', '/search/type-villa')

    // ذخیره
    await page.click('button:has-text("اضافه کردن")')

    // پیام موفقیت
    await expect(page.locator('.toast')).toContainText('ثبت شد')

    // بازگشت به لیست
    await expect(page).toHaveURL('/banner')
  })
})
