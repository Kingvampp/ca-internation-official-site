
// Remove 'use client' since it can't be used with generateStaticParams
export function generateStaticParams() {
  return [
    { id: 'placeholder' }
  ];
}

export default function PlaceholderPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">This page is undergoing maintenance</h1>
      <p className="mt-2">Please check back later.</p>
    </div>
  );
}