import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
	window.scrollTo = () => {};
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
	Element.prototype.getAnimations = () => [];
	Element.prototype.scrollIntoView = () => {};
	Element.prototype.checkVisibility = () => true;
}
