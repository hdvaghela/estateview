import { Logo, HeartIcon } from './Icons.jsx';

export default function Header({ savedCount }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label="EstateView home">
          <Logo />
          <span className="font-display text-xl font-bold tracking-tight">EstateView</span>
        </a>
        <div className="flex items-center gap-2 text-sm font-medium" title="Saved properties">
          <HeartIcon className="text-brass" filled={savedCount > 0} />
          <span>{savedCount} saved</span>
        </div>
      </div>
    </header>
  );
}
