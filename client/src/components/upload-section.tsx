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
    <div className="text-center mb-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Edit Your Screenshots Instantly
        </h2>
        <p className="text-lg text-slate-600 mb-8">
          Upload any image and start editing right away. No signup required, completely free to use.
        </p>
        
        {/* Upload Area */}
        <div 
          {...getRootProps()} 
          className={`drop-zone bg-white rounded-xl p-12 mb-6 cursor-pointer hover:bg-slate-50 transition-colors ${
            isDragActive ? 'drag-over' : ''
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <Cloud className="w-16 h-16 text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {isDragActive ? 'Drop your image here' : 'Drop your image here'}
            </h3>
            <p className="text-slate-500 mb-4">or click to browse files</p>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3">
              Choose File
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
          <span className="flex items-center">
            <Check className="w-4 h-4 mr-1 text-emerald-500" />
            PNG, JPG, JPEG supported
          </span>
          <span className="flex items-center">
            <Check className="w-4 h-4 mr-1 text-emerald-500" />
            Up to 10MB
          </span>
          <span className="flex items-center">
            <Check className="w-4 h-4 mr-1 text-emerald-500" />
            100% Free
          </span>
        </div>
      </div>
    </div>
  );
}
