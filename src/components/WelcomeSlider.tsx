import React, { useState } from "react";
import {
  Gift,
  CheckCircle2,
  CalendarCheck,
  Pickaxe,
  Coins,
  ArrowRightLeft,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface WelcomeSliderProps {
  onComplete?: () => void;
}

const WelcomeSlider: React.FC<WelcomeSliderProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

    const {
      config
    } = useAppContext();

  const slides = [
    {
      title: `Earn Free ${config?.coin_ticker}`,
      subtitle: "Complete tasks & claim rewards",
      description:
        `Complete simple tasks, claim free rewards and check in every day to keep earning ${config?.coin_ticker}.`,
      icon: Gift,
      features: [
        {
          icon: CheckCircle2,
          text: "Complete Tasks",
        },
        {
          icon: Gift,
          text: "Claim Free Rewards",
        },
        {
          icon: CalendarCheck,
          text: "Daily Check-in",
        },
      ],
    },
    {
      title: `Free ${config?.coin_ticker} Mining`,
      subtitle: `Mine ${config?.coin_ticker} every day`,
      description:
        `Start mining ${config?.coin_ticker} for free. Keep your mining session active and grow your ${config?.coin_ticker} balance over time.`,
      icon: Pickaxe,
      features: [
        {
          icon: Pickaxe,
          text: "Free Mining",
        },
        {
          icon: Coins,
          text: `Earn ${config?.coin_ticker}`,
        },
        {
          icon: TrendingUp,
          text: "Grow Your Balance",
        },
      ],
    },
    {
      title: "Mine. Exchange. Earn.",
      subtitle: `Turn ${config?.coin_ticker} into more opportunities`,
      description:
        `Mine ${config?.coin_ticker} and exchange it for ${config?.coin_ticker} every month, or stake your ${config?.coin_ticker} to unlock extra earning opportunities.`,
      icon: ArrowRightLeft,
      features: [
        {
          icon: ArrowRightLeft,
          text: `Exchange for ${config?.coin_ticker}`,
        },
        {
          icon: TrendingUp,
          text: "Monthly Exchange",
        },
        {
          icon: Coins,
          text: `Stake for Extra Earnings`,
        },
      ],
    },
  ];

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      onComplete?.();
      return;
    }

    setCurrentSlide((prev) => prev + 1);
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-5">

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand-600/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 left-1/3 w-52 h-52 bg-brand-500/10 blur-[90px] rounded-full" />

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-[#090909] to-brand-500/[0.05] shadow-2xl">

          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-brand-500/10 to-transparent pointer-events-none" />

          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full border border-brand-400/10" />
          <div className="absolute -top-14 -right-14 w-36 h-36 rounded-full border border-brand-400/10" />

          <div className="relative p-6 sm:p-8">

            {/* Logo / Welcome */}
            <div className="flex justify-between items-center mb-7">

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-400/20 border border-white/10 flex items-center justify-center">
                  <Sparkles
                    size={15}
                    className="text-brand-300"
                  />
                </div>

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                  Welcome to {config?.coin_ticker}
                </span>
              </div>

              <span className="text-[9px] font-mono font-bold text-white/30">
                {currentSlide + 1}/{slides.length}
              </span>

            </div>

            {/* Icon */}
            <div className="flex justify-center mb-7">

              <div className="relative">

                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-r from-brand-500 to-brand-400 blur-2xl opacity-20" />

                <div className="relative w-24 h-24 rounded-[30px] border border-white/10 bg-gradient-to-br from-brand-500/10 via-brand-500/10 to-brand-400/10 flex items-center justify-center shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]">
                  <Icon
                    size={42}
                    strokeWidth={1.5}
                    className="text-brand-300"
                  />
                </div>

              </div>

            </div>

            {/* Text */}
            <div className="text-center">

              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight bg-gradient-to-r from-white via-white to-neutral-500 bg-clip-text text-transparent">
                {slide.title}
              </h1>

              <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] bg-gradient-to-r from-brand-400 to-brand-400 bg-clip-text text-transparent">
                {slide.subtitle}
              </p>

              <p className="mt-4 text-sm leading-6 text-white/45 max-w-sm mx-auto">
                {slide.description}
              </p>

            </div>

            {/* Features */}
            <div className="mt-7 space-y-2">

              {slide.features.map((feature, index) => {
                const FeatureIcon = feature.icon;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/10 to-brand-400/10 border border-white/5 flex items-center justify-center">
                      <FeatureIcon
                        size={14}
                        className="text-brand-300"
                      />
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                      {feature.text}
                    </span>
                  </div>
                );
              })}

            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-7">

              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-7 bg-gradient-to-r from-brand-400 to-brand-400"
                      : "w-1.5 bg-white/20"
                  }`}
                />
              ))}

            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-6">

              {currentSlide > 0 && (
                <button
                  onClick={previousSlide}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-3.5 text-[9px] font-black uppercase tracking-widest text-white/50 hover:bg-white/[0.06] transition-all"
                >
                  Back
                </button>
              )}

              <button
                onClick={nextSlide}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 py-3.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-brand-500/10 active:scale-[0.98] transition-all"
              >
                {currentSlide === slides.length - 1
                  ? "Start Earning"
                  : "Continue"}

                <ChevronRight size={14} />
              </button>

            </div>

          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center mt-4 text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">
          Your journey starts here
        </p>

      </div>
    </div>
  );
};

export default WelcomeSlider;
