import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex items-center justify-center mx-auto animate-pulse">
          <Image
            src="/brand/ivt/IVT_logo_Horizontal@3x.png"
            alt="Innovation Valley Thüringen"
            width={883}
            height={372}
            priority
            className="h-40 w-auto max-w-[80vw] object-contain"
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
