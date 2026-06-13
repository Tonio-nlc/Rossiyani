type WhyThisFormProps = {
  explanation: string;
};

export function WhyThisForm({ explanation }: WhyThisFormProps) {
  return (
    <section className="rounded-lg border-2 border-amber-200 bg-amber-50/80 p-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-amber-900">
        Pourquoi cette forme ?
      </h3>
      <p className="mt-3 text-base leading-relaxed text-neutral-900">{explanation}</p>
    </section>
  );
}
