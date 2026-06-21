import { EXPLORER_DISCOVERY_FRAMING } from "./explorer-categories";

export function ExplorerHubIntro() {
  return (
    <header className="explorer-hub-intro">
      <h1 className="explorer-hub-intro__title">Explorer</h1>
      <p className="explorer-hub-intro__mission">{EXPLORER_DISCOVERY_FRAMING}</p>
    </header>
  );
}
