import React from "react";

interface SmallWeatherCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
}

export function SmallWeatherCard({ title, value, icon }: SmallWeatherCardProps) {
	return (
		<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col items-center shadow-lg hover:scale-105 transform transition-transform duration-500">
			{icon}
			<span className="text-lg">{title}</span>
			<span className="text-1xl font-bold">{value}</span>
		</div>
	);
}
