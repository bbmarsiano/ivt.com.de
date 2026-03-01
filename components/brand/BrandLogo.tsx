'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  lockup?: 'horizontal' | 'stacked' | 'icon';
  className?: string;
  priority?: boolean;
}

/**
 * BrandLogo - Reusable IVT logo component
 * 
 * @param variant - 'light' for light backgrounds, 'dark' for dark backgrounds
 * @param lockup - 'horizontal' | 'stacked' | 'icon'
 * @param className - Additional CSS classes
 * @param priority - Whether to prioritize image loading (for above-the-fold logos)
 */
export function BrandLogo({
  variant = 'light',
  lockup = 'horizontal',
  className = '',
  priority = false,
}: BrandLogoProps) {
  // Asset mapping based on variant and lockup
  const getImageSrc = (): string => {
    if (lockup === 'icon') {
      return '/brand/ivt/IVT_Icon@3x.png';
    }

    if (variant === 'light') {
      if (lockup === 'horizontal') {
        return '/brand/ivt/IVT_logo_Horizontal@3x.png';
      }
      // stacked
      return '/brand/ivt/IVT_logo@3x.png';
    }

    // dark variant
    if (lockup === 'horizontal') {
      return '/brand/ivt/IVT_logo_white_horizontal@3x.png';
    }
    // stacked
    return '/brand/ivt/IVT_logo_white@3x.png';
  };

  const src = getImageSrc();

  return (
    <Link href="/" className="flex items-center">
      <Image
        src={src}
        alt="Innovation Valley Thüringen"
        width={883}
        height={372}
        sizes="100vw"
        priority={priority}
        className={cn("h-full w-auto object-contain", className)}
      />
    </Link>
  );
}
