export default function HaroPitch({ pitch }) {
  if (!pitch) return null;
  const question = pitch.query ?? 'N/A';
  const expertPitch = pitch.expert_pitch || pitch.humanized_pitch || pitch.proposed_pitch || 'N/A';
  const matchTime = pitch.createdAt ?? 'N/A';
  const deadline = pitch.deadline_original || pitch.deadline || pitch.deadline_iso || 'N/A';
  const mediaOutlet = pitch.media_outlet ?? 'N/A';
  const journalistName = pitch.journalist_name ?? 'N/A';

  return (
    <article className="haro-pitch-card">
      <div className="haro-pitch-card__inner">
        <div className="haro-pitch-card__header">
          <p className="haro-pitch-card__outlet">{mediaOutlet}</p>
          <p className="haro-pitch-card__meta">Match Time: {matchTime}</p>
        </div>

        <div className="haro-pitch-card__content">
          <div>
            <span className="haro-pitch-card__label">Question</span>
            <p className="haro-pitch-card__question">{question}</p>
          </div>

          <div>
            <span className="haro-pitch-card__label">Pitch</span>
            <p className="haro-pitch-card__pitch">{expertPitch}</p>
          </div>
        </div>

        <div className="haro-pitch-card__footer">
          <div>
            <p className="haro-pitch-card__footer-label">Journalist</p>
            <p className="haro-pitch-card__footer-value">{journalistName}</p>
          </div>
          <div className="haro-pitch-card__footer-side">
            <p className="haro-pitch-card__footer-label">Deadline</p>
            <p className="haro-pitch-card__deadline">{deadline}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
