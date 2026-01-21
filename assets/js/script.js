document.addEventListener("DOMContentLoaded", () => {
  // Intercept link clicks (including the logo link)
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      // Ignore empty links, hash links, and links to the same page
      if (!href || href.startsWith("#") || href === window.location.pathname) {
        return;
      }

      event.preventDefault();

      animateTransition().then(() => {
        window.location.href = href;
      });
    });
  });

  // Only run the reveal animation on pages that opt in
  if (document.body.classList.contains("run-reveal")) {
    gsap.set(".block", {
      visibility: "visible",
      scaleY: 1,
    });

    revealTransition().then(() => {
      gsap.set(".block", { visibility: "hidden" });
    });
  }
});

function revealTransition() {
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: resolve,
    });

    // Row 1 reveal
    tl.fromTo(
      ".row-1 .block",
      { scaleY: 1 },
      {
        scaleY: 0,
        duration: 1,
        delay: 0.2,
        stagger: {
          each: 0.1,
          from: "start", // start | end | center
          grid: [1, 5],
          axis: "x",
        },
        ease: "expo.inOut",
      },
      0
    );

    // Row 2 reveal
    tl.fromTo(
      ".row-2 .block",
      { scaleY: 1 },
      {
        scaleY: 0,
        duration: 1,
        delay: 0.2,
        stagger: {
          each: 0.1,
          from: "start",
          grid: [1, 5],
          axis: "x",
        },
        ease: "expo.inOut",
      },
      0
    );
  });
}

function animateTransition() {
  return new Promise((resolve) => {
    // Make blocks visible and collapsed before exit animation
    gsap.set(".block", {
      visibility: "visible",
      scaleY: 0,
    });

    const tl = gsap.timeline({
      onComplete: resolve,
    });

    // Row 1 exit
    tl.fromTo(
      ".row-1 .block",
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 1,
        delay: 0.2,
        stagger: {
          each: 0.1,
          from: "end", // start | end | center
          grid: [1, 5],
          axis: "x",
        },
        ease: "expo.out",
      },
      0
    );

    // Row 2 exit
    tl.fromTo(
      ".row-2 .block",
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 1,
        delay: 0.2,
        stagger: {
          each: 0.1,
          from: "end",
          grid: [1, 5],
          axis: "x",
        },
        ease: "expo.out",
      },
      0
    );
  });
}



