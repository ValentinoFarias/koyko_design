// KoykoDesigned — "DESIGNED WITH LOVE" editorial heading section
//
// A simple full-width section with a single large heading.
// Font: Noto Sans JP weight 800 (maps to Hiragino Kaku Gothic Std W8 in Figma).
// Size: fluid 3rem → 6rem via clamp() in CSS.
//
// Followed immediately by a <hr className="koyko-divider" /> in the page layout
// to produce the horizontal rule seen in the Figma between this section and Contact.

function KoykoDesigned() {
  return (
    <section className="koyko-designed" aria-label="Design philosophy">
      <h2 className="koyko-designed__heading">DESIGNED WITH LOVE</h2>
    </section>
  );
}

export default KoykoDesigned;
