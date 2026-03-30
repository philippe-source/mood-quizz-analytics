import { BlockStack, Button, Card, Page, Text } from "@shopify/polaris";

export default function ExportsPage() {
  return (
    <Page title="Exports">
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Exports CSV
            </Text>

            <Button url="/app/api/export?mode=all">
              Exporter toutes les réponses
            </Button>

            <Button url="/app/api/export?mode=top300">
              Exporter top 300
            </Button>

            <Button url="/app/api/export?mode=ultra">
              Exporter ULTRA HIGH VALUE
            </Button>

            <Button url="/app/api/export?mode=high">
              Exporter HIGH POTENTIAL
            </Button>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}