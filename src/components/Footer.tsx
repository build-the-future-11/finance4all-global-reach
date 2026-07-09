export default function Footer() {
  return (
    <footer className="relative z-10 px-6 py-12">
      {/* Background glows and gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-50%] left-[-50%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl animate-blob-slow"></div>
        <div className="absolute bottom-[-40%] right-[-40%] h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-3xl animate-blob-slow delay-2000"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-white/0 to-white/5 backdrop-blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-500 hover:shadow-[0_25px_80px_rgba(0,0,0,0.18)] sm:flex-row">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-foreground">Finance4All Meta</span>. All rights reserved.
        </p>
        <p className="text-center sm:text-right text-primary/80 transition-colors duration-300 hover:text-primary">
          Empowering global financial literacy.
        </p>
      </div>

      {/* Subtle moving shimmer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-32 -left-32 h-[200px] w-[200px] bg-white/5 blur-xl animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -right-32 h-[300px] w-[300px] bg-white/3 blur-2xl animate-pulse-slow delay-1000"></div>
      </div>
    </footer>
  );
}
