import React from "react";

export function BackgroundEffect({ weather }: { weather: "snow" | "rain" }) {
	const snowflakes = Array.from({ length: 80 });
	const raindrops = Array.from({ length: 120 });

	const Snowflake = ({ size }: { size: number }) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			className="absolute animate-snow"
			style={{
				top: `${-size}px`,
				left: `${Math.random() * 100}%`,
				animationDelay: `${Math.random() * 10}s`,
				animationDuration: `${5 + Math.random() * 5}s`,
			}}
		>
			<g stroke="white" strokeWidth="1.5" strokeLinecap="round">
				<line x1="12" y1="0" x2="12" y2="24" />
				<line x1="0" y1="12" x2="24" y2="12" />
				<line x1="4" y1="4" x2="20" y2="20" />
				<line x1="20" y1="4" x2="4" y2="20" />
			</g>
		</svg>
	);

	const RainDrop = ({ width, height, delay, duration }: any) => (
		<div
			className="absolute bg-blue-400 opacity-70 rounded-full animate-rain"
			style={{
				width,
				height,
				left: `${Math.random() * 100}%`,
				top: -height,
				animationDelay: `${delay}s`,
				animationDuration: `${duration}s`,
			}}
		/>
	);

	return (
		<>
			{weather === "snow" &&
				snowflakes.map((_, i) => <Snowflake key={i} size={4 + Math.random() * 10} />)}

			{weather === "rain" &&
				raindrops.map((_, i) => (
					<RainDrop
						key={i}
						width={Math.random() * 2 + 1}
						height={Math.random() * 12 + 10}
						delay={Math.random() * 5}
						duration={0.7 + Math.random() * 0.8}
					/>
				))}

			<style>{`
        @keyframes snow {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0.2; }
        }
        @keyframes rain {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        .animate-snow { animation: snow linear infinite; }
        .animate-rain { animation: rain linear infinite; }
      `}</style>
		</>
	);
}
