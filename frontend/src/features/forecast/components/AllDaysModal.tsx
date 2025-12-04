import React from "react";
import { Eye } from "lucide-react";
import { DayInfo } from "../types/weather";

interface AllDaysModalProps {
	days: DayInfo[];
	onClose: () => void;
	onSelect: (id: string) => void;
}

export function AllDaysModal({ days, onClose, onSelect }: AllDaysModalProps) {
	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-6">
			<div className="bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-2xl shadow-xl">
				<h2 className="text-2xl font-bold mb-4 text-center">All Days</h2>

				<div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2">
					{days.map((d) => (
						<div
							key={d._id}
							className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3"
						>
							<div className="flex flex-col">
								<span><b>Day:</b> {d.dayNumber}</span>
								<span><b>Weekday:</b> {d.weekday}</span>
								<span><b>Month:</b> {d.month}</span>
								<span><b>Year:</b> {d.year}</span>
								<span><b>Hour:</b> {d.hour}</span>
							</div>

							<button
								onClick={() => onSelect(d._id)}
								className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
							>
								<Eye className="w-5 h-5" />
							</button>
						</div>
					))}
				</div>

				<button
					onClick={onClose}
					className="mt-6 w-full px-4 py-2 bg-red-500/40 border border-red-500/50 rounded-xl hover:bg-red-600/50 transition"
				>
					Close
				</button>
			</div>
		</div>
	);
}
