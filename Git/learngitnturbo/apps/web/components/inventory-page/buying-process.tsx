import { ShieldCheck, Car, KeyRound, Clock, MapPin, Phone, MessageCircle, ArrowRight } from "lucide-react";

const BUYING_STEPS = [
  {
    step: "01",
    title: "150+ Point Certified Check",
    description:
      "Every vehicle undergoes strict electronic diagnostics, paint depth testing, and suspension checks. We certify that zero cars in our showroom have accidental or flood damage history.",
    icon: ShieldCheck,
  },
  {
    step: "02",
    title: "Private VIP Test Drive",
    description:
      "Experience your chosen sports car or luxury SUV at our Koramangala showroom track or request a private, unhurried doorstep test drive at your residence.",
    icon: Car,
  },
  {
    step: "03",
    title: "Doorstep Delivery & 7-Day Guarantee",
    description:
      "We handle complete RTO transfer, insurance endorsement, and ceramic detailing before delivering your car on our enclosed flatbed. Covered by our 7-day exchange guarantee.",
    icon: KeyRound,
  },
];

export function BuyingProcess() {
  return (
    <section className="mt-20 space-y-12">
      {/* 3-Step Buying Experience */}
      <div>
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
            Peace of Mind
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-neutral-950 tracking-tight">
            The Apex Motors buying standard
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-light">
            How we ensure every luxury car purchase is transparent, reliable, and completely stress-free.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {BUYING_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-7 shadow-xs hover:border-neutral-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
                    <span className="font-mono text-xs font-bold text-neutral-400">
                      STEP {step.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-5 font-serif text-xl font-normal text-neutral-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-600 font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Showroom Visit, Hours & Appointment Card */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-800">
              <Clock className="h-3.5 w-3.5 text-neutral-600" />
              <span>Open 7 Days a Week • 10:00 AM – 8:00 PM</span>
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-950 tracking-tight">
              Visit our Koramangala luxury showroom
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-light max-w-xl leading-relaxed">
              Drop by for a cup of espresso while browsing our indoor vehicle showroom. Our certified product advisors offer a pressure-free environment with clear paperwork history for every vehicle.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-700">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span>Valet parking available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-neutral-400" />
                <span>Direct showroom desk: +91 77368 50015</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <a
              href="https://wa.me/917736850015?text=Hi%20Apex%20Motors,%20I%20would%20like%20to%20schedule%20a%20private%20showroom%20visit."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-6 py-3.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Book Showroom Visit on WhatsApp</span>
            </a>

            <a
              href="https://maps.google.com/?q=Koramangala+Bengaluru"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-3.5 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 transition active:scale-98"
            >
              <MapPin className="h-3.5 w-3.5 text-neutral-500" />
              <span>Get Showroom Directions</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

