import Link from "@/components/no-prefetch-link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid place-items-center rounded-full bg-primary text-primary-foreground font-bold overflow-hidden">
              <Image
                src="/logos/pomegrid_logo_white_bg.png"
                alt="Pomegrid"
                width={40}
                height={40}
              />
            </div>
            <div>
              <div className="font-bold">Pomegrid</div>
              <div className="text-xs opacity-80">Food Trade</div>
            </div>
          </div>
          <p className="mt-4 text-sm opacity-80 max-w-xs">
            Wholesale marketplace for Ghana's farm produce. Looking for fish?
            Visit aqua.pomegrid.com.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide opacity-80">
            Shop
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/shop" className="opacity-90 hover:opacity-100">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/whatsapp" className="opacity-90 hover:opacity-100">
                WhatsApp Groups
              </Link>
            </li>
            <li>
              <Link href="/cart" className="opacity-90 hover:opacity-100">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide opacity-80">
            Company
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className="opacity-90 hover:opacity-100">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="opacity-90 hover:opacity-100">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide opacity-80">
            Also from Pomegrid
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href="https://aqua.pomegrid.com"
                className="opacity-90 hover:opacity-100"
              >
                aqua.pomegrid.com — Fish wholesale
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="bg-black/10 py-4 text-center text-xs opacity-80">
        © {new Date().getFullYear()} Pomegrid Food Trade. All rights reserved.
      </div>
    </footer>
  );
}
