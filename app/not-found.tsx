import { MagneticButton, ArrowIcon } from "@/components/ui/MagneticButton";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[100svh] flex-col justify-center py-32">
      <div className="mx-auto w-full max-w-[1500px]">
        <span className="label-mono">404</span>
        <h1 className="mt-4 font-display text-display-md font-semibold leading-[0.95] tracking-[-0.03em] text-bone">
          Nothing glazed <span className="font-serif font-normal italic text-bone-2">here.</span>
        </h1>
        <p className="mt-6 max-w-md text-bone-2">The page you are looking for does not exist or has moved.</p>
        <div className="mt-10">
          <MagneticButton href="/" icon={<ArrowIcon />}>
            Back home
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
