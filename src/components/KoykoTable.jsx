// KoykoTable — pricing comparison table
//
// Layout: a grid with 4 columns
//   Column 1: "Features" label + feature names listed vertically
//   Columns 2–4: package headers (name, price, subtitle) + checkmarks per feature
//
// The FEATURES array defines each row. Each feature has a name and
// a boolean for each package (essential, premium, signature) indicating
// whether that package includes the feature.

'use client';

import { Fragment } from 'react';

// Package definitions — used to build the header of each column
const PACKAGES = [
  {
    key: 'essential',
    name: 'ESSENTIAL',
    price: '£1200',
    subtitle: 'For solo creatives who need a polished online presence',
    variant: 'light',
  },
  {
    key: 'premium',
    name: 'PREMIUM',
    price: '£2400',
    subtitle: 'For established creatives and small businesses who want to level up',
    variant: 'dark',
  },
  {
    key: 'signature',
    name: 'SIGNATURE',
    price: '£5000+',
    subtitle: 'For those looking more than just a website — a full architectural experience',
    variant: 'light',
  },
];

// Each feature row:
//   true   → renders a checkmark (✓)
//   false  → renders a dash (—)
//   string → renders that text directly (e.g. "3-5", "2 rounds")
const FEATURES = [
  { name: 'Full code ownership',              essential: true,        premium: true,        signature: true        },
  { name: 'Custom visual design',             essential: true,        premium: true,        signature: true        },
  { name: 'Responsive design',                essential: true,        premium: true,        signature: true        },
  { name: 'SEO foundations',                   essential: true,        premium: true,        signature: true        },
  { name: 'Number of pages',                  essential: '3–5',       premium: '6–10',      signature: 'Unlimited' },
  { name: 'Revisions',                        essential: '2 rounds',  premium: '5 rounds',  signature: 'Unlimited' },
  { name: 'Delivery time',                    essential: '3–4 weeks', premium: '5–7 weeks', signature: 'Scoped'    },
  { name: 'Design system',                    essential: false,       premium: true,        signature: true        },
  { name: 'Subtle animations',                essential: false,       premium: true,        signature: true        },
  { name: 'CMS integration',                  essential: false,       premium: true,        signature: true        },
  { name: 'Advanced interactions & motion',   essential: false,       premium: false,       signature: true        },
  { name: 'Performance audit',                essential: false,       premium: false,       signature: true        },
  { name: 'Strategy & content consultation',  essential: false,       premium: false,       signature: true        },
  { name: 'E-commerce',                       essential: false,       premium: false,       signature: 'Add-on'   },
  { name: 'Post-launch support',              essential: false,       premium: false,       signature: true        },
];

function KoykoTable() {
  return (
    <section className="koyko-table" aria-label="Packages comparison">

      {/* ---- Table grid ---- */}
      <div className="koyko-table__grid">

        {/* ===== HEADER ROW ===== */}

        {/* Top-left cell: "Features" label */}
        <div className="koyko-table__header koyko-table__features-label">
          Feature
        </div>

        {/* One header cell per package (name + price + subtitle + divider) */}
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.key}
            className={`koyko-table__header koyko-table__pkg-header ${
              pkg.variant === 'dark' ? 'koyko-table__pkg-header--dark' : ''
            }`}
          >
            <h2 className="koyko-table__name">{pkg.name}</h2>
            <p className="koyko-table__price">{pkg.price}</p>
            <p className="koyko-table__subtitle">{pkg.subtitle}</p>
            <hr className="koyko-table__divider" />
          </div>
        ))}

        {/* ===== FEATURE ROWS ===== */}
        {FEATURES.map((feat) => (
          <Fragment key={feat.name}>
            {/* Left column: feature name */}
            <div className="koyko-table__cell koyko-table__feat-name">
              {feat.name}
            </div>

            {/* One cell per package: checkmark, dash, or text value */}
            {PACKAGES.map((pkg) => (
              <div
                key={`${feat.name}-${pkg.key}`}
                className={`koyko-table__cell koyko-table__check ${
                  pkg.variant === 'dark' ? 'koyko-table__check--dark' : ''
                }`}
              >
                {typeof feat[pkg.key] === 'string'
                  ? feat[pkg.key]
                  : feat[pkg.key] ? '✓' : '—'}
              </div>
            ))}
          </Fragment>
        ))}
      </div>

    </section>
  );
}

export default KoykoTable;
