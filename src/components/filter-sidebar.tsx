import type { FilterGroup } from "@/lib/types";

export function FilterSidebar({ groups }: { groups: FilterGroup[] }) {
  return (
    <aside className="rounded-[14px] border border-border-soft bg-surface p-[22px] lg:sticky lg:top-[110px]">
      {groups.map((group) => (
        <div key={group.id} className="mb-6">
          <div className="mb-3 font-mono-ui text-[11px] uppercase tracking-[0.07em] text-text-tertiary">
            {group.label}
          </div>
          <div className="flex flex-col gap-2.5">
            {group.options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-text-list"
              >
                <span className="h-3.5 w-3.5 rounded border border-border-hover" />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="border-t border-border pt-[18px] text-[12.5px] leading-relaxed text-text-tertiary">
        Seuls les vendeurs dont l&apos;identité est validée peuvent publier.
      </div>
    </aside>
  );
}
