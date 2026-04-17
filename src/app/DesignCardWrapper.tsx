'use client';

import { useState } from 'react';
import DesignCard from '@/components/DesignCard';
import QuickShopModal from '@/components/QuickShopModal';
import { DesignSummary } from '@/data/shop';

export default function DesignCardWrapper({ design }: { design: DesignSummary }) {
  const [active, setActive] = useState<DesignSummary | null>(null);
  return (
    <>
      <DesignCard design={design} onQuickShop={setActive} />
      <QuickShopModal design={active} onClose={() => setActive(null)} />
    </>
  );
}
