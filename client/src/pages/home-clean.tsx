import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, HelpCircle, Download, Menu, Check, Plus } from "lucide-react";
import UploadSection from "@/components/upload-section";
import EnhancedEditor from "@/components/enhanced-editor";
import SimpleImageTest from "@/components/simple-image-test";
import FeaturesSection from "@/components/features-section";
import SEOHead from "@/components/seo-head";

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageInfo, setUploadedImageInfo] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleImageUpload = (file: File, dataUrl: string) => {
    console.log('Image upload triggered:', { fileName: file.name, size: file.size });
    setUploadedImage(dataUrl);
    setUploadedImageInfo({
      width: 0,
      height: 0,
      size: file.size,
      format: file.type.split('/')[1] || 'unknown'
    });
    setShowEditor(true);
    
    // Extract image dimensions
    const img = new Image();
    img.onload = () => {
      setUploadedImageInfo({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        format: file.type.split('/')[1] || 'unknown'
      });
    };
    img.src = dataUrl;
  };

  const handleDownload = () => {
    // Simple download functionality
    if (uploadedImage) {
      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = uploadedImage;
      link.click();
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setUploadedImageInfo(null);
    setShowEditor(false);
  };

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-2 shadow-lg">
                  <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ScreenEdit Pro
                  </h1>
                  <p className="text-xs text-slate-600 hidden sm:block">AI-Powered Screenshot Editor</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Button 
                  variant="ghost" 
                  onClick={scrollToUpload}
                  className="text-slate-700 hover:text-blue-600"
                >
                  Upload
                </Button>
                {showEditor && (
                  <Button 
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
              <div className="md:hidden border-t bg-white py-2">
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    onClick={scrollToUpload}
                    className="justify-start text-slate-700"
                  >
                    Upload Image
                  </Button>
                  {showEditor && (
                    <Button 
                      onClick={handleDownload}
                      className="justify-start bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Upload Section */}
          {!showEditor && (
            <div id="upload-section">
              <UploadSection onImageUpload={handleImageUpload} />
            </div>
          )}

          {/* Editor Section */}
          {showEditor && (
            <>
              {/* Quick help */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2 flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-800 mb-3 text-sm sm:text-base">Quick Start Guide</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-blue-700">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>OCR Extract</strong>: Auto-detect text in images</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Edit in Place</strong>: Click detected text to modify</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Drag & Drop</strong>: Move elements around easily</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Smart Editing</strong>: Preserves original formatting</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Debug: Simple image test */}
              <SimpleImageTest imageData={uploadedImage} />
              
              <EnhancedEditor 
                imageData={uploadedImage}
                imageInfo={uploadedImageInfo}
              />
            </>
          )}

          {/* Features Section - only show when no editor */}
          {!showEditor && (
            <>
              <div className="text-center py-8 sm:py-12">
                <div className="max-w-3xl mx-auto">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-6">
                    <Badge variant="secondary" className="bg-white/50">New</Badge>
                    <span className="text-sm font-medium text-slate-700">Client-side OCR powered by Tesseract.js</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                    Professional Screenshot Editing
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      With Smart Text Recognition
                    </span>
                  </h2>
                  
                  <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
                    Upload any screenshot and automatically detect text elements. Edit them in-place while preserving original formatting, fonts, and styling.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      onClick={scrollToUpload}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Start Editing
                    </Button>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>No signup required</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>100% client-side</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <FeaturesSection />
            </>
          )}

          {/* Back to Upload Button in Editor */}
          {showEditor && (
            <div className="mt-8 text-center">
              <Button 
                onClick={handleReset}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                ← Edit Another Image
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}