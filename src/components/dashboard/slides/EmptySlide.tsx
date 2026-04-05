import Link from 'next/link';

interface EmptySlideProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: { href: string; label: string; icon: React.ReactNode };
  bg: string;
}

export default function EmptySlide({ icon, title, description, link, bg }: EmptySlideProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
      <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      <Link
        href={link.href}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm"
      >
        {link.icon}
        {link.label}
      </Link>
    </div>
  );
}
