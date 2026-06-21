import type { ExplorerLemmaExample } from "@/lib/explorer/explorer-ia";

type ExplorerExampleListProps = {
  examples: ExplorerLemmaExample[] | string[];
};

function isLemmaExample(
  item: ExplorerLemmaExample | string,
): item is ExplorerLemmaExample {
  return typeof item === "object";
}

export function ExplorerExampleList({ examples }: ExplorerExampleListProps) {
  if (examples.length === 0) {
    return null;
  }

  return (
    <ul className="explorer-word-example-list">
      {examples.map((example) => {
        const russian = isLemmaExample(example) ? example.russian : example;
        const translation = isLemmaExample(example) ? example.translation : null;
        const key = isLemmaExample(example) ? `${example.russian}-${example.translation}` : example;

        return (
          <li key={key} className="explorer-word-example">
            <p className="explorer-word-example__russian break-russian font-reader">{russian}</p>
            {translation ? (
              <p className="explorer-word-example__translation">{translation}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
