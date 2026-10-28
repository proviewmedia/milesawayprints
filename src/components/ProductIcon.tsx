import { Shirt, HardHat, ShoppingBag, Coffee, Sticker, Image as ImageIcon, Signpost, Gift, Sparkles, type LucideIcon } from 'lucide-react';
import type { CustomProduct } from '@/data/custom';

const ICONS: Record<CustomProduct['icon'], LucideIcon> = {
  shirt: Shirt,
  hardHat: HardHat,
  shoppingBag: ShoppingBag,
  coffee: Coffee,
  sticker: Sticker,
  frame: ImageIcon,
  signpost: Signpost,
  gift: Gift,
  sparkles: Sparkles,
};

export default function ProductIcon({ icon, size = 20, className }: { icon: CustomProduct['icon']; size?: number; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}
