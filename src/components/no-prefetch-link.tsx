"use client";

import Link from "next/link";
import * as React from "react";

const NoPrefetchLink = React.forwardRef<HTMLAnchorElement, any>(
  function NoPrefetchLink(props: any, ref) {
    // Force prefetch to false to avoid automatic RSC prefetch requests
    return <Link {...props} prefetch={false} ref={ref} />;
  },
);

export default NoPrefetchLink;
