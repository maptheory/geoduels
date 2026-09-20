import { MapPin } from 'lucide-react';

const NO_GUESS_DISTANCE_THRESHOLD_KM = 20000;

function formatDistanceLabel(distanceKm: number, isDuel: boolean) {
  if (isDuel && distanceKm >= NO_GUESS_DISTANCE_THRESHOLD_KM) return 'rip';
  return `${Math.round(distanceKm).toLocaleString()} km`;
}

export function ResultDistanceBar({
  selfDistanceKm,
  oppDistanceKm,
  compact = false,
}: {
  selfDistanceKm?: number;
  oppDistanceKm?: number;
  compact?: boolean;
}) {
  if (selfDistanceKm === undefined) return null;

  const isDuel = oppDistanceKm !== undefined;
  const iconSize = compact ? 'h-7 w-7' : 'h-10 w-10 md:h-12 md:w-12';
  const iconPositionClass = isDuel ? 'left-1/2 -translate-x-1/2' : 'right-0 translate-x-1/2';
  const containerClass = compact
    ? 'h-12 w-[140px] md:h-14 md:w-[170px] rounded-lg bg-status-success'
    : 'h-12 w-[280px] md:h-14 md:w-[340px] rounded-lg border-4 border-brand-blue bg-brand-blue';
  const selfInsetClass = isDuel ? 'rounded-l-md' : 'rounded-md';
  const selfPaddingClass = isDuel ? 'pr-[30px]' : '';

  return (
    <div className={`${containerClass} relative flex overflow-visible drop-shadow-lg`}>
      <div className={`relative flex items-center bg-status-success px-2 ${selfPaddingClass} ${isDuel ? 'flex-1 rounded-l-md' : 'w-full rounded-md'}`}>
        <div className={`pointer-events-none absolute inset-[3px] ${selfInsetClass} border-[2.5px] border-dotted border-content-on-action`} />
        <span className="relative z-content w-full truncate text-center text-heading-sm font-strong italic tracking-heading text-content-on-action drop-shadow-sm">{formatDistanceLabel(selfDistanceKm, isDuel)}</span>
      </div>
      {isDuel ? (
        <div className="relative flex flex-1 items-center rounded-r-md bg-brand-blue px-2 pl-[30px]">
          <div className="pointer-events-none absolute inset-[3px] rounded-r-md border-[2.5px] border-dotted border-content-on-action" />
          <span className="relative z-content w-full truncate text-center text-heading-sm font-strong italic tracking-heading text-content-on-action drop-shadow-sm">{formatDistanceLabel(oppDistanceKm, true)}</span>
        </div>
      ) : null}
      <div
        className={`absolute top-1/2 ${iconPositionClass} z-sticky flex ${iconSize} -translate-y-1/2 items-center justify-center rounded-full border-3 border-content-on-action shadow-elev-1 ${compact ? 'bg-status-success' : 'bg-status-info'}`}
      >
        <MapPin
          size={compact ? 14 : 20}
          strokeWidth={2.25}
          className={compact ? 'text-content-inverse' : 'text-content-on-action'}
          aria-hidden
        />
      </div>
    </div>
  );
}
