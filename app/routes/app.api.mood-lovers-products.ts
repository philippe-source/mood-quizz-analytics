import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

const SUPA_URL = process.env.MOODLOVERS_SUPA_URL!;
const SUPA_KEY = process.env.MOODLOVERS_SUPA_SERVICE_KEY!;

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() || "";
  if (!q) return Response.json({ products: [] });

  const res = await admin.graphql(
    `#graphql
    query SearchProducts($query: String!) {
      products(first: 8, query: $query) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }`,
    { variables: { query: `title:${q}` } }
  );
  const data = await res.json();
  const products = (data.data?.products?.edges ?? []).map(({ node }: { node: { id: string; title: string; handle: string } }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    url: `https://yourmood.net/products/${node.handle}`,
  }));
  return Response.json({ products });
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  const { compoId, products } = await request.json();

  const r = await fetch(`${SUPA_URL}/rest/v1/compos?id=eq.${compoId}`, {
    method: "PATCH",
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ products }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(await r.text());
  return Response.json({ ok: true });
}
