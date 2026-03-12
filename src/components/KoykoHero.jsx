// KoykoHero — full-viewport editorial hero section
//
// Visual structure (overlapping layout):
//   "k o y k" wordmark sits left, vertically aligned with the logo's head
//   so the figure's head visually replaces the missing 'O' in "koyko".
//   The logo is centred in the hero area.
//   "D  E  S  I  G  N" label sits at the bottom right.
//
// The "D" and "E" letters are Matter.js pendulums — they swing from a
// hinge at the bottom when hovered, then settle naturally via physics.

'use client';

import { useRef, useEffect, useCallback } from 'react';
import Matter from 'matter-js';
import { LOGO } from '../assets/koykoAssets';

// ---------------------------------------------------------------------------
// PhysicsLetter — renders a single letter as a Matter.js pendulum body.
//
// How it works:
//   1. A Matter.js engine runs in the background (no visible canvas).
//   2. A rectangular body represents the letter, starting at its DOM position.
//   3. A constraint pins the body's BOTTOM-CENTER to a fixed anchor point,
//      so the letter hangs upward like an inverted pendulum.
//   4. On hover we apply a small angular impulse → the letter swings and
//      wobbles, then settles thanks to built-in air friction.
//   5. A requestAnimationFrame loop syncs the DOM element's transform
//      with the physics body's angle (rotation only — position stays pinned).
// ---------------------------------------------------------------------------
function PhysicsLetter({ char }) {
  const spanRef = useRef(null);      // the visible <span> in the DOM
  const engineRef = useRef(null);    // Matter.js engine instance
  const bodyRef = useRef(null);      // the physics body for this letter
  const rafRef = useRef(null);       // animation frame ID for cleanup

  // --- Bootstrap the physics world once on mount ---
  useEffect(() => {
    const { Engine, Bodies, Constraint, Composite } = Matter;

    // Create a physics engine with no gravity (we simulate the pendulum
    // restoring force via the constraint + a tiny downward gravity).
    const engine = Engine.create({
      gravity: { x: 0, y: 0.5 }, // light gravity pulls the letter back down
    });
    engineRef.current = engine;

    // The letter body — a small rectangle; we only care about its angle.
    // Position is arbitrary because we only read rotation from the body.
    const body = Bodies.rectangle(0, 0, 30, 40, {
      // Moderate air friction so the swing damps out naturally
      frictionAir: 0.02,
      restitution: 0.3,
    });
    bodyRef.current = body;

    // Pin the BOTTOM-CENTER of the letter to a fixed world point.
    // This makes the letter swing around its bottom edge like a hinge.
    const constraint = Constraint.create({
      bodyA: body,
      pointA: { x: 0, y: 20 },   // bottom-center of the 30×40 body
      pointB: { x: 0, y: 20 },   // fixed world anchor (same spot)
      length: 0,                   // zero-length = rigid pin joint
      stiffness: 1,                // perfectly stiff hinge
    });

    Composite.add(engine.world, [body, constraint]);

    // --- Render loop: step physics → apply rotation to DOM element ---
    let lastTime = performance.now();

    function tick(now) {
      const delta = now - lastTime;
      lastTime = now;

      // Step the engine forward by the real elapsed time (capped at 32ms
      // to avoid huge jumps if the tab was backgrounded).
      Engine.update(engine, Math.min(delta, 32));

      // Apply the body's angle as a CSS rotation.
      // We rotate around "bottom center" so the hinge point stays put.
      if (spanRef.current) {
        const angle = body.angle * (180 / Math.PI); // radians → degrees
        spanRef.current.style.transform = `rotate(${angle}deg)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(rafRef.current);
      Engine.clear(engine);
    };
  }, []);

  // --- Hover handler: apply a small angular impulse ---
  const handleHover = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;

    // Pick a random direction (left or right) so it feels organic
    const direction = Math.random() > 0.5 ? 1 : -1;

    // Apply torque (angular impulse) — this makes the body spin,
    // and the constraint + gravity will create the pendulum swing.
    Matter.Body.setAngularVelocity(body, direction * 0.15);
  }, []);

  return (
    <span
      ref={spanRef}
      className="koyko-hero__physics-letter"
      onMouseEnter={handleHover}
    >
      {char}
    </span>
  );
}

// ---------------------------------------------------------------------------
// KoykoHero — main hero section
// ---------------------------------------------------------------------------
function KoykoHero() {
  return (
    <section className="koyko-hero" aria-label="Hero">

      {/* Main hero area — position:relative so children can overlap */}
      <div className="koyko-hero__stage">

        {/* "k o y k" wordmark — positioned left, aligned with logo head.
            The logo's head fills the space where the 'O' would be. */}
        <h1 className="koyko-hero__wordmark">k o y k</h1>

        {/* Logo illustration — centred in the hero stage */}
        <img
          src={LOGO}
          alt="Koyko — a figure with outstretched wings"
          className="koyko-hero__logo"
        />

        {/* "D  E  S  I  G  N" — D and E are physics pendulums,
            the rest are static letters */}
        <p className="koyko-hero__design-label">
          <PhysicsLetter char="D" />
          {'  '}
          <PhysicsLetter char="E" />
          {'  '}
          <span>S</span>
          {'  '}
          <span>I</span>
          {'  '}
          <span>G</span>
          {'  '}
          <span>N</span>
        </p>

      </div>

    </section>
  );
}

export default KoykoHero;
