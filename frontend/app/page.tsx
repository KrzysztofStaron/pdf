import Image from "next/image";
import { User } from "@shared/types/user";

// Demo component to show shared types working
function UserDemo() {
  // Example of using shared types in frontend
  const exampleUser: User = {
    id: "1",
    name: "Frontend User",
    email: "frontend@example.com",
    password: "hashed",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-8">
      <h2 className="text-lg font-semibold mb-2">🎯 Shared Types Demo</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        This demonstrates shared TypeScript types between frontend and backend:
      </p>
      <div className="bg-white dark:bg-gray-700 p-3 rounded text-sm">
        <strong>User Type from @shared/types/user:</strong>
        <pre className="mt-1 text-xs">{JSON.stringify(exampleUser, null, 2)}</pre>
      </div>
      <p className="text-xs text-gray-500 mt-2">✅ Same User type is used in backend/index.ts</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-2xl">
        <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={180} height={38} priority />

        <UserDemo />

        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-4">📁 Monorepo Setup Complete!</h1>
          <ol className="list-inside list-decimal text-sm/6 font-[family-name:var(--font-geist-mono)]">
            <li className="mb-2 tracking-[-.01em]">
              ✅ Frontend & Backend share types via{" "}
              <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">@shared/*</code>
            </li>
            <li className="mb-2 tracking-[-.01em]">✅ Webpack alias configured for Vercel deployment</li>
            <li className="mb-2 tracking-[-.01em]">✅ Backend runs on port 3001 with Express.js</li>
            <li className="tracking-[-.01em]">
              ✅ Run{" "}
              <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">pnpm dev</code> to
              start both servers
            </li>
          </ol>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
          >
            🚀 Test Backend API
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deploy to Vercel
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
