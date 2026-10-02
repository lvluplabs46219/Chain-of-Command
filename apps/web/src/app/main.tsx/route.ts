import { NextResponse } from 'next/server';

export async function GET() {
  const code = `
// Compatibility stub for cached Vite-style module requests
if (typeof window !== 'undefined' && window.location.pathname.endsWith('index.html')) {
  window.location.replace('/');
}
export default {};
`;

  return new NextResponse(code, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
