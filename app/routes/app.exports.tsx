import { useState } from "react";
import { BlockStack, Button, Card, Page, Tabs, Text } from "@shopify/polaris";

const CAMPAIGNS = [
  { id: "cercle-100-avril", content: "Cercle 100 — Avril 2026", panelID: "cercle-100-avril" },
  { id: "muses-mai-2026", content: "Muses de Mai 2026", panelID: "muses-mai-2026" },
];

async function downloadExport(campaign: string, mode: string) {
  const response = await fetch(`/app/api/export?campaign=${campaign}&mode=${mode}`);
  if (!response.ok) return;
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `quiz-${campaign}-${mode}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportsPage() {
  const [campaignIndex, setCampaignIndex] = useState(0);
  const campaign = CAMPAIGNS[campaignIndex].id;

  return (
    <Page title="Exports">
      <BlockStack gap="400">
        <Tabs tabs={CAMPAIGNS} selected={campaignIndex} onSelect={setCampaignIndex}>
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Exports CSV
              </Text>

              <Button onClick={() => downloadExport(campaign, "all")}>
                Exporter toutes les réponses
              </Button>

              <Button onClick={() => downloadExport(campaign, "top300")}>
                Exporter top 300
              </Button>

              <Button onClick={() => downloadExport(campaign, "ultra")}>
                Exporter ULTRA HIGH VALUE
              </Button>

              <Button onClick={() => downloadExport(campaign, "high")}>
                Exporter HIGH POTENTIAL
              </Button>
            </BlockStack>
          </Card>
        </Tabs>
      </BlockStack>
    </Page>
  );
}
