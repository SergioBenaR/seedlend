const evidence = {
  loanId: "1",
  principal: "100 tCTC",
  totalDue: "108 tCTC",
  position: "100 SLDP",
  borrower: "0x6003609a9559f53f8DeAd1a74852E742B2157fe0",
  originator: "0xED37fe15C710801Eb8D48C2B0a7DA2B062656D4C",
  loan: "0x442a74AC5CD4B12E61A6ce20397b2ceA97896c24",
  vault: "0x43120061E02461942b2aab72D4166b2df9ff3141",
  asset: "0x442a74AC5CD4B12E61A6ce20397b2ceA97896c24",
  termsHash: "0x0295c2692b961707f77078d5623726ec5279e32396406b36f85dc5f637864c1c",
  positionTx: "0xc03e701b73983554f92dcf5407049323f73890cbd82599f3e4b332a83c88f14f",
  activationTx: "0xf5cc29e469710cf66ea0764d383123232b6e07131ce9302de3176807c50ac5a7",
  repayments: [
    "0x15693edf2ffc60a8f1b74a1b7c0c2f503b977a13a0121695a56bb08d4c4c44a2",
    "0x2e1e9ea3661f9fb87a689ce01163f2874a735138588459e495409f41e8a1316c",
    "0x21abeecf414618f9b54cb910df09a0778363aef740c660409d89d69113bdf8bf"
  ]
};

const sep = "https://sepolia.etherscan.io";
const cc = "https://creditcoin-testnet.blockscout.com";
const short = (value, left = 6, right = 4) => `${value.slice(0, left)}…${value.slice(-right)}`;
const explorerLink = (base, type, hash, label) => `<a class="mono-link" href="${base}/${type}/${hash}" target="_blank" rel="noreferrer">${label}<span aria-hidden="true">↗</span></a>`;

const steps = [
  ["01", "Creditcoin", "Loan terms created", "The originator creates canonical terms: borrower, principal, total due, source vault and demo asset.", `Loan #${evidence.loanId} · ${evidence.principal} → ${evidence.totalDue}`, "TERMS COMMITTED"],
  ["02", "Sepolia", "Investment position locked", "100 SLDP is transferred into SeedLendVault. The vault emits PositionLocked with the exact loan terms hash.", explorerLink(sep, "tx", evidence.positionTx, short(evidence.positionTx)), "POSITION LOCKED"],
  ["03", "Attestcoin", "Source evidence proven", "Attestcoin proves the Sepolia transaction to Creditcoin. Without this proof, SeedLendLoan cannot activate.", explorerLink(cc, "tx", evidence.activationTx, short(evidence.activationTx)), "PROOF VERIFIED"],
  ["04", "Creditcoin", "Loan activated", "The destination contract validates vault, borrower, asset, principal and termsHash before changing state to Active.", "sourceQueryId recorded on-chain", "ACTIVE"],
  ["05", "Creditcoin", "Repayments recorded", "Native tCTC repayments are recorded on-chain and forwarded to the originator. In this public demo, three payments complete the 108 tCTC total due.", evidence.repayments.map((tx, i) => explorerLink(cc, "tx", tx, `36 tCTC · ${i + 1}/3`)).join("<span class='dot'>·</span>"), "108 / 108 tCTC"],
  ["06", "Creditcoin", "Release eligibility reached", "After totalDue is reached, the contract emits ReleaseEligible. Cross-chain release itself stays outside the hackathon MVP.", explorerLink(cc, "tx", evidence.repayments[2], "View final on-chain event"), "RELEASE ELIGIBLE"]
];

