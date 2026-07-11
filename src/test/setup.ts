import "@testing-library/jest-dom";

// jsdom File/Blob may lack arrayBuffer(); polyfill for upload validation tests.
function polyfillArrayBuffer(proto: { arrayBuffer?: () => Promise<ArrayBuffer> }) {
  if (proto.arrayBuffer) return;
  proto.arrayBuffer = function arrayBufferPolyfill(this: Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

if (typeof Blob !== "undefined") polyfillArrayBuffer(Blob.prototype);
if (typeof File !== "undefined") polyfillArrayBuffer(File.prototype);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
