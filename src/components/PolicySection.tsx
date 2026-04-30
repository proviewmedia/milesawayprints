interface Props {
  title: string;
  children: React.ReactNode;
}

export default function PolicySection({ title, children }: Props) {
  return (
    <section className="border-t border-border pt-8 mt-12">
      <h2 className="text-[13px] font-medium uppercase tracking-wider text-ink mb-5">
        {title}
      </h2>
      <div className="text-ink leading-relaxed space-y-4">{children}</div>
    </section>
  );
}
