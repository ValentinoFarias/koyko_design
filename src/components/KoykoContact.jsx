// KoykoContact — call-to-action section
//
// Three stacked elements (top → bottom):
//   1. "{contact}" label — small, top-left
//      The curly braces are intentional: this is how it appears in the Figma design.
//   2. "READY TO TALK ABOUT YOUR PROJECT?" — large, right-aligned heading
//   3. Circular arrow button — left-aligned, links to the contact email
//      The circle is drawn via CSS (border-radius: 50% + border: 2px solid),
//      and the arrow icon image is placed inside it.
//
// Section anchor id="contact" is targeted by the "c o n t a c t" nav link.

import { ARROW } from '../assets/koykoAssets';

function KoykoContact() {
  return (
    <section
      className="koyko-contact"
      id="contact"              // targeted by the "c o n t a c t" nav link
      aria-label="Contact"
    >
      {/* Small label — the {contact} syntax is a deliberate design choice */}
      <p className="koyko-contact__label">{'{contact}'}</p>

      {/* Main CTA heading — right-aligned, two lines, very large */}
      <h2 className="koyko-contact__heading">
        READY TO TALK ABOUT<br />YOUR PROJECT?
      </h2>

      {/* Circular mailto link — CSS draws the circle; image is the arrow inside */}
      <a
        href="mailto:hello@koykodesign.com"
        className="koyko-contact__arrow-btn"
        aria-label="Start your project — send an email to hello@koykodesign.com"
      >
        <img
          src={ARROW}
          alt=""
          aria-hidden="true"    // label on the <a> is sufficient for screen readers
          className="koyko-contact__arrow-icon"
        />
      </a>
    </section>
  );
}

export default KoykoContact;
