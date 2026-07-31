export const metadata = {
  title: "About — Pomegrid Food Trade",
  description:
    "Pomegrid Food Trade sources wholesale farm produce across Ghana for resellers, restaurants and markets.",
};

import Link from "@/components/no-prefetch-link";
export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 lg:px-8">
      <h1 className="text-4xl font-bold">About Pomegrid Food Trade</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We connect Ghanaian farmers to resellers, wholesalers, restaurants and
        market vendors — moving graded farm produce in bulk, at fair prices.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-muted p-6">
          <h2 className="text-lg font-semibold">What we sell</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Yam, cassava products, tomatoes, pepper, grains, legumes, oils,
            vegetables — everything from the farm except fish.
          </p>
        </div>
        <div className="rounded-3xl bg-muted p-6">
          <h2 className="text-lg font-semibold">Looking for fish?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fish is handled by our sister platform at{" "}
            <a
              className="text-primary font-semibold"
              href="https://aqua.pomegrid.com"
            >
              aqua.pomegrid.com
            </a>
            .
          </p>
        </div>
        <div className="rounded-3xl bg-primary-soft p-6">
          <h2 className="text-lg font-semibold text-primary">Nationwide</h2>
          <p className="mt-2 text-sm text-primary/80">
            Regional WhatsApp groups keep buyers informed across all 16 regions
            of Ghana.
          </p>
        </div>
        <div className="rounded-3xl bg-secondary-soft p-6">
          <h2 className="text-lg font-semibold text-secondary">Fair pricing</h2>
          <p className="mt-2 text-sm text-secondary/80">
            Wholesale pricing, updated daily via WhatsApp and the online
            catalog.
          </p>
        </div>
      </div>
    </div>
  );
}
