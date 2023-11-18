'use client';
console.log("hmmmmmmmmmmmmmmmmmm")
if (typeof window !== 'undefined') {
    const imageCapture = new ImageCapture();
}

declare global {
    interface Window {
        ImageCapture: any;
    }
}