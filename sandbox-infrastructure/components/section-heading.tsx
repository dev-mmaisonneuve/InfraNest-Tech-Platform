type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  h1?: boolean;
  reveal?: boolean;
  pulse?: boolean;
};

export function SectionHeading({ eyebrow, title, description, h1 = false, reveal = false, pulse = false }: SectionHeadingProps) {
  const TitleTag = h1 ? "h1" : "h2";

  return (
    <div className="section-heading" {...(reveal ? { "data-reveal": "" } : {})}>
      <span className={pulse ? "eyebrow eyebrow--pulse" : "eyebrow"}>{eyebrow}</span>
      <TitleTag>{title}</TitleTag>
      <p>{description}</p>
    </div>
  );
}
