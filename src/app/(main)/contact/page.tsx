import { Mail, Phone, MessagesSquare } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contact — Pomegrid Food Trade",
  description:
    "Get in touch with Pomegrid Food Trade about wholesale orders and regional delivery.",
};

export default function Contact() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 lg:px-8">
      <h1 className="text-4xl font-bold">Contact us</h1>
      <p className="mt-3 text-muted-foreground">
        Reach out about wholesale orders, delivery, or to join a regional group.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-muted p-6">
          <Phone className="h-5 w-5 text-primary" />
          <div className="mt-3 text-sm font-semibold">Phone</div>
          <div className="mt-1 text-sm text-muted-foreground">
            +233 54 474 3630
          </div>
        </div>
        <div className="rounded-3xl bg-muted p-6">
          <Mail className="h-5 w-5 text-primary" />
          <div className="mt-3 text-sm font-semibold">Email</div>
          <div className="mt-1 text-sm text-muted-foreground">
            pomegrid@gmail.com
          </div>
        </div>
        <Link href="/whatsapp" className="">
          <div className="rounded-3xl bg-secondary p-6 text-secondary-foreground">
            <MessagesSquare className="h-5 w-5" />
            <div className="mt-3 text-sm font-semibold">WhatsApp</div>
            <div className="mt-1 text-sm opacity-90">
              Join a regional group for daily updates.
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
