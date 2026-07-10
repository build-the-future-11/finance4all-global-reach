export default function LandingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-[#020408]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(16,185,129,0.2),transparent_50%),radial-gradient(ellipse_80%_60%_at_100%_50%,rgba(99,102,241,0.14),transparent_45%),radial-gradient(ellipse_70%_50%_at_0%_80%,rgba(14,165,233,0.08),transparent_40%)]" />

      <div className="landing-orb left-[8%] top-[12%] h-[28rem] w-[28rem] bg-emerald-500/18" />
      <div className="landing-orb landing-float-delay right-[5%] top-[35%] h-80 w-80 bg-indigo-500/14" />
      <div className="landing-orb bottom-[8%] left-[35%] h-72 w-72 bg-cyan-500/10" />

      <div className="landing-aurora absolute -left-1/4 top-0 h-[70vh] w-[150%] opacity-50" />
      <div className="landing-aurora landing-aurora-delay absolute -right-1/4 top-1/4 h-[60vh] w-[140%] opacity-35" />

      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 25%, black, transparent)",
        }}
      />

      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSI0Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIi8+PC9zdmc+')]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020408_88%)]" />
    </div>
  );
}
