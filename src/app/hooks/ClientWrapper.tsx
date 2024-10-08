"use client";

import React from "react";

function ClientOnly({
  children,
  ...delegated
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <React.Fragment {...delegated}>{children}</React.Fragment>;
}

export default ClientOnly;
