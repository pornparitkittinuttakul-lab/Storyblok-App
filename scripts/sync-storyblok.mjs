import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import site routes
import { SITE_ROUTES } from '../src/utils/site.js';

const PAT = process.env.STORYBLOK_PAT || 'sb_pat__4vm2F5nre3ExCkNB_STKpfVxo3KFVsJANLt3zrzq3U';
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '293739294884912';

const BASE_URL = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`;

const HEADERS = {
  'Authorization': PAT,
  'Content-Type': 'application/json',
};

async function getExistingStories() {
  const res = await fetch(`${BASE_URL}/stories?per_page=100`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Failed to fetch stories: ${res.statusText}`);
  const data = await res.json();
  return data.stories || [];
}

async function createStory(route) {
  const payload = {
    story: {
      name: route.label,
      slug: route.storyblokSlug,
      content: {
        component: "page",
        // We can pre-fill some SEO defaults to be managed in CMS
        metaTitle: route.seo.metaTitle,
        metaDescription: route.seo.metaDescription
      },
      is_folder: false,
      publish: 1 // Publish immediately
    }
  };

  const res = await fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ Failed to create ${route.label} (${route.storyblokSlug}):`, errorText);
  } else {
    console.log(`✅ Created ${route.label} (${route.storyblokSlug})`);
  }
}

async function main() {
  try {
    console.log(`🔍 Fetching existing stories in space ${SPACE_ID}...`);
    const existingStories = await getExistingStories();
    const existingSlugs = existingStories.map(s => s.slug);

    console.log(`Found ${existingStories.length} existing stories.`);

    let createdCount = 0;
    for (const route of SITE_ROUTES) {
      // Home usually exists as 'home', let's skip if it exists
      if (existingSlugs.includes(route.storyblokSlug)) {
        console.log(`⏩ Skipping ${route.label} (${route.storyblokSlug}) - already exists.`);
        continue;
      }
      
      await createStory(route);
      createdCount++;
    }

    console.log(`\n🎉 Sync complete! Created ${createdCount} new stories.`);
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

main();
