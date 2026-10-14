import Link from "next/link";
import Sizer from "@/components/Sizer";

const PROBLEMS = [
  { mark: "bg-bad", title: "Too small", body: "The battery is flat before midnight and the generator comes back on." },
  { mark: "bg-sun", title: "Too big", body: "You pay for panels and batteries you never use. That money does not come back." },
  { mark: "bg-amber", title: "No payback date", body: "Three installers, three quotes, and nobody tells you when solar starts saving you money." },
];

const STEPS = [
  { title: "Describe it", body: "Type what you own the way you would say it. The AI turns it into a list of appliances you can edit." },
  { title: "Size it", body: "Tested formulas size the inverter for peak and start-up load, the battery for the night, and the panels for the day." },
  { title: "Match your sun", body: "NASA satellite data gives the real sun hours for your city. Kano needs fewer panels than Lagos." },
  { title: "Price it", body: "Costs come from a local price table, then we compare them with your petrol spend to find your payback month." },
];

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <div aria-hidden className="sun pointer-events-none absolute -right-40 top-[420px] h-[560px] w-[560px] rounded-full sm:-right-24 sm:top-[340px]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[640px] h-64 bg-gradient-to-b from-transparent via-[#ff7a1a]/10 to-transparent" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-tight">
          SolarSizer <span className="text-amber">AI</span>
        </Link>
        <a href="#how" className="text-muted hover:text-foreground">How it works</a>
      </header>

      <main className="relative">
        <Sizer
          intro={
            <>
              <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                Find the solar system your home actually needs.
              </h1>
              <p className="mt-6 max-w-[34rem] text-xl leading-relaxed text-muted">
                Tell us what you want to power. We size the inverter, battery and panels for your city, price them in
                naira, and show the month solar starts beating your generator.
              </p>
              <p className="mt-8 max-w-[34rem] border-l-2 border-amber pl-4 text-foreground/90">
                Built for the shops and homes that switch on a generator every time the grid goes off.
              </p>
            </>
          }
        />

        <section className="border-t border-line/60 bg-night/60">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12">
            <h2 className="font-display text-4xl font-bold leading-tight lg:col-span-4">Why buying solar feels like guessing</h2>
            <ul className="space-y-8 lg:col-span-7 lg:col-start-6">
              {PROBLEMS.map((p) => (
                <li key={p.title} className="flex gap-5">
                  <span aria-hidden className={`mt-2 h-3 w-3 shrink-0 rounded-full ${p.mark}`} />
                  <div>
                    <h3 className="text-xl font-bold">{p.title}</h3>
                    <p className="mt-1 max-w-[36rem] text-lg text-muted">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6">
          <h2 className="font-display text-4xl font-bold">How it works</h2>
          <ol className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-amber/70 pt-5">
                <span className="font-display text-5xl font-extrabold text-amber/90">{i + 1}</span>
                <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-14 max-w-[42rem] text-lg">
            The AI only reads your list. Every number on the page comes from formulas you can check, so the same list
            always gives the same answer.
          </p>
        </section>
      </main>

      <footer className="border-t border-line/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-muted sm:px-6">
          <p>
            Sun data from NASA POWER. Appliance reading by an open model on the NVIDIA API. Prices are estimates for
            planning. Get a final quote from a certified installer.
          </p>
          <p>Made for the Global Energy Hackathon 2026, Digital Solutions, Apps and AI/ML track.</p>
        </div>
      </footer>
    </div>
  );
}
