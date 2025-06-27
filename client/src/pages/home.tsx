import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, HelpCircle, Download, Menu, Check, Plus } from "lucide-react";
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
    imageInfo,
    resetEditor
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
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800">ScreenEdit Pro</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                {isEditorVisible && (
                  <Button 
                    onClick={downloadImage}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-3 py-2 sm:px-4 sm:py-2"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Upload Section */}
          {!isEditorVisible && (
            <div id="upload-section">
              <UploadSection onImageUpload={showEditor} />
            </div>
          )}

          {/* Editor Section */}
          {isEditorVisible && (
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
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Select & Edit</strong>: Tap elements to edit them instantly</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Move Around</strong>: Drag elements to reposition</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Add Elements</strong>: Use tools to add text & shapes</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span><strong>Apply Filters</strong>: Enhance with professional effects</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <EditorSection 
                imageData={imageData}
                imageInfo={imageInfo}
              />
            </>
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
        <footer className="bg-slate-900 text-white mt-12 sm:mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="sm:col-span-2 lg:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">ScreenEdit Pro</h3>
                </div>
                <p className="text-slate-300 mb-4 text-sm sm:text-base leading-relaxed">
                  Professional screenshot editing made simple. Edit, enhance, and perfect your images 
                  directly in your browser. No downloads, no signups - just powerful editing tools.
                </p>
                <div className="text-xs sm:text-sm text-slate-400">
                  © 2025 ScreenEdit Pro. All rights reserved.
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Tools</h4>
                <ul className="space-y-1 sm:space-y-2 text-slate-300 text-xs sm:text-sm">
                  <li>Smart Cropping</li>
                  <li>Text Overlay</li>
                  <li>Shape Tools</li>
                  <li>Professional Filters</li>
                  <li>Image Resizing</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Info</h4>
                <ul className="space-y-1 sm:space-y-2 text-slate-300 text-xs sm:text-sm">
                  <li>How it Works</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                  <li>Contact Support</li>
                  <li>Feature Requests</li>
                </ul>
              </div>
            </div>
            
            {/* Bottom section */}
            <div className="border-t border-slate-700 mt-6 sm:mt-8 pt-6 sm:pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-xs sm:text-sm text-slate-400">
                  Made with ❤️ for creators worldwide
                </div>
                <div className="flex space-x-6 text-xs sm:text-sm text-slate-400">
                  <span>100% Free</span>
                  <span>No Registration</span>
                  <span>Privacy First</span>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile Floating Action Buttons */}
        {isEditorVisible && (
          <div className="md:hidden fixed bottom-4 right-4 z-50 flex flex-col space-y-3">
            <Button 
              onClick={downloadImage}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg animate-bounce-in"
              title="Download Image"
            >
              <Download className="w-6 h-6" />
            </Button>
            
            {/* Quick Upload Button */}
            <Button 
              onClick={() => {
                resetEditor();
                setTimeout(() => {
                  document.getElementById('upload-section')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }, 100);
              }}
              size="lg"
              variant="outline"
              className="bg-white border-2 border-slate-300 text-slate-700 p-4 rounded-full shadow-lg"
              title="Upload New Image"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
