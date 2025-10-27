export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-5xl  text-zinc-900 dark:text-white sm:text-6xl">
          <span className="text-blue-600">Demo</span>
        </h1>
        <div className="pt-10">
          <span className="text-zinc-700 text-8xl dark:text-zinc-300 font-extrabold">4.1</span>
        </div>
       
      </main>
    </div>
  );
}
