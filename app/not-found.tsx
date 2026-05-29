import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(180deg,#fbfbef_0%,#eef6ec_54%,#e5f2ef_100%)] px-6 text-[#244d49]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(220,235,191,.42),transparent_28rem),radial-gradient(circle_at_82%_24%,rgba(177,224,218,.25),transparent_30rem)]" />
      <section className="relative z-10 mx-auto max-w-xl text-center">
        <p className="mb-4 text-sm tracking-[0.28em] text-[#6f9284]">404</p>
        <h1 className="cinema-title text-balance text-4xl leading-tight text-[#214f49] sm:text-6xl">这一页暂时走散了</h1>
        <p className="mx-auto mt-6 max-w-md text-[16px] leading-8 text-[#315f5a]/72">
          可能是链接写错了，也可能是那段回忆还没有被放进来。先回到首页，慢慢翻。
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex rounded-full border border-[#8fb5a3]/28 bg-[#fffdf1]/66 px-5 py-3 text-sm text-[#315f5a] shadow-[0_12px_30px_rgba(37,73,67,.08)] transition duration-500 hover:-translate-y-0.5 hover:bg-[#eef5dc]"
        >
          回到首页
        </Link>
      </section>
    </main>
  );
}

