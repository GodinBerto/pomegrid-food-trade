import Link from "next/link";
import { MessagesSquare } from "lucide-react";

export const metadata = {
  title: "WhatsApp Groups by Region — Pomegrid",
  description:
    "Join the Pomegrid Food Trade WhatsApp group for your region in Ghana.",
};

// Assuming regions exist, for now mocked
const groups = [
  {
    id: 1,
    region: "Western Region",
    description: "Sekondi-Takoradi and surrounding areas",
    invite_url: "https://chat.whatsapp.com/sample",
  },
  {
    id: 2,
    region: "Greater Accra",
    description: "Accra, Tema, and surrounding areas",
    invite_url: null,
  },
  {
    id: 3,
    region: "Ashanti",
    description: "Kumasi and surrounding areas",
    invite_url: null,
  },
  {
    id: 4,
    region: "Northern",
    description: "Tamale and surrounding areas",
    invite_url: null,
  },
];

export default function WhatsappPage() {
  return (
    <div>
      {/* Full-width banner */}
      <section className="relative overflow-hidden">
        <img
          src="/images/bgs/whatsapp-banner.jpg"
          alt="Traders on WhatsApp at a Ghanaian market"
          width={1920}
          height={720}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-primary-foreground lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur">
              Regional Groups
            </div>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Join your region's WhatsApp group
            </h1>
            <p className="mt-3 max-w-2xl opacity-95">
              Get daily wholesale prices, availability updates and delivery info
              from Pomegrid Food Trade — sorted by your region in Ghana.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.id} className="rounded-3xl bg-muted p-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
                <MessagesSquare className="h-5 w-5" />
              </div>
              <div className="mt-4 text-lg font-semibold">
                {g.region} Region
              </div>
              {g.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {g.description}
                </p>
              )}
              {g.invite_url ? (
                <a
                  href={g.invite_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground"
                >
                  Join group
                </a>
              ) : (
                <div className="mt-5 inline-block rounded-full bg-background px-5 py-2 text-sm font-medium text-muted-foreground">
                  Coming soon
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-primary-soft p-8 text-primary lg:p-10">
          <h2 className="text-xl font-bold">Not sure which group?</h2>
          <p className="mt-1 text-sm text-primary/80">
            Send us a message and we'll connect you to the right one.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
