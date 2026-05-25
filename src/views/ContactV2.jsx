'use client';

// ContactV2 — /contact-v2 route
//
// Page order (mirrors v1 Contact but with v2 components):
//   1. KoykoNavbarV2     — fixed top nav (plus the v2 cursor it pairs with)
//   2. Page header       — eyebrow + title + subtitle
//   3. KoykoContactFormV2 — name, email, project type, message, submit
//   4. KoykoFooterV2     — figure + contact info + back-to-top

import KoykoNavbarV2      from '../components/v2/KoykoNavbarV2';
import KoykoCursorV2      from '../components/v2/KoykoCursorV2';
import KoykoFooterV2      from '../components/v2/KoykoFooterV2';
import KoykoContactFormV2 from '../components/v2/KoykoContactFormV2';
import V2ThemePicker      from '../components/v2/V2ThemePicker';
import { useV2Theme }     from '../components/v2/useV2Theme';

export default function ContactV2() {
  const [theme, setTheme] = useV2Theme();

  return (
    // suppressHydrationWarning silences the data-theme mismatch — SSR
    // uses the default, client reads the saved theme from localStorage.
    <div
      className="home-v2 v2-contact-page"
      data-theme={theme}
      suppressHydrationWarning
    >

      <KoykoCursorV2 />

      <V2ThemePicker theme={theme} setTheme={setTheme} />

      <KoykoNavbarV2 />

      {/* Page header + form, wrapped in a centered card */}
      <main className="v2-contact-page__main">
        <header className="v2-contact-page__header">
          <p className="v2-contact-page__eyebrow">K O Y K O&nbsp;&nbsp;D E S I G N</p>
          <h1 className="v2-contact-page__title">
            let's <em>talk</em>
          </h1>
          <p className="v2-contact-page__subtitle">
            fill in the form and I'll get back to you within 48 hours.
          </p>
        </header>

        <KoykoContactFormV2 />
      </main>

      <KoykoFooterV2 />
    </div>
  );
}
