import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, RotateCw, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export default function ImageGallery({ images, alt = 'Property image' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetZoom();
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetZoom();
  }, [images.length]);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    resetZoom();
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    resetZoom();
    document.body.style.overflow = '';
  }, [resetZoom]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newLevel = Math.max(prev - 0.5, 1);
      if (newLevel === 1) setPosition({ x: 0, y: 0 });
      return newLevel;
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [handleZoomIn, handleZoomOut]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsDragging(false);
    } else if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  }, [zoomLevel, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoomLevel, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          closeLightbox();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, goToPrevious, goToNext, closeLightbox, handleZoomIn, handleZoomOut, resetZoom]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-secondary-100 dark:bg-secondary-800 rounded-2xl flex items-center justify-center">
        <p className="text-secondary-500">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="relative aspect-[16/10] md:row-span-2 rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={images[0]}
            alt={`${alt} 1`}
            loading="eager"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-2 group-hover:translate-y-0">
              <div className="bg-white/20 backdrop-blur-md rounded-full p-4">
                <Maximize2 className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className="relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(index + 1)}
          >
            <img
              src={image}
              alt={`${alt} ${index + 2}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                  <Maximize2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            {index === 3 && images.length > 5 && (
              <div
                className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer backdrop-blur-sm"
                onClick={() => openLightbox(4)}
              >
                <div className="text-center">
                  <span className="text-white text-3xl font-bold">
                    +{images.length - 5}
                  </span>
                  <p className="text-white/80 text-sm mt-1">more photos</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-white/90 text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-white text-sm min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </div>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={resetZoom}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 ml-2"
              title="Reset zoom"
            >
              <RotateCw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={closeLightbox}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 ml-2"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 group"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </button>

          <div
            ref={containerRef}
            className="relative flex items-center justify-center w-full h-full overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <img
              ref={imageRef}
              src={images[currentIndex]}
              alt={`${alt} ${currentIndex + 1}`}
              className="max-w-[92vw] max-h-[88vh] object-contain transition-transform duration-300 select-none"
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                transition: isDragging ? 'none' : 'transform 300ms ease-out',
              }}
              draggable={false}
            />
          </div>

          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 group"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3">
              <span className="text-white/70 text-xs hidden md:inline">← → to navigate</span>
              <span className="text-white/40 hidden md:inline">|</span>
              <span className="text-white/70 text-xs hidden md:inline">+/- to zoom</span>
              <span className="text-white/40 hidden md:inline">|</span>
              <span className="text-white/70 text-xs">ESC to close</span>
            </div>
          </div>

          <div className="absolute bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  resetZoom();
                }}
                className={`w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${
                  index === currentIndex ? 'ring-2 ring-luxury-gold scale-105' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
