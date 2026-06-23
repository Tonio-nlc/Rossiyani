import Link from "next/link";

import {
  HomeIconContent,
  HomeIconManual,
  HomeIconPractice,
  HomeIconRead,
} from "./home-icons";

const ACTIONS = [
  {
    href: "/library",
    title: "Library",
    description: "Browse texts, collections, and saved phrases.",
    Icon: HomeIconContent,
  },
  {
    href: "/reader",
    title: "Reader",
    description: "Immersive reading with word-level analysis.",
    Icon: HomeIconRead,
  },
  {
    href: "/practice",
    title: "Practice",
    description: "Compose sentences and revisit what you read.",
    Icon: HomeIconPractice,
  },
  {
    href: "/manual",
    title: "Manual",
    description: "Grammar reference and structured lessons.",
    Icon: HomeIconManual,
  },
] as const;

export function HomeDashboardActions() {
  return (
    <section className="home-dash-section" aria-labelledby="home-dash-actions-heading">
      <div className="home-dash-section__head">
        <h2 id="home-dash-actions-heading" className="home-dash-section__title">
          Quick actions
        </h2>
      </div>

      <ul className="home-dash-actions">
        {ACTIONS.map((action) => (
          <li key={action.href}>
            <Link href={action.href} className="home-dash-card home-dash-action focus-kb">
              <span className="home-dash-action__icon" aria-hidden>
                <action.Icon className="home-dash-action__icon-svg" />
              </span>
              <span className="home-dash-action__body">
                <span className="home-dash-action__title">{action.title}</span>
                <span className="home-dash-action__description">{action.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
