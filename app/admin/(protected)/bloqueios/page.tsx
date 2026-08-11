import { listBlockedSlots } from "@/lib/data/blocks";
import { BlockManager } from "@/components/admin/block-manager";

export default function BloqueiosPage() {
  const blocks = listBlockedSlots();
  return (
    <div>
      <h1 className="text-xl font-semibold">Bloqueios</h1>
      <BlockManager blocks={blocks} />
    </div>
  );
}
