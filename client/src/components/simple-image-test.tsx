import { useEffect, useState } from "react";

interface SimpleImageTestProps {
  imageData: string | null;
}

export default function SimpleImageTest({ imageData }: SimpleImageTestProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    if (imageData) {
      console.log('SimpleImageTest received imageData:', imageData.substring(0, 100) + '...');
      setImageLoaded(false);
      setImageError(false);
    }
  }, [imageData]);

  if (!imageData) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium text-slate-700">No Image Data</h3>
        <p className="text-slate-500">Waiting for image upload...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg border">
      <h3 className="text-lg font-medium text-slate-700 mb-4">Image Upload Test</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-600">Image data length: {imageData.length}</p>
          <p className="text-sm text-slate-600">Image data type: {imageData.split(',')[0]}</p>
        </div>
        
        <div className="border-2 border-dashed border-slate-300 p-4 rounded">
          {imageError ? (
            <div className="text-red-500">
              <p>Error loading image</p>
            </div>
          ) : (
            <img
              src={imageData}
              alt="Uploaded test"
              className="max-w-full h-auto border border-slate-200 rounded"
              onLoad={() => {
                console.log('Image loaded successfully in test component');
                setImageLoaded(true);
              }}
              onError={() => {
                console.error('Image failed to load in test component');
                setImageError(true);
              }}
            />
          )}
        </div>
        
        <div className="text-xs text-slate-500">
          Status: {imageLoaded ? '✅ Loaded' : imageError ? '❌ Error' : '⏳ Loading...'}
        </div>
      </div>
    </div>
  );
}