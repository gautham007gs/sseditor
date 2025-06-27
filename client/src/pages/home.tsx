import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, HelpCircle, Download, Menu, Check } from "lucide-react";
import UploadSection from "@/components/upload-section";
import EditorSection from "@/components/editor-section";
import FeaturesSection from "@/components/features-section";
import SEOHead from "@/components/seo-head";
import { useImageEditor } from "@/hooks/use-image-editor";

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { 
    imageData, 
    isEditorVisible, 
    showEditor,
    downloadImage,
    imageInfo 
  } = useImageEditor();

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-800">ScreenEdit Pro</h1>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <HelpCircle className="w-5 h-5" />
                </Button>
                
                {isEditorVisible && (
                  <Button 
                    onClick={downloadImage}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
              
              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="sm"
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Upload Section */}
          {!isEditorVisible && (
            <div id="upload-section">
              <UploadSection onImageUpload={showEditor} />
            </div>
          )}

          {/* Editor Section */}
          {isEditorVisible && (
            <EditorSection 
              imageData={imageData}
              imageInfo={imageInfo}
            />
          )}

          {/* Features Section */}
          {!isEditorVisible && (
            <>
              <FeaturesSection />
              
              {/* Examples Section */}
              <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">See It In Action</h2>
                  <p className="text-lg text-slate-600">Real examples of before and after editing</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
                      alt="Before editing - raw screenshot" 
                      className="rounded-xl shadow-lg w-full h-auto" 
                    />
                    <Badge className="absolute top-4 left-4 bg-red-500">Before</Badge>
                  </div>
                  
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
                      alt="After editing - professional result" 
                      className="rounded-xl shadow-lg w-full h-auto" 
                    />
                    <Badge className="absolute top-4 left-4 bg-emerald-500">After</Badge>
                  </div>
                </div>
                
                <div className="text-center mt-8">
                  <Button 
                    onClick={scrollToUpload}
                    size="lg"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
                  >
                    Try It Yourself
                  </Button>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">ScreenEdit Pro</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  The fastest and easiest way to edit screenshots and images online. 
                  No signup required, completely free forever.
                </p>
                <div className="text-sm text-slate-400">
                  © 2024 ScreenEdit Pro. All rights reserved.
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-slate-300">
                  <li>Screenshot Editing</li>
                  <li>Image Cropping</li>
                  <li>Text Overlay</li>
                  <li>Professional Filters</li>
                  <li>Shape Tools</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-slate-300">
                  <li>Help Center</li>
                  <li>Tutorials</li>
                  <li>Contact Us</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                </ul>
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile Download Button */}
        {isEditorVisible && (
          <div className="md:hidden fixed bottom-4 right-4 z-50">
            <Button 
              onClick={downloadImage}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg"
            >
              <Download className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
