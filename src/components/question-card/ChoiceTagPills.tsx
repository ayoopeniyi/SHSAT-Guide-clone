import React from "react";
import { Tag } from "lucide-react";
import type { ChoiceTag } from "../../services/tagService";

interface ChoiceTagPillsProps {
  tags: ChoiceTag[];
}

export const ChoiceTagPills: React.FC<ChoiceTagPillsProps> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {tags.map((tag, i) => (
        <span
          key={`${tag.tag_name}-${i}`}
          title={tag.rationale || undefined}
          className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold px-1.5 py-0.5 rounded"
        >
          <Tag className="h-2.5 w-2.5 shrink-0" />
          {tag.tag_name}
        </span>
      ))}
    </div>
  );
};
