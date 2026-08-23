import Link from 'next/link';

export default function Home() {

const portalLinks = [
    { title: 'Playwright Test Results Dashboard', href: '/github-results' },
  ];

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        The QA Portal
      </h1>

      <div className="space-y-4 text-center">
        {portalLinks.map((link) => (
          <p key={link.href}>
            <Link 
              href={link.href} 
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              {link.title}
            </Link>
          </p>
        ))}
      </div>
    </main>
  );

}
