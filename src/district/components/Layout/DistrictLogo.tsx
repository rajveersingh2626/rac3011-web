const logoImg = '/20260803_134104_0000.webp';

export interface DistrictLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function DistrictLogo({ size = 'medium', className = '' }: DistrictLogoProps) {
  const height = size === 'small' ? 30 : size === 'large' ? 40 : 34;

  return (
    <div 
      className={`district-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        height: `${height}px`
      }}
    >
      <img
        src={logoImg}
        alt="Rotaract District Organisation Logo"
        style={{
          height: '100%',
          width: 'auto',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
