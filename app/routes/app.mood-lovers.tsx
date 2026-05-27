import { useState, useEffect, useCallback } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  DataTable,
  EmptyState,
  InlineGrid,
  InlineStack,
  Page,
  SkeletonBodyText,
  Tabs,
  Text,
} from "@shopify/polaris";

type Compo = {
  id: string;
  name: string;
  city: string;
  description: string | null;
  instagram: string | null;
  image_url: string;
  approved: boolean;
  created_at: string;
};

type ApiData = {
  pending: Compo[];
  approved: Compo[];
  voteCounts: Record<string, number>;
  error?: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function CompoPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: "100%",
        aspectRatio: "1",
        objectFit: "cover",
        borderRadius: "8px",
        display: "block",
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).style.background = "#F5ECD9";
        (e.target as HTMLImageElement).style.minHeight = "120px";
      }}
    />
  );
}

export default function MoodLoversPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/app/api/mood-lovers");
      setData(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject" | "unpublish") {
    setActing(id);
    await fetch("/app/api/mood-lovers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setActing(null);
    load();
  }

  const { pending = [], approved = [], voteCounts = {} } = data ?? {};

  const totalVotes = Object.values(voteCounts).reduce((s, v) => s + v, 0);
  const cities = new Set([...pending, ...approved].map((c) => c.city)).size;
  const totalAll = pending.length + approved.length;
  const validationRate = totalAll > 0 ? Math.round((approved.length / totalAll) * 100) : 0;

  const contributors: Record<string, { count: number; city: string; votes: number }> = {};
  approved.forEach((c) => {
    if (!contributors[c.name]) contributors[c.name] = { count: 0, city: c.city, votes: 0 };
    contributors[c.name].count++;
    contributors[c.name].votes += voteCounts[c.id] || 0;
  });
  const topContributors = Object.entries(contributors)
    .sort(([, a], [, b]) => b.count - a.count || b.votes - a.votes)
    .slice(0, 8);

  const topByVotes = [...approved]
    .map((c) => ({ ...c, votes: voteCounts[c.id] || 0 }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 8);

  const tabs = [
    {
      id: "pending",
      content: (
        <InlineStack gap="200" blockAlign="center">
          <span>En attente</span>
          {pending.length > 0 && <Badge tone="attention">{String(pending.length)}</Badge>}
        </InlineStack>
      ) as unknown as string,
      panelID: "pending-panel",
    },
    {
      id: "published",
      content: `Publiées (${approved.length})`,
      panelID: "published-panel",
    },
    {
      id: "analytics",
      content: "Analytics",
      panelID: "analytics-panel",
    },
  ];

  if (loading && !data) {
    return (
      <Page title="Mood Lovers · Galerie" subtitle="Modération des compos clientes">
        <Card>
          <SkeletonBodyText lines={5} />
        </Card>
      </Page>
    );
  }

  if (data?.error) {
    return (
      <Page title="Mood Lovers · Galerie">
        <Banner title="Erreur de connexion Supabase" tone="critical">
          <p>{data.error}</p>
        </Banner>
      </Page>
    );
  }

  return (
    <Page
      title="Mood Lovers · Galerie"
      subtitle={`${totalAll} soumissions · ${approved.length} publiées · ${totalVotes} votes`}
      primaryAction={{ content: "↻ Actualiser", onAction: load, loading }}
    >
      <BlockStack gap="400">
        <Tabs tabs={tabs} selected={tabIndex} onSelect={setTabIndex} />

        {/* ─── EN ATTENTE ─── */}
        {tabIndex === 0 && (
          pending.length === 0 ? (
            <Card>
              <EmptyState
                heading="Aucune compo en attente"
                image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
              >
                <p>Toutes les soumissions ont été traitées ✓</p>
              </EmptyState>
            </Card>
          ) : (
            <InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="400">
              {pending.map((c) => (
                <Card key={c.id}>
                  <BlockStack gap="300">
                    <CompoPhoto src={c.image_url} alt={c.name} />
                    <BlockStack gap="100">
                      <Text variant="bodyMd" as="p" fontWeight="semibold">{c.name}</Text>
                      <Text variant="bodySm" as="p" tone="subdued">📍 {c.city}</Text>
                      {c.description && (
                        <Text variant="bodySm" as="p">{c.description}</Text>
                      )}
                      {c.instagram && (
                        <Text variant="bodySm" as="p" tone="subdued">{c.instagram}</Text>
                      )}
                      <Text variant="bodySm" as="p" tone="subdued">{formatDate(c.created_at)}</Text>
                    </BlockStack>
                    <InlineStack gap="200">
                      <Box width="50%">
                        <Button
                          variant="primary"
                          tone="success"
                          loading={acting === c.id}
                          onClick={() => act(c.id, "approve")}
                          fullWidth
                        >
                          ✓ Publier
                        </Button>
                      </Box>
                      <Box width="50%">
                        <Button
                          variant="primary"
                          tone="critical"
                          loading={acting === c.id}
                          onClick={() => act(c.id, "reject")}
                          fullWidth
                        >
                          ✕ Refuser
                        </Button>
                      </Box>
                    </InlineStack>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          )
        )}

        {/* ─── PUBLIÉES ─── */}
        {tabIndex === 1 && (
          approved.length === 0 ? (
            <Card>
              <EmptyState
                heading="Aucune compo publiée"
                image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
              >
                <p>Validez des soumissions depuis l'onglet "En attente".</p>
              </EmptyState>
            </Card>
          ) : (
            <InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="400">
              {approved.map((c) => (
                <Card key={c.id}>
                  <BlockStack gap="300">
                    <CompoPhoto src={c.image_url} alt={c.name} />
                    <BlockStack gap="100">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text variant="bodyMd" as="p" fontWeight="semibold">{c.name}</Text>
                        <Badge tone="success">❤️ {voteCounts[c.id] || 0}</Badge>
                      </InlineStack>
                      <Text variant="bodySm" as="p" tone="subdued">📍 {c.city}</Text>
                      {c.description && (
                        <Text variant="bodySm" as="p">{c.description}</Text>
                      )}
                    </BlockStack>
                    <Button
                      variant="secondary"
                      tone="critical"
                      loading={acting === c.id}
                      onClick={() => act(c.id, "unpublish")}
                      fullWidth
                    >
                      Dépublier
                    </Button>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          )
        )}

        {/* ─── ANALYTICS ─── */}
        {tabIndex === 2 && (
          <BlockStack gap="400">
            <InlineGrid columns={{ xs: 2, md: 5 }} gap="400">
              {[
                { label: "En attente", value: pending.length, tone: pending.length > 0 ? "attention" : "success" },
                { label: "Publiées", value: approved.length, tone: "success" },
                { label: "Votes totaux", value: totalVotes, tone: "info" },
                { label: "Villes", value: cities, tone: "info" },
                { label: "Taux validation", value: `${validationRate}%`, tone: validationRate >= 50 ? "success" : "attention" },
              ].map(({ label, value, tone }) => (
                <Card key={label}>
                  <BlockStack gap="100">
                    <Text variant="bodySm" as="p" tone="subdued">{label}</Text>
                    <Text variant="heading2xl" as="p">{value}</Text>
                    <Badge tone={tone as "success" | "attention" | "info"}>{label}</Badge>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>

            {topContributors.length > 0 && (
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">Top Mood Lovers</Text>
                  <DataTable
                    columnContentTypes={["text", "text", "numeric", "numeric"]}
                    headings={["Mood Lover", "Ville", "Compos", "Votes reçus"]}
                    rows={topContributors.map(([name, { city, count, votes }]) => [
                      name,
                      city,
                      count,
                      `❤️ ${votes}`,
                    ])}
                  />
                </BlockStack>
              </Card>
            )}

            {topByVotes.length > 0 && (
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">Compos les plus aimées</Text>
                  <DataTable
                    columnContentTypes={["text", "text", "text", "numeric"]}
                    headings={["Mood Lover", "Ville", "Compo", "Votes"]}
                    rows={topByVotes.map((c) => [
                      c.name,
                      c.city,
                      (c.description ?? "—").slice(0, 45) +
                        ((c.description?.length ?? 0) > 45 ? "…" : ""),
                      `❤️ ${c.votes}`,
                    ])}
                  />
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        )}
      </BlockStack>
    </Page>
  );
}
