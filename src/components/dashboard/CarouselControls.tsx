import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SLIDE_DURATION } from '@/hooks/useDashboard';

const SLIDE_LABELS = ['Klasifikasi', 'Rekonsiliasi', 'Arsip'] as const;

interface CarouselControlsProps {
  slide: number;
  paused: boolean;
  onGoTo: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function CarouselControls({
  slide,
  paused,
  onGoTo,
  onPrev,
  onNext,
  onMouseEnter,
  onMouseLeave,
}: CarouselControlsProps) {
  return (
    <div
      className="flex items-center justify-between mb-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
        {SLIDE_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => onGoTo(i)}
            className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              slide === i
                ? 'bg-white dark:bg-slate-700 text-green-700 dark:text-green-400 shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
            }`}
          >
            {label}
            {slide === i && (
              <span
                key={`prog-${i}-${paused}`}
                className="absolute bottom-0.5 left-2 right-2 h-0.5 bg-green-500 rounded-full origin-left"
                style={{
                  animation: paused ? 'none' : `dashProgress ${SLIDE_DURATION}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-xs text-gray-400 tabular-nums w-8 text-center">
          {slide + 1}&nbsp;/&nbsp;{SLIDE_LABELS.length}
        </span>
        <button
          onClick={onNext}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
