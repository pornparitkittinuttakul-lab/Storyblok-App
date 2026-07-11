import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAT = process.env.STORYBLOK_PAT || 'sb_pat__4vm2F5nre3ExCkNB_STKpfVxo3KFVsJANLt3zrzq3U';
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '293739294884912';

const BASE_URL = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`;

const HEADERS = {
  'Authorization': PAT,
  'Content-Type': 'application/json',
};

async function main() {
  try {
    console.log(`🔍 Fetching components in space ${SPACE_ID}...`);
    const res = await fetch(`${BASE_URL}/components`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch components: ${res.statusText}`);
    const data = await res.json();
    
    const pageComponent = data.components.find(c => c.name === 'page');
    if (!pageComponent) {
      throw new Error("Could not find a component named 'page'");
    }

    console.log(`Found 'page' component (ID: ${pageComponent.id}). Updating schema...`);

    const schema = pageComponent.schema || {};

    // 1. Content Fields
    schema.headline = { type: "text", position: 1, display_name: "H1 / Headline" };
    schema.description = { type: "textarea", position: 2, display_name: "Subtext / Description" };
    schema.ctaText = { type: "text", position: 3, display_name: "CTA Button Text" };
    schema.ctaLink = { type: "text", position: 4, display_name: "CTA Link (e.g. /contact)" };

    // 2. SEO Fields (Grouped under a tab called "SEO")
    const seoKeys = [
      "metaTitle", "metaDescription", "metaKeywords", "canonicalUrl", 
      "ogTitle", "ogDescription", "ogImage", "authorName", "contentTags", "schemaJsonLd"
    ];

    schema.metaTitle = { type: "text", tab: "SEO", display_name: "Meta Title" };
    schema.metaDescription = { type: "textarea", tab: "SEO", display_name: "Meta Description" };
    schema.metaKeywords = { type: "text", tab: "SEO", display_name: "Meta Keywords (comma separated)" };
    schema.canonicalUrl = { type: "text", tab: "SEO", display_name: "Canonical URL" };
    schema.ogTitle = { type: "text", tab: "SEO", display_name: "OG Title" };
    schema.ogDescription = { type: "textarea", tab: "SEO", display_name: "OG Description" };
    schema.ogImage = { type: "asset", tab: "SEO", display_name: "OG Image", filetypes: ["images"] };
    schema.authorName = { type: "text", tab: "SEO", display_name: "Author Name" };
    schema.contentTags = { type: "text", tab: "SEO", display_name: "Content Tags (comma separated)" };
    schema.schemaJsonLd = { type: "textarea", tab: "SEO", display_name: "Schema JSON-LD (Raw JSON)" };

    // Update the component
    const updatePayload = {
      component: {
        ...pageComponent,
        schema
      }
    };

    const updateRes = await fetch(`${BASE_URL}/components/${pageComponent.id}`, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(updatePayload)
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error(`❌ Failed to update component:`, errorText);
    } else {
      console.log(`✅ Successfully updated 'page' schema with dynamic fields and SEO!`);
    }

  } catch (error) {
    console.error('Error during schema update:', error);
  }
}

main();
