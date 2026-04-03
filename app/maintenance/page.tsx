export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f9f4ec_0%,#efe3d2_100%)] px-6 py-16 text-theme-walnut dark:bg-[linear-gradient(180deg,#181310_0%,#0f0b09_100%)] dark:text-theme-ivory">
      <div className="pointer-events-none absolute left-[-8rem] top-[-5rem] h-[24rem] w-[24rem] rounded-full bg-theme-bronze/18 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-6rem] right-[-5rem] h-[20rem] w-[20rem] rounded-full bg-theme-olive/14 blur-[100px]" />

      <section className="relative z-10 w-full max-w-2xl rounded-[2.4rem] border border-theme-line/60 bg-white/80 p-10 text-center shadow-[0_30px_100px_rgba(49,30,21,0.14)] backdrop-blur-xl dark:bg-white/5 md:p-14">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.4em] text-theme-bronze">
          LUXE Atelier
        </p>
        <h1 className="mt-5 font-display text-4xl leading-tight text-theme-ink dark:text-theme-ivory md:text-6xl">
          The gallery is being refreshed.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-theme-walnut/72 dark:text-theme-ivory/68 md:text-base">
          Website is under maintenance. Please visit later.
        </p>
      </section>
    </main>
  );
}
