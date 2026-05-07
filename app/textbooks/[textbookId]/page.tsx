import { notFound } from "next/navigation";

import { TextbookSelectionFlow } from "@/components/textbooks/textbook-selection-flow";
import { requireSession } from "@/lib/auth-session";
import { getTextbookById } from "@/lib/textbooks";

type TextbookPageProps = {
  params: Promise<{
    textbookId: string;
  }>;
  searchParams: Promise<{
    unit?: string;
    section?: string;
  }>;
};

export default async function TextbookPage({ params, searchParams }: TextbookPageProps) {
  await requireSession();

  const { textbookId } = await params;
  const { unit, section } = await searchParams;
  const textbook = await getTextbookById(textbookId);

  if (!textbook) {
    notFound();
  }

  return (
    <TextbookSelectionFlow
      textbookId={textbook.id}
      textbookName={textbook.name}
      description={textbook.description}
      rootScope={
        textbook.rootScope
          ? {
              id: textbook.rootScope.id,
              title: textbook.rootScope.title,
              wordListId: textbook.rootScope.wordListId,
              wordCount: textbook.rootScope.wordCount,
            }
          : null
      }
      units={textbook.units.map((unitNode) => ({
        id: unitNode.id,
        title: unitNode.title,
        wordListId: unitNode.wordListId,
        wordCount: unitNode.wordCount,
        sections: unitNode.sections.map((sectionNode) => ({
          id: sectionNode.id,
          title: sectionNode.title,
          wordListId: sectionNode.wordListId,
          wordCount: sectionNode.wordCount,
        })),
      }))}
      selectedUnitId={unit}
      selectedSectionId={section}
    />
  );
}
