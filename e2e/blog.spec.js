const { test, expect } = require('@playwright/test');

const expectedPostTitles = [
  'Will AI Take Our Jobs? History Suggests a Different Story',
  'How to Use AI to Learn a Language Faster',
  'How to Back Up Your Server (Before You Wish You Had)',
];

const expectedPostSlugs = [
  '/blog/will-ai-take-our-jobs-history-suggests-a-different-story',
  '/blog/how-to-use-ai-to-learn-a-language-faster',
  '/blog/how-to-back-up-your-server-before-you-wish-you-had',
];

test.describe('/blog', () => {
  test('loads the blog index with featured article cards', async ({ page }) => {
    const response = await page.goto('/blog');

    expect(response).not.toBeNull();
    expect(response.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole('heading', { name: 'Ideas on technology, learning, and work' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Start here' })).toBeVisible();

    for (const title of expectedPostTitles) {
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
    }
  });

  test('can be opened from the navbar', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Blog' }).first().click();

    await page.waitForURL('**/blog');
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole('heading', { name: 'Ideas on technology, learning, and work' })).toBeVisible();
  });

  test('links to every visible blog post page', async ({ page }) => {
    await page.goto('/blog');

    for (const slug of expectedPostSlugs) {
      const link = page.locator(`a[href="${slug}"]`).first();
      await expect(link).toBeVisible();
    }
  });
});

test.describe('/blog/[slug]', () => {
  for (const title of expectedPostTitles) {
    test(`loads blog post: ${title}`, async ({ page }) => {
      await page.goto('/blog');
      await page.getByRole('heading', { name: title }).getByRole('link').click();

      await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
      await expect(page.getByText('Written by')).toBeVisible();
      await expect(page.getByRole('link', { name: '← Back to blog' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Other blog posts' })).toBeVisible();
    });
  }

  test('renders rich-text lists with visible bullet styling', async ({ page }) => {
    await page.goto('/blog/how-to-use-ai-to-learn-a-language-faster');

    const firstList = page.locator('.blog-post__section ul').first();
    const firstListItem = page.locator('.blog-post__section li').first();

    await expect(firstListItem).toContainText('Practice conversations anytime');
    await expect(firstList).toHaveCSS('list-style-type', 'disc');
    await expect(firstListItem).toHaveCSS('display', 'list-item');
  });

  test('renders rich-text quotes', async ({ page }) => {
    await page.goto('/blog/how-to-use-ai-to-learn-a-language-faster');

    const quote = page.getByText('I am learning French at an A2 level. Have a conversation with me.');

    await expect(quote).toBeVisible();
    await expect(page.locator('.blog-post__section blockquote').first()).toBeVisible();
  });

  test('renders the cover image on blog post pages when populated', async ({ page }) => {
    await page.goto('/blog/how-to-use-ai-to-learn-a-language-faster');

    const cover = page.locator('.blog-post__cover img');

    await expect(cover).toBeVisible();
    await expect(cover).toHaveAttribute('src', /uploads|_next\/image/);
  });

  test('shows author bio and public profile near the bottom', async ({ page }) => {
    await page.goto('/blog/how-to-use-ai-to-learn-a-language-faster');

    await expect(page.getByText('The author')).toBeVisible();
    await expect(page.getByText('language lover, web builder, and digital marketing professional')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View public profile' })).toHaveAttribute(
      'href',
      /linkedin\.com\/in\/loc-dang-7ab66222/
    );
  });
});
