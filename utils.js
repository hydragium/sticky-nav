// @hydragium/utils | Nikola Stamatovic <nikola@otilito.com> | MIT

export function intersectionObserver(elements, onIntersecting, threshold) {
  if (threshold === undefined || threshold === null) {
    threshold = 0.01;
  }

  if (window.hasOwnProperty('IntersectionObserver')) {
    const observer = new IntersectionObserver((entries, observer) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        if (entry.isIntersecting) {
          if (onIntersecting) {
            onIntersecting(entry);
          }
        }
      }
    }, {
      threshold: threshold
    });

    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      observer.observe(elem);
    }
    return observer;
  }
  return null;
}
