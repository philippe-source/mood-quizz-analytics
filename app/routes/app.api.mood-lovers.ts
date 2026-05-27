import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

const SUPA_URL = process.env.MOODLOVERS_SUPA_URL!;
const SUPA_KEY = process.env.MOODLOVERS_SUPA_SERVICE_KEY!;
const SH = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  "Content-Type": "application/json",
};

async function supa(path: string, opts: RequestInit = {}) {
  return fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: SH, ...opts, cache: "no-store" });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  if (!SUPA_URL || !SUPA_KEY) {
    return Response.json(
      { error: "MOODLOVERS_SUPA_URL et MOODLOVERS_SUPA_SERVICE_KEY manquants dans les variables d'environnement." },
      { status: 500 }
    );
  }

  try {
    const [pendingRes, approvedRes, votesRes] = await Promise.all([
      supa("compos?approved=eq.false&order=created_at.desc&select=*"),
      supa("compos?approved=eq.true&order=created_at.desc&select=*"),
      supa("votes?select=compo_id"),
    ]);
    const [pending, approved, votes] = await Promise.all([
      pendingRes.json(),
      approvedRes.json(),
      votesRes.json(),
    ]);

    const voteCounts: Record<string, number> = {};
    if (Array.isArray(votes)) {
      votes.forEach((v: { compo_id: string }) => {
        voteCounts[v.compo_id] = (voteCounts[v.compo_id] || 0) + 1;
      });
    }

    return Response.json({ pending, approved, voteCounts });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

  const { id, action } = await request.json();

  try {
    if (action === "approve") {
      const r = await supa(`compos?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({ approved: true }),
      });
      if (!r.ok) throw new Error(await r.text());
    } else if (action === "unpublish") {
      const r = await supa(`compos?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({ approved: false }),
      });
      if (!r.ok) throw new Error(await r.text());
    } else if (action === "reject") {
      const r = await supa(`compos?id=eq.${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
    } else {
      return Response.json({ error: "Action inconnue." }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
