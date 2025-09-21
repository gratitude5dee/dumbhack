import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DrawingCanvas } from "@/components/DrawingCanvas";
const sponsors = [{
  id: "google",
  name: "Google Cloud",
  clickable: false,
  logo: "/logos/google.svg",
  price: 100
}, {
  id: "elevenlabs",
  name: "ElevenLabs",
  clickable: true,
  logo: "/logos/elevenlabs.svg",
  price: 30
}, {
  id: "morph",
  name: "Morph",
  clickable: true,
  logo: "/logos/morph.svg",
  price: 50
}, {
  id: "toolhouse",
  name: "Toolhouse.ai",
  clickable: false,
  logo: "/logos/toolhouse.svg",
  price: 40
}, {
  id: "ministry",
  name: "Ministry of Programming",
  clickable: false,
  logo: "/logos/ministry.svg",
  price: 25
}, {
  id: "vapi",
  name: "VAPI",
  clickable: false,
  logo: "/logos/vapi.svg",
  price: 20
}, {
  id: "a1base",
  name: "A1Base",
  clickable: false,
  logo: "/logos/a1base.svg",
  price: 60
}];
const Logo = ({
  logo,
  name
}: {
  logo: string;
  name: string;
}) => <img src={logo} alt={`${name} logo`} className="w-24 h-24 object-contain" />;
const Storefront = () => {
  const navigate = useNavigate();
  const [openDialogId, setOpenDialogId] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showProcessingPopup, setShowProcessingPopup] = React.useState(false);
  // countdown state: target is 6 hours from component mount
  const [remainingMs, setRemainingMs] = useState<number>(() => 6 * 60 * 60 * 1000);
  useEffect(() => {
    const target = Date.now() + 6 * 60 * 60 * 1000; // 6 hours
    const tick = () => {
      const ms = Math.max(0, target - Date.now());
      setRemainingMs(ms);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor(total % 3600 / 60);
    const secs = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };
  return <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      <header className="border-b bg-white/80 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Store</h1>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm text-primary hover:underline">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-6">
          <div className="rounded-xl bg-red-600/95 text-white py-4 px-6 shadow-2xl flex items-center justify-between overflow-hidden relative">
            {/* energetic diagonal stripe overlay */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#ffffff10,#ffffff10_6px,#ffffff05_6px,#ffffff05_12px)] opacity-30 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold tracking-tight">Mega Sale — 90% OFF Credits</h2>
              <p className="text-sm opacity-95 mt-1">Limited time offers from top sponsors. Grab credits while they last.</p>
            </div>

            <div className="relative z-10 text-right flex items-center gap-6">
              <div className="text-sm uppercase tracking-wide">Save</div>
              <div className="text-3xl font-extrabold">90%</div>
              <div className="ml-4 px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-sm font-mono">
                <div className="text-[14px]">Ends in</div>
                <div className="text-lg font-extrabold animate-pulse">{fmt(remainingMs)}</div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sponsors.map(s => {
          const discounted = Math.round(s.price * 0.1); // 90% off

          const card = <div key={s.id} className="relative rounded-2xl p-6 bg-white/80 border border-gray-100 shadow-xl flex flex-col items-center gap-4 hover:-translate-y-2 hover:shadow-2xl transform transition duration-250">
                <div className="absolute -top-5 right-5 bg-red-700 text-white text-xl font-extrabold px-5 py-2 rounded-full transform rotate-6 shadow-xl">90% OFF</div>
                <div className="bg-white rounded-full p-3 shadow-sm">
                  <Logo logo={s.logo} name={s.name} />
                </div>
                <div className="text-lg font-semibold text-slate-900">{s.name}</div>
                <div className="text-sm"><span className="line-through text-gray-400 mr-2">${s.price}</span><span className="text-red-600 font-extrabold">${discounted}</span></div>
                <div className="mt-2 w-full flex items-center justify-center">
                  <div className="text-xs text-muted-foreground">Limited time • while supplies last</div>
                </div>
              </div>;
          if (s.clickable && s.id === "elevenlabs") {
            return <Dialog key={s.id} open={openDialogId === s.id} onOpenChange={v => setOpenDialogId(v ? s.id : null)}>
                  <DialogTrigger asChild>
                    {card}
                  </DialogTrigger>

                  <DialogContent>
                    {!isProcessing && !showProcessingPopup && <>
                        <DialogHeader>
                          <DialogTitle>ElevenLabs — Creator Offer</DialogTitle>
                          <DialogDescription>3 months Creator Plan free</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-muted-foreground">Redeem this limited creator plan from ElevenLabs.</p>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => {
                      // start 3s loading, then show processing popup
                      setIsProcessing(true);
                      setTimeout(() => {
                        setIsProcessing(false);
                        setShowProcessingPopup(true);
                        // after showing processing prompt for 4s, redirect home
                        setTimeout(() => {
                          setShowProcessingPopup(false);
                          setOpenDialogId(null);
                          navigate("/");
                        }, 4000);
                      }, 3000);
                    }}>Play Now</Button>
                          <Button variant="ghost" className="ml-2" onClick={() => setOpenDialogId(null)}>Close</Button>
                        </DialogFooter>
                      </>}

                    {isProcessing && <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary mb-4"></div>
                        <div className="text-lg font-semibold">Preparing your purchase...</div>
                        <div className="text-sm text-muted-foreground mt-2">Just a moment — we're getting things ready.</div>
                      </div>}

                    {showProcessingPopup && <div className="py-4">
                        <div className="text-center">
                          <h3 className="text-xl font-bold">Processing your purchase</h3>
                          <p className="text-sm text-muted-foreground mt-2">Draw a Labubu while you wait!</p>
                        </div>
                        <div className="mt-4">
                          <DrawingCanvas onSubmit={() => {/* no-op while drawing */}} aiEnabled={false} />
                        </div>
                        <div className="mt-4 text-center text-sm text-muted-foreground">You'll be redirected when processing completes.</div>
                      </div>}
                  </DialogContent>
                </Dialog>;
          }
          if (s.clickable && s.id === "morph") {
            return <Dialog key={s.id} open={openDialogId === s.id} onOpenChange={v => setOpenDialogId(v ? s.id : null)}>
                  <DialogTrigger asChild>
                    {card}
                  </DialogTrigger>

                  <DialogContent>
                    {!isProcessing && !showProcessingPopup && <>
                        <DialogHeader>
                          <DialogTitle>Morph — Credits</DialogTitle>
                          <DialogDescription>$50 of credits</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-muted-foreground">Instantly add $50 of Morph credits to your account.</p>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => {
                      setIsProcessing(true);
                      setTimeout(() => {
                        setIsProcessing(false);
                        setShowProcessingPopup(true);
                        setTimeout(() => {
                          setShowProcessingPopup(false);
                          setOpenDialogId(null);
                          navigate("/");
                        }, 4000);
                      }, 3000);
                    }}>
                            Play Now
                          </Button>
                          <Button onClick={() => window.open('https://buy.stripe.com/00wbJ2gBBepq1iV0Xa8og04', '_blank')}>
                            Buy Now
                          </Button>
                          <Button variant="ghost" className="ml-2" onClick={() => setOpenDialogId(null)}>Close</Button>
                        </DialogFooter>
                      </>}

                    {isProcessing && <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary mb-4"></div>
                        <div className="text-lg font-semibold">Preparing your credits...</div>
                        <div className="text-sm text-muted-foreground mt-2">Hang tight — we're processing your request.</div>
                      </div>}

                    {showProcessingPopup && <div className="py-4">
                        <div className="text-center">
                          <h3 className="text-xl font-bold">Processing your purchase</h3>
                          <p className="text-sm text-muted-foreground mt-2">Draw a Labubu while you wait!</p>
                        </div>
                        <div className="mt-4">
                          <DrawingCanvas onSubmit={() => {/* no-op */}} aiEnabled={false} />
                        </div>
                        <div className="mt-4 text-center text-sm text-muted-foreground">You'll be redirected when processing completes.</div>
                      </div>}
                  </DialogContent>
                </Dialog>;
          }
          return card;
        })}
        </section>
      </main>
    </div>;
};
export default Storefront;