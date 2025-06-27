import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Cloud, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadSectionProps {
  onImageUpload: (file: File, dataUrl: string) => void;
}

export default function UploadSection({ onImageUpload }: UploadSectionProps) {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (PNG, JPG, JPEG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload(file, e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, [onImageUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  });

  return (
    <div className="text-center mb-6 sm:mb-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
            Edit Screenshots Like a Pro
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mb-6 px-4">
            Professional image editing in your browser. No signup, no downloads, completely free.
          </p>
        </div>
        
        {/* Upload Area */}
        <div 
          {...getRootProps()} 
          className={`drop-zone bg-white rounded-xl p-6 sm:p-12 mb-6 cursor-pointer hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md ${
            isDragActive ? 'drag-over scale-105' : ''
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">
              {isDragActive ? 'Drop your image here!' : 'Upload Your Screenshot'}
            </h3>
            <p className="text-slate-500 mb-4 sm:mb-6 text-sm sm:text-base">
              Drag & drop or tap to browse files
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all">
              Choose File
            </Button>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="flex items-center justify-center sm:justify-start">
            <Check className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
            <span>PNG, JPG, JPEG support</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start">
            <Check className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
            <span>Up to 10MB file size</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start">
            <Check className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
            <span>100% free forever</span>
          </div>
        </div>
      </div>
    </div>
  );
}
