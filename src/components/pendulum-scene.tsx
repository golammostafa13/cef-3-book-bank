"use client";

import { cn } from "@/lib/utils";

export function PendulumScene({ className }: { className?: string }) {
  return (
    <div className={cn("w-full max-w-[260px] mx-auto", className)}>
      <svg
        viewBox="0 0 420 520"
        role="img"
        aria-label="CEF-3 Pendulum"
        className="pscene w-full"
      >
      <defs>
        <radialGradient id="ps-warm" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.32" />
          <stop offset="60%" stopColor="#059669" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ps-shade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#04231a" stopOpacity="0.34" />
          <stop offset="55%" stopColor="#04231a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#04231a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="210" cy="260" rx="190" ry="180" fill="url(#ps-warm)" />
{/* 
      <g className="pscene__ink" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="210" cy="430" rx="140" ry="12" fill="url(#ps-shade)" />
        <path d="M70 428h280" strokeWidth="2.5" opacity="0.32" fill="none" />
      </g> */}

      <g className="pscene__hoverlift">
        <image
          href="/Cef-3_pendulam.png"
          x="135"
          y="110"
          width="150"
          height="300"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>

      <g transform="translate(110 90) scale(1)">
        <path
          className="pscene__twinkle"
          style={{ animationDelay: "0s" }}
          d="M0-10C1.6-3.4 3.4-1.6 10 0 3.4 1.6 1.6 3.4 0 10-1.6 3.4-3.4 1.6-10 0-3.4-1.6-1.6-3.4 0-10Z"
          fill="#34d399"
          stroke="none"
        />
      </g>
      <g transform="translate(300 70) scale(0.85)">
        <path
          className="pscene__twinkle"
          style={{ animationDelay: "-1.4s" }}
          d="M0-10C1.6-3.4 3.4-1.6 10 0 3.4 1.6 1.6 3.4 0 10-1.6 3.4-3.4 1.6-10 0-3.4-1.6-1.6-3.4 0-10Z"
          fill="#6ee7b7"
          stroke="none"
        />
      </g>
      <g transform="translate(90 210) scale(0.7)">
        <path
          className="pscene__twinkle"
          style={{ animationDelay: "-2.6s" }}
          d="M0-10C1.6-3.4 3.4-1.6 10 0 3.4 1.6 1.6 3.4 0 10-1.6 3.4-3.4 1.6-10 0-3.4-1.6-1.6-3.4 0-10Z"
          fill="#2f8b86"
          stroke="none"
        />
      </g>
      <g transform="translate(310 340) scale(0.8)">
        <path
          className="pscene__twinkle"
          style={{ animationDelay: "-0.8s" }}
          d="M0-10C1.6-3.4 3.4-1.6 10 0 3.4 1.6 1.6 3.4 0 10-1.6 3.4-3.4 1.6-10 0-3.4-1.6-1.6-3.4 0-10Z"
          fill="#a3e635"
          stroke="none"
        />
      </g>
    </svg>
    </div>
  );
}
