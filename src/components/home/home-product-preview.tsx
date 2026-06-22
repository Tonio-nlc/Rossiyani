import Link from "next/link";

import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";

import { HomeIconExplore, HomeIconPractice, HomeIconRead } from "./home-icons";

const PRODUCTS = [
  {
    id: "reader",
    title: "Reader",
    href: "/reader",
    description: "Immersive annotated reading with morphology at your fingertips.",
    Icon: HomeIconRead,
    preview: (
      <div className="home-preview-mock home-preview-mock--reader">
        <p className="home-preview-mock__ru">Он читал газету в метро.</p>
        <p className="home-preview-mock__fr">Il lisait le journal dans le métro.</p>
        <span className="home-preview-mock__highlight">читал</span>
      </div>
    ),
  },
  {
    id: "explorer",
    title: "Explorer",
    href: "/explorer",
    description: "Navigate lemmas, cases, collocations and concepts as a network.",
    Icon: HomeIconExplore,
    preview: (
      <div className="home-preview-mock home-preview-mock--explorer">
        <span className="home-preview-mock__chip">встреча</span>
        <span className="home-preview-mock__chip">предложный</span>
        <span className="home-preview-mock__chip">думать о</span>
      </div>
    ),
  },
  {
    id: "practice",
    title: "Practice",
    href: "/practice",
    description: "Reinforce structures discovered in your own reading material.",
    Icon: HomeIconPractice,
    preview: (
      <div className="home-preview-mock home-preview-mock--practice">
        <p className="home-preview-mock__prompt">Construire : « Je pensais à la rencontre »</p>
        <span className="home-preview-mock__answer">Я думал о встрече</span>
      </div>
    ),
  },
] as const;

export function HomeProductPreview() {
  return (
    <section
      className="home-section home-section--secondary"
      aria-labelledby="home-preview-heading"
    >
      <EditorialSectionHead
        id="home-preview-heading"
        icon={<HomeIconExplore className="editorial-section-head__icon" />}
        title="The learning environment"
        lead="Three interconnected workspaces — each designed for depth, not distraction."
      />

      <ul className="home-product-grid">
        {PRODUCTS.map((product) => (
          <li key={product.id}>
            <Link href={product.href} className="home-product-card focus-kb">
              <div className="home-product-card__head">
                <product.Icon className="home-product-card__icon" />
                <h3 className="home-product-card__title">{product.title}</h3>
              </div>
              {product.preview}
              <p className="home-product-card__description">{product.description}</p>
              <span className="home-product-card__cta">Open {product.title} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
