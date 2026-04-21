import { BlockStack, Button, Card, Page, Text } from "@shopify/polaris";

async function downloadExport(mode: string) {
  const response = await fetch(`/app/api/export?mode=${mode}`);
  if (!response.ok) return;
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `quiz-${mode}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportsPage() {
  return (
    <Page title="Exports">
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Exports CSV
            </Text>

            <Button onClick={() => downloadExport("all")}>
              Exporter toutes les réponses
            </Button>

            <Button onClick={() => downloadExport("top300")}>
              Exporter top 300
            </Button>

            <Button onClick={() => downloadExport("ultra")}>
              Exporter ULTRA HIGH VALUE
            </Button>

            <Button onClick={() => downloadExport("high")}>
              Exporter HIGH POTENTIAL
            </Button>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}