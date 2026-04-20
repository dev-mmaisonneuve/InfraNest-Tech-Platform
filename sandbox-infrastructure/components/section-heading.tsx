type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  h1?: boolean;
};

export function SectionHeading({ eyebrow, title, description, h1 = false }: SectionHeadingProps) {
  const TitleTag = h1 ? "h1" : "h2";

  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <TitleTag>{title}</TitleTag>
      <p>{description}</p>
    </div>
  );
}
