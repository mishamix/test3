interface BrandLogoProps {
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export default function BrandLogo({
  className = '',
  loading = 'lazy',
  fetchPriority,
}: BrandLogoProps) {
  return (
    <img
      src="/logo-anastelle-immo.svg"
      alt="Anastelle Immo"
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={`brand-logo object-contain bg-transparent ${className}`}
    />
  );
}
