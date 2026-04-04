export default function HaroPitch({pitch}){
    if (!pitch) return null;
    console.log({pitch})
    const question = pitch.query ?? "N/A";
    const expertPitch = pitch.expert_pitch || pitch.humanized_pitch || pitch.proposed_pitch || "N/A";
    const matchTime = pitch.createdAt ?? "N/A";
    const deadline = pitch.deadline_original || pitch.deadline || pitch.deadline_iso || "N/A";
    const mediaOutlet = pitch.media_outlet ?? "N/A";
    const journalistName = pitch.journalist_name ?? "N/A";
    const matchId = pitch.match_id || "N/A";

    return (
        <article className="mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 my-5">
            <div className="p-6 space-y-4">
                {/* Header Section */}
                <div className="border-b border-slate-100 pb-3 text-center">
                    <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">{mediaOutlet}</p>
                    <p className="text-xs text-slate-500">Match Time: {matchTime}</p>
                </div>

                {/* Content Section */}
                <div className="space-y-3">
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">Question</span>
                        <p className="text-slate-800 whitespace-pre-wrap">{question}</p>
                    </div>

                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">Pitch</span>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{expertPitch}</p>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                    <div>
                        <p className="text-xs text-slate-400">Journalist</p>
                        <p className="text-sm font-semibold text-slate-700">{journalistName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400">Deadline</p>
                        <p className="text-sm font-bold text-red-500">{deadline}</p>
                    </div>
                </div>
            </div>
        </article>
    );
}