const app = document.querySelector("#app");
app.innerHTML = `
<header class="topbar">
  <a class="brand" href="#top"><img class="brand-mark" src="./seedlend-isotype.png" alt="" style="border:0;box-shadow:none;object-fit:contain;background:transparent"><span>SeedLend</span></a>
  <nav><a href="#proof">Proof path</a><a href="#evidence">Evidence</a><a class="nav-cta" href="https://github.com/SergioBenaR/seedlend" target="_blank" rel="noreferrer">GitHub ↗</a></nav>
</header>
<main id="top">
  <section class="hero shell">
    <div class="hero-copy">
      <div class="eyebrow"><span class="live-dot"></span> VERIFIED PUBLIC TESTNET RUN</div>
      <h1>Your first investment shouldn’t have to wait until you have the <em>capital.</em></h1>
      <p class="lede">SeedLend helps young people build their first investment position — without needing existing assets as collateral — combining directed credit, financial education and verifiable on-chain ownership.</p>
      <div class="hero-actions"><a class="button primary" href="#proof">Inspect the proof path</a><a class="button ghost" href="${cc}/address/${evidence.loan}" target="_blank" rel="noreferrer">Open Creditcoin contract ↗</a></div>
      <div class="hero-metrics"><div><strong>100</strong><span>tCTC principal</span></div><div><strong>100</strong><span>SLDP locked</span></div><div><strong>108</strong><span>tCTC repaid in demo</span></div><div><strong>0</strong><span>remaining</span></div></div>
    </div>
    <div class="proof-card">
      <div class="proof-card-head"><span>LOAN #${evidence.loanId}</span><span class="status-pill">PAID · RELEASE ELIGIBLE</span></div>
      <div class="chain-row"><div class="chain-node"><span class="chain-icon sep-icon">Ξ</span><div><small>SOURCE</small><b>Sepolia</b></div></div><div class="connector"><span></span><b>ATTESTCOIN</b><span></span></div><div class="chain-node"><span class="chain-icon cc-icon">C</span><div><small>DESTINATION</small><b>Creditcoin</b></div></div></div>
      <div class="gate-box"><span class="gate-check">✓</span><div><small>ACTIVATION GATE</small><strong>PositionLocked proof verified</strong></div></div>
      <dl class="loan-data"><div><dt>Position</dt><dd>${evidence.position}</dd></div><div><dt>Total due</dt><dd>${evidence.totalDue}</dd></div><div><dt>Payments</dt><dd>3 confirmed</dd></div><div><dt>Remaining</dt><dd>0 tCTC</dd></div></dl>
      <div class="proof-footer mono">termsHash ${short(evidence.termsHash, 10, 8)}</div>
    </div>
  </section>

  <section class="thesis shell"><div class="section-kicker">WHY THIS MATTERS</div><div class="thesis-grid"><h2>Start investing before you have the <span>full capital.</span></h2><div class="thesis-copy"><p>SeedLend turns the ability to make small, regular payments into an investment position instead of unrestricted cash. Users can learn how investing works while building their position over time.</p><p>Every repayment is recorded on-chain, creating a verifiable repayment history from the user’s first SeedLend loan. Over time, that history could support reputation and better access to credit.</p><p>The hackathon asset, SLDP, is intentionally unbacked and has no promised return. The prototype demonstrates infrastructure, not a production financial product.</p></div></div></section>

  <section class="proof-section shell" id="proof">
    <div class="section-heading"><div><div class="section-kicker">THE VERTICAL SLICE</div><h2>One lifecycle. Two chains. One proof gate.</h2></div><p>Every critical transition below has already happened on public testnets.</p></div>
    <div class="timeline">${steps.map(([n, chain, title, copy, proof, state]) => `<article class="timeline-step"><div class="step-number">${n}</div><div class="step-body"><div class="step-meta"><span>${chain}</span><span class="step-state">${state}</span></div><h3>${title}</h3><p>${copy}</p><div class="step-proof">${proof}</div></div></article>`).join("")}</div>
  </section>

  <section class="gate-section"><div class="shell gate-layout"><div><div class="section-kicker">ATTESTCOIN IS CORE</div><h2>No proof, no activation.</h2><p>SeedLend does not merely display cross-chain data. The Creditcoin contract consumes Attestcoin evidence and refuses to activate unless the exact Sepolia position matches the loan.</p></div><div class="logic-card mono"><div><span>01</span> verify source chain = Sepolia</div><div><span>02</span> verify transaction success</div><div><span>03</span> match vault + loanId</div><div><span>04</span> match borrower + asset</div><div><span>05</span> match principal + termsHash</div><div class="logic-result"><span>✓</span> activate loan</div></div></div></section>

  <section class="evidence-section shell" id="evidence">
    <div class="section-heading"><div><div class="section-kicker">PUBLIC TESTNET EVIDENCE</div><h2>Don't trust the demo. Verify it.</h2></div><p>Contracts and transactions link directly to public explorers.</p></div>
    <div class="evidence-grid">
      <article class="evidence-card"><span class="network-label">SEPOLIA</span><h3>SeedLendVault</h3><code>${short(evidence.vault,12,10)}</code>${explorerLink(sep,"address",evidence.vault,"Inspect contract")}</article>
      <article class="evidence-card"><span class="network-label">SEPOLIA</span><h3>DemoPositionAsset</h3><code>${short(evidence.asset,12,10)}</code>${explorerLink(sep,"address",evidence.asset,"Inspect asset")}</article>
      <article class="evidence-card featured"><span class="network-label">CREDITCOIN CC3</span><h3>SeedLendLoan</h3><code>${short(evidence.loan,12,10)}</code>${explorerLink(cc,"address",evidence.loan,"Inspect contract")}</article>
    </div>
    <div class="final-proof"><span class="final-check">✓</span><div><small>FINAL ON-CHAIN STATE</small><strong>Paid · 0 tCTC remaining · ReleaseEligible emitted</strong></div>${explorerLink(cc,"tx",evidence.repayments[2],"Verify final transaction")}</div>
  </section>

  <section class="boundary shell"><div class="section-kicker">MVP BOUNDARY</div><div class="boundary-grid"><div><h3>Implemented now</h3><p>Loan state on Creditcoin, locked position on Sepolia, Attestcoin proof-gated activation, native tCTC repayment history and release eligibility.</p></div><div><h3>Deliberately next</h3><p>Production underwriting, real investment assets, legal/custody model, default handling and reverse cross-chain release.</p></div></div></section>
</main>
<footer class="footer shell"><div><img src="./seedlend-logo-full.png" alt="SeedLend — Your first investment starts here" style="width:300px;max-width:72vw;height:auto;display:block"><span>Cross-chain infrastructure for financed investment positions.</span></div><div class="footer-note">BUIDL CTC 2026 · Public testnet demo · No real funds or promised returns</div></footer>
`;
