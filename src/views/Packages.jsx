'use client';

import KoykoFooter from '../components/KoykoFooter';
import KoykoHosting from '../components/KoykoHosting';
// Packages — /packages route
//
// Includes the shared navbar so navigation works on this page too.
// KoykoTable renders the three pricing cards (Essential, Premium, Signature).

import KoykoNavbar from '../components/KoykoNavbar';
import KoykoTable from '../components/KoykoTable';

function Packages() {
  return (
    <div className="koyko-page">
      <KoykoNavbar />

      {/* Page hero / intro */}
      <header className="koyko-packages__hero">
        <p className="koyko-packages__eyebrow">K O Y K O &nbsp; D E S I G N &nbsp; P A C K A G E S</p>
        <h1 className="koyko-packages__title">Pricing & Packages</h1>
        <p className="koyko-packages__intro">
          All projects are custom-coded — no templates, no subscriptions, no lock-in.
          You own the code outright on final payment. Prices below are starting points;
          Signature projects are always scoped individually.
        </p>
      </header>

      <KoykoTable />
      <KoykoHosting />
      <KoykoFooter />
    </div>
  );
}

export default Packages;
