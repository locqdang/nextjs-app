export default function HaroPitch({pitch}){
if (!pitch) return null;

  const question = pitch.query ?? "N/A";
  const expertPitch = pitch.expert_pitch ?? "N/A";
  const matchTime = pitch.match_time ?? "N/A";
  const deadline = pitch.deadline ?? "N/A";
  const mediaOutlet = pitch.media_outlet ?? "N/A";
  const journalistName = pitch.journalist_name ?? "N/A";
  const matchId = pitch.match_id ?? "";

  return (
    <article className="card">
      <div className="card__body">
        <p><strong>Question:</strong> {question}</p>
        <p><strong>Pitch:</strong> {expertPitch}</p>
        <p><strong>Match Time:</strong> {matchTime}</p>
        <p><strong>Deadline:</strong> {deadline}</p>
        <p><strong>Media Outlet:</strong> {mediaOutlet}</p>
        <p><strong>Journalist Name:</strong> {journalistName}</p>
      </div>
      <input type="hidden" name="matchId" value={matchId} />
    </article>
  );
}