import fetch from 'node-fetch';

const PAT = process.env.STORYBLOK_PAT || 'sb_pat__4vm2F5nre3ExCkNB_STKpfVxo3KFVsJANLt3zrzq3U';
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '293739294884912';
const BASE_URL = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`;
const HEADERS = { 'Authorization': PAT, 'Content-Type': 'application/json' };

async function main() {
  const res = await fetch(`${BASE_URL}/components`, { headers: HEADERS });
  const data = await res.json();
  const pageComponent = data.components.find(c => c.name === 'page');

  let schema = pageComponent.schema || {};

  // Define tabs
  schema.tab_content = {
    type: "tab",
    display_name: "Content",
    keys: ["headline", "description", "ctaText", "ctaLink", "body"]
  };

  schema.tab_seo = {
    type: "tab",
    display_name: "SEO",
    keys: [
      "metaTitle", "metaDescription", "metaKeywords", "canonicalUrl", 
      "ogTitle", "ogDescription", "ogImage", "authorName", "contentTags", "schemaJsonLd"
    ]
  };

  // Ensure content fields don't have dangling tab references and set order
  schema.headline.position = 0;
  schema.description.position = 1;
  schema.ctaText.position = 2;
  schema.ctaLink.position = 3;
  schema.body.position = 4;

  const updatePayload = { component: { ...pageComponent, schema } };
  const updateRes = await fetch(`${BASE_URL}/components/${pageComponent.id}`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify(updatePayload)
  });

  if (updateRes.ok) {
    console.log("✅ Successfully fixed tabs and reordered fields!");
  } else {
    console.error("❌ Failed to update component:", await updateRes.text());
  }
}

main();
