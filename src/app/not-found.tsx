import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center">
      <div className="text-center px-6">
        <div className="text-8xl mb-6">📖</div>
        <h1 className="font-serif text-4xl text-charcoal mb-4">
          Story Not Found
        </h1>
        <p className="text-muted mb-8 max-w-md">
          The tale you&apos;re looking for seems to have wandered off into the mist.
          Perhaps it was never written, or maybe it exists in another realm.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper-hover transition-colors"
        >
          Return to the Library
        </Link>
      </div>
    </div>
  );
}
