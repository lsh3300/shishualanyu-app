import { test, expect } from '@playwright/test'

test.describe('smoke', () => {
  test('home loads and bottom nav works', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('bottom-nav')).toBeVisible()

    await page.getByTestId('bottom-nav-文创').click()
    await expect(page).toHaveURL(/\/store(\/|$)/)

    await page.getByTestId('bottom-nav-教学').click()
    await expect(page).toHaveURL(/\/teaching(\/|$)/)

    await page.getByTestId('bottom-nav-首页').click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByTestId('bottom-nav-我的').click()
    await expect(page).toHaveURL(/\/profile(\/|$)/)
  })

  test('home search navigates to search page and type tabs work', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('home-search-input').fill('蓝染')
    await page.getByTestId('home-search-submit').click()

    await expect(page).toHaveURL(/\/search\?/) 
    await expect(page.getByTestId('search-input')).toHaveValue('蓝染')

    await page.getByTestId('search-type-product').click()
    await expect(page).toHaveURL(/type=product/)
  })

  test('profile (logged out) shows login prompt', async ({ page }) => {
    await page.goto('/profile')

    await expect(page.getByTestId('bottom-nav')).toBeVisible()

    await expect(
      page.getByText('欢迎来到个人中心', { exact: true }),
    ).toBeVisible()
  })

  test('profile settings page renders header when logged out', async ({ page }) => {
    await page.goto('/profile/settings')

    await expect(page.getByTestId('subpage-header')).toBeVisible()
    await expect(page.getByTestId('subpage-title')).toHaveText('设置')
  })

  test('theme persists via localStorage and legacy system is sanitized', async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem('indigo-theme')) {
        localStorage.setItem('indigo-theme', 'indigo-gradient')
      }
    })

    await page.goto('/')

    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.classList.contains('indigo-gradient'))
    }).toBeTruthy()

    await page.evaluate(() => {
      localStorage.setItem('indigo-theme', 'system')
    })
    await page.reload()

    await expect.poll(async () => {
      return page.evaluate(() => localStorage.getItem('indigo-theme'))
    }).toBe('light')

    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.classList.contains('system'))
    }).toBeFalsy()
  })
})
