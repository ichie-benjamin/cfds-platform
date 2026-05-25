import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Image, X, Loader, Camera, Upload, IdCard, Check, Info, MapPin, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import Webcam from "react-webcam";
import { KYC_PARTNERS } from "@/constants/kyc-partners";
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";


export default function KYCVerifyPage() {
  const [currentStep, setCurrentStep] = useState(0); // 0: ID, 1: Residence, 2: Selfie, 3: Awaiting
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hide MainLayout chrome while this page is mounted (matches security/settings pattern)
  useEffect(() => {
    document.body.classList.add("verification-active");
    return () => {
      document.body.classList.remove("verification-active");
    };
  }, []);
  const [selectedIdType, setSelectedIdType] = useState<string>("passport");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [residenceFile, setResidenceFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [showWebcamFront, setShowWebcamFront] = useState(false);
  const [showWebcamBack, setShowWebcamBack] = useState(false);
  const [showWebcamSelfie, setShowWebcamSelfie] = useState(false);
  const [dragActiveFront, setDragActiveFront] = useState(false);
  const [dragActiveBack, setDragActiveBack] = useState(false);
  const [dragActiveResidence, setDragActiveResidence] = useState(false);
  const [dragActiveSelfie, setDragActiveSelfie] = useState(false);

  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);
  const fileInputResidenceRef = useRef<HTMLInputElement>(null);
  const fileInputSelfieRef = useRef<HTMLInputElement>(null);
  const webcamFrontRef = useRef<Webcam>(null);
  const webcamBackRef = useRef<Webcam>(null);
  const webcamSelfieRef = useRef<Webcam>(null);

  const idTypes = [
    {
      id: "passport",
      label: "Passport",
      description: "International travel document",
    },
    {
      id: "drivers",
      label: "Driver's License",
      description: "State issued license",
    },
    { id: "national", label: "National ID", description: "Government ID card" },
  ];

  // File handling functions
  const handleFileSelect = (file: File, type: "front" | "back" | "residence" | "selfie") => {
    if (file && file.type.startsWith("image/")) {
      if (type === "front") {
        setFrontFile(file);
      } else if (type === "back") {
        setBackFile(file);
      } else if (type === "residence") {
        setResidenceFile(file);
      } else {
        setSelfieFile(file);
      }
    }
  };

  const handleDrag = (e: React.DragEvent, type: "front" | "back" | "residence" | "selfie") => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === "front") setDragActiveFront(true);
      else if (type === "back") setDragActiveBack(true);
      else if (type === "residence") setDragActiveResidence(true);
      else setDragActiveSelfie(true);
    } else if (e.type === "dragleave") {
      if (type === "front") setDragActiveFront(false);
      else if (type === "back") setDragActiveBack(false);
      else if (type === "residence") setDragActiveResidence(false);
      else setDragActiveSelfie(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: "front" | "back" | "residence" | "selfie") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "front") setDragActiveFront(false);
    else if (type === "back") setDragActiveBack(false);
    else if (type === "residence") setDragActiveResidence(false);
    else setDragActiveSelfie(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0], type);
    }
  };

  const handleBrowseClick = (type: "front" | "back" | "residence" | "selfie") => {
    if (type === "front") {
      fileInputFrontRef.current?.click();
    } else if (type === "back") {
      fileInputBackRef.current?.click();
    } else if (type === "residence") {
      fileInputResidenceRef.current?.click();
    } else {
      fileInputSelfieRef.current?.click();
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back" | "residence" | "selfie",
  ) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0], type);
    }
  };

  const captureWebcam = (type: "front" | "back" | "selfie") => {
    let webcam;
    if (type === "front") webcam = webcamFrontRef.current;
    else if (type === "back") webcam = webcamBackRef.current;
    else webcam = webcamSelfieRef.current;

    if (webcam) {
      const imageSrc = webcam.getScreenshot();
      if (imageSrc) {
        // Convert base64 to File
        fetch(imageSrc)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File(
              [blob],
              `${type}.jpg`,
              { type: "image/jpeg" },
            );
            handleFileSelect(file, type);
            if (type === "front") setShowWebcamFront(false);
            else if (type === "back") setShowWebcamBack(false);
            else setShowWebcamSelfie(false);
          });
      }
    }
  };

  const handleContinue = async () => {
    if (currentStep === 0) {
      const isPassport = selectedIdType === "passport";
      if (!frontFile || (!isPassport && !backFile)) {
        alert(isPassport ? "Please upload your passport bio-data page" : "Please upload both front and back ID documents");
        return;
      }
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      if (!residenceFile) {
        alert("Please upload proof of residence document");
        return;
      }
      if (!address.trim()) {
        alert("Please enter your full residential address");
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!selfieFile) {
        alert("Please upload or take a selfie");
        return;
      }
      setCurrentStep(3);
    }

    // Simulate API call - replace with actual verification API
    setTimeout(() => {
      // You can replace this with actual API call later
      console.log("Verification submitted", {
        idType: selectedIdType,
        frontFile,
        backFile: selectedIdType === "passport" ? null : backFile,
        residenceFile,
        selfieFile,
        address,
      });
    }, 1500);
  };

  return (
    <>
      <style>{`
        body.verification-active .fixed.top-0.left-0.right-0.z-20,
        body.verification-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.verification-active .flex.flex-1.pt-\\[90px\\] {
          padding-top: 0 !important;
        }
        body.verification-active .flex-1.md\\:ml-\\[80px\\] {
          margin-left: 0 !important;
        }
      `}</style>

      <div
        className="fixed inset-0 z-30 flex flex-col font-[Inter,-apple-system,sans-serif]"
        style={{
          background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
          color: "#eef2f7",
        }}
      >
        <TickerBar />
        <DashboardNavbar />

        <div className="grid flex-1 grid-cols-1 md:grid-cols-[60px_1fr] min-h-0">
          <DashboardSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="overflow-y-auto px-4 py-6 md:px-8 flex flex-col items-center" style={{ maxHeight: "100%" }}>
            <div className="md:hidden self-start mb-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8b97a8] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
              >
                <Menu className="h-[1.05rem] w-[1.05rem]" />
              </button>
            </div>
            <div className={`${currentStep === 3 ? 'max-w-5xl' : 'max-w-4xl'} w-full mx-auto px-4 transition-all duration-500`}>
        {currentStep === 3 ? (
          // Awaiting Verification View
          <div
            className="flex flex-col items-center justify-center min-h-[400px] space-y-4 rounded-2xl border border-white/[0.06] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
            }}
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-[#00dfa2] rounded-full opacity-[0.12] animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="w-12 h-12 text-[#00dfa2] animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="font-[Outfit,sans-serif] text-[1.45rem] font-extrabold tracking-[-0.03em] text-[#eef2f7]">
                Awaiting Verification
              </h2>
              <p className="text-[0.75rem] max-w-sm mx-auto leading-relaxed text-[#8b97a8]">
                Your documents are being reviewed. This typically takes
                1-2 business days. We'll notify you via email once the
                verification is complete.
              </p>
            </div>
            <div className="w-full max-w-xs rounded-[10px] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[0.72rem]">
                <span className="text-[#4a5468]">ID Type:</span>
                <span className="text-[#eef2f7] font-semibold capitalize">
                  {selectedIdType}
                </span>
              </div>
              <div className="flex items-center justify-between text-[0.72rem]">
                <span className="text-[#4a5468]">ID Front:</span>
                <span className="text-[#eef2f7] font-semibold truncate max-w-[120px]">
                  {frontFile?.name}
                </span>
              </div>
              {selectedIdType !== "passport" && (
                <div className="flex items-center justify-between text-[0.72rem]">
                  <span className="text-[#4a5468]">ID Back:</span>
                  <span className="text-[#eef2f7] font-semibold truncate max-w-[120px]">
                    {backFile?.name}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-[0.72rem] pt-2 border-t border-white/[0.06]">
                <span className="text-[#4a5468]">Proof of Address:</span>
                <span className="text-[#eef2f7] font-semibold truncate max-w-[120px]">
                  {residenceFile?.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-[0.72rem] pt-2 border-t border-white/[0.06]">
                <span className="text-[#4a5468]">Selfie Verification:</span>
                <span className="text-[#eef2f7] font-semibold truncate max-w-[120px]">
                  {selfieFile?.name}
                </span>
              </div>
            </div>
            <div className="w-full pt-8 border-t border-white/[0.06] mt-4 text-center space-y-6">
              <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-[#00dfa2] uppercase tracking-[0.08em]">Integrated KYC Ecosystem</h3>
                <p className="text-[10px] text-[#8b97a8]  max-w-sm mx-auto leading-relaxed">
                  Your identity verification status is synchronized with our global exchange and financial partners to provide a seamless cross-platform experience.
                </p>
              </div>

              <div className="flex flex-nowrap md:grid md:grid-cols-10 gap-3 sm:gap-4 py-4 overflow-x-auto md:overflow-x-visible no-scrollbar justify-start md:justify-items-center">
                {KYC_PARTNERS.map((partner) => (
                  <div key={partner.name} className="flex flex-col items-center gap-2 group cursor-default flex-shrink-0 w-[80px] sm:w-auto">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[10px] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] flex items-center justify-center p-2.5 sm:p-3 group-hover:border-[rgba(0,223,162,0.35)] group-hover:bg-[rgba(0,223,162,0.06)] transition-all duration-150">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-[#4a5468] group-hover:text-[#eef2f7] transition-colors uppercase tracking-[0.06em] text-center">
                      {partner.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/main/kyc-partners"
                  className="inline-flex items-center gap-2 text-[10px] font-bold text-[#00dfa2] hover:text-[#00dfa2]/80 transition-colors uppercase tracking-[0.08em]"
                >
                  Explore Partner Network
                  <Info className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <Link to="/" className="pt-4">
              <Button size="lg" className="bg-[#00dfa2] text-[#07080c] hover:bg-[#00dfa2]/90 px-12 rounded-xl font-bold shadow-[0_6px_20px_rgba(0,223,162,0.18)]">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        ) : currentStep === 2 ? (
          // Step 2: Selfie Verification View
          <div className="space-y-6">
            <div className="mb-2">
              <h2 className="font-[Outfit,sans-serif] text-[1.45rem] sm:text-[1.65rem] font-extrabold tracking-[-0.03em] text-[#eef2f7] mb-2">Take a Selfie</h2>
              <p className="text-[0.87rem] text-[#8b97a8] leading-relaxed max-w-2xl">
                Please take a clear selfie of yourself to confirm your identity. Ensure your face is well-lit and clearly visible.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-4">
                  <div
                    className="rounded-2xl border border-white/[0.06] p-5 md:p-7 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                    }}
                  >
                  <input
                    ref={fileInputSelfieRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileInputChange(e, "selfie")}
                    className="hidden"
                  />
                  <div
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                      dragActiveSelfie
                        ? "border-[#00dfa2] bg-[rgba(0,223,162,0.06)] scale-[1.01]"
                        : "border-[rgba(0,223,162,0.25)] hover:border-[rgba(0,223,162,0.4)] hover:bg-[rgba(0,223,162,0.04)]"
                    }`}
                    onDragEnter={(e) => handleDrag(e, "selfie")}
                    onDragLeave={(e) => handleDrag(e, "selfie")}
                    onDragOver={(e) => handleDrag(e, "selfie")}
                    onDrop={(e) => handleDrop(e, "selfie")}
                    onClick={() => handleBrowseClick("selfie")}
                  >
                    {selfieFile ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(selfieFile)}
                            alt="Selfie"
                            className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-[rgba(0,223,162,0.25)] shadow-xl"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelfieFile(null);
                            }}
                            className="absolute -top-1 -right-1 bg-[#f43f5e] text-white p-1.5 rounded-full shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="max-w-[200px] sm:max-w-none">
                          <p className="text-base sm:text-lg font-semibold text-[#eef2f7] truncate">{selfieFile.name}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[rgba(0,223,162,0.1)] rounded-full flex items-center justify-center mx-auto">
                          <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-[#00dfa2]" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg sm:text-xl font-extrabold text-[#eef2f7]">Upload or Snap a Photo</p>
                          <p className="text-xs sm:text-sm text-[#8b97a8]">
                            Drag and drop your photo or use the buttons below
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                           <Button
                            onClick={(e) => { e.stopPropagation(); handleBrowseClick("selfie"); }}
                            className="bg-[#00dfa2] text-[#07080c] hover:bg-[#00dfa2]/90 rounded-xl px-6 w-full sm:w-auto shadow-[0_6px_20px_rgba(0,223,162,0.18)]"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </Button>
                          <Button
                            onClick={(e) => { e.stopPropagation(); setShowWebcamSelfie(true); }}
                            variant="outline"
                            className="rounded-xl px-6 border-white/[0.08] bg-[rgba(255,255,255,0.02)] text-[#eef2f7] hover:bg-[rgba(255,255,255,0.06)] w-full sm:w-auto"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Use Camera
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Selfie Tips */}
              <div className="space-y-4">
                <div
                  className="rounded-2xl border border-white/[0.06] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                     <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(0,223,162,0.1)]">
                        <Check className="w-4 h-4 text-[#00dfa2]" />
                     </div>
                     <h4 className="text-[1.05rem] font-extrabold text-[#eef2f7]">Selfie Tips</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      "Ensure your face is well lit",
                      "Keep a neutral expression",
                      "Remove hats or sunglasses",
                      "Use a plain background"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00dfa2] flex-shrink-0" />
                        <span className="text-[0.82rem] text-[#8b97a8] leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[rgba(91,141,239,0.2)] bg-[rgba(91,141,239,0.06)] p-5">
                  <div className="flex items-center gap-2 mb-3 text-[#5b8def]">
                    <Info className="w-4 h-4" />
                    <h4 className="text-[1.05rem] font-extrabold">Identity Check</h4>
                  </div>
                  <p className="text-[0.82rem] text-[#5b8def]/80 leading-relaxed">
                    This step helps us verify that you are the same person as in the ID document you uploaded.
                  </p>
                </div>

              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.06]">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-[#8b97a8] font-bold text-sm hover:text-[#eef2f7] transition-colors order-2 sm:order-1"
              >
                Back to Residence
              </button>
              <Button
                onClick={handleContinue}
                disabled={!selfieFile}
                className={`w-full sm:w-auto py-2.5 px-10 h-auto text-sm font-extrabold rounded-xl transition-all order-1 sm:order-2 ${
                  selfieFile
                    ? "bg-[#00dfa2] hover:bg-[#00dfa2]/90 text-[#07080c] shadow-[0_6px_20px_rgba(0,223,162,0.18)] hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-[rgba(255,255,255,0.04)] text-[#4a5468] cursor-not-allowed opacity-60"
                }`}
              >
                Submit for review
              </Button>
            </div>
          </div>
        ) : currentStep === 1 ? (
          // Proof of Residence View
          <div className="space-y-6">
            <div className="mb-2">
              <h2 className="font-[Outfit,sans-serif] text-[1.45rem] sm:text-[1.65rem] font-extrabold tracking-[-0.03em] text-[#eef2f7] mb-2">Proof of Residence</h2>
              <p className="text-[0.87rem] text-[#8b97a8] leading-relaxed max-w-2xl">
                To comply with global financial regulations, please provide a document that confirms your current residential address.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-4">
                <div
                  className="rounded-2xl border border-white/[0.06] p-5 md:p-7 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  }}
                >
                  <div>
                    <h3 className="text-[1.05rem] font-extrabold text-[#eef2f7] mb-5">Upload Document</h3>
                    <input
                      ref={fileInputResidenceRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileInputChange(e, "residence")}
                      className="hidden"
                    />
                    <div
                      className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                        dragActiveResidence
                          ? "border-[#00dfa2] bg-[rgba(0,223,162,0.06)] scale-[1.01]"
                          : "border-[rgba(0,223,162,0.25)] hover:border-[rgba(0,223,162,0.4)] hover:bg-[rgba(0,223,162,0.04)]"
                      }`}
                      onDragEnter={(e) => handleDrag(e, "residence")}
                      onDragLeave={(e) => handleDrag(e, "residence")}
                      onDragOver={(e) => handleDrag(e, "residence")}
                      onDrop={(e) => handleDrop(e, "residence")}
                      onClick={() => handleBrowseClick("residence")}
                    >
                      {residenceFile ? (
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative p-2">
                            <img
                              src={URL.createObjectURL(residenceFile)}
                              alt="Residence Proof"
                              className="max-h-48 rounded-xl shadow-lg transition-transform group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[rgba(0,223,162,0.4)] pointer-events-none" />
                          </div>
                          <div className="text-center">
                            <p className="text-base sm:text-lg font-semibold text-[#eef2f7] truncate max-w-[200px] sm:max-w-[250px]">{residenceFile.name}</p>
                            <p className="text-xs text-[#4a5468] mt-1">
                              {(residenceFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setResidenceFile(null);
                            }}
                            className="text-sm text-[#f43f5e] font-medium hover:underline flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 sm:space-y-5">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[rgba(0,223,162,0.1)] rounded-2xl flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-[#00dfa2]" />
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-extrabold text-[#eef2f7]">Click to upload or drag and drop</p>
                            <p className="text-xs sm:text-sm text-[#8b97a8] mt-2">
                              JPG or PNG (max. 10MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-[#4a5468] uppercase tracking-[0.08em]">
                      Full Residential Address
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4a5468] transition-colors group-focus-within:text-[#00dfa2]" />
                      <input
                        type="text"
                        placeholder="Street name and number"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-[rgba(255,255,255,0.02)] border border-white/[0.06] rounded-xl py-3.5 sm:py-4 pl-12 pr-4 text-sm sm:text-base text-[#eef2f7] font-medium focus:outline-none focus:ring-4 focus:ring-[rgba(0,223,162,0.1)] focus:border-[#00dfa2] transition-all placeholder:text-[#4a5468]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Info Panels */}
              <div className="space-y-4">
                <div
                  className="rounded-2xl border border-white/[0.06] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(0,223,162,0.1)]">
                       <Check className="w-4 h-4 text-[#00dfa2]" />
                    </div>
                    <h4 className="text-[1.05rem] font-extrabold text-[#eef2f7]">Accepted Documents</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      "Utility Bill (Gas, Water, Electric)",
                      "Bank or Credit Card Statement",
                      "Tax Assessment or Government Letter",
                      "Current Lease Agreement"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#00dfa2] flex-shrink-0" />
                        <span className="text-[0.82rem] text-[#8b97a8] leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[rgba(255,152,0,0.2)] bg-[rgba(255,152,0,0.06)] p-5">
                  <div className="flex items-center gap-2 mb-3 text-[#FF9800]">
                    <Info className="w-4 h-4" />
                    <h4 className="text-[1.05rem] font-extrabold">Important Note</h4>
                  </div>
                  <p className="text-[0.82rem] text-[#FF9800]/80 leading-relaxed">
                    The document must be issued within the last 3 months and clearly show your full name and current address.
                  </p>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] aspect-[16/7] group shadow-[0_8px_32px_rgba(0,0,0,0.35)] bg-[rgba(255,255,255,0.02)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  <img
                    src="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=500&auto=format&fit=crop"
                    alt="Sample Document"
                    className="w-full h-full object-cover grayscale brightness-75 transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-4 left-5 right-5 z-20">
                    <p className="text-[10px] font-bold text-white/95 leading-relaxed">
                       Ensure all four corners of the document are visible for faster approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.06]">
              <button
                onClick={() => setCurrentStep(0)}
                className="text-[#8b97a8] font-bold text-sm hover:text-[#eef2f7] transition-colors order-2 sm:order-1"
              >
                Back to ID
              </button>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto order-1 sm:order-2">
                <Button
                  onClick={() => setCurrentStep(0)}
                  variant="outline"
                  className="bg-[rgba(255,255,255,0.02)] border-white/[0.08] text-[#eef2f7] hover:bg-[rgba(255,255,255,0.06)] py-2.5 px-6 h-auto text-sm font-bold rounded-xl w-full sm:w-auto"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={!residenceFile || !address.trim()}
                  className={`py-2.5 px-10 h-auto text-sm font-extrabold rounded-xl transition-all w-full sm:w-auto ${
                    residenceFile && address.trim()
                      ? "bg-[#00dfa2] hover:bg-[#00dfa2]/90 text-[#07080c] shadow-[0_6px_20px_rgba(0,223,162,0.18)] hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-[rgba(255,255,255,0.04)] text-[#4a5468] cursor-not-allowed opacity-60"
                  }`}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Step 0: ID Verification View
          <>
            <div className="mb-6">
              <h2 className="font-[Outfit,sans-serif] text-[1.45rem] sm:text-[1.65rem] font-extrabold tracking-[-0.03em] text-[#eef2f7] mb-2">
                Verify your identity
              </h2>
              <p className="text-[0.87rem] text-[#8b97a8] leading-relaxed max-w-2xl">
                To ensure the security of your account and comply with
                regulations, please provide a valid government-issued ID.
              </p>
            </div>

            <div className="mb-8">
              <p className="text-[11px] font-bold text-[#00dfa2] mb-4 uppercase tracking-[0.08em]">
                Select identification type
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {idTypes.map((idType) => (
                  <button
                    key={idType.id}
                    onClick={() => setSelectedIdType(idType.id)}
                    className={`flex-1 p-3.5 sm:p-4 border rounded-[14px] transition-all duration-150 text-left relative overflow-hidden group hover:-translate-y-px ${
                      selectedIdType === idType.id
                        ? "border-[rgba(0,223,162,0.4)] bg-[rgba(0,223,162,0.06)] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
                        : "border-white/[0.06] hover:border-[rgba(255,255,255,0.12)]"
                    }`}
                    style={
                      selectedIdType !== idType.id
                        ? {
                            background:
                              "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-1.5 rounded-[10px] transition-colors ${selectedIdType === idType.id ? 'bg-[#00dfa2] text-[#07080c]' : 'bg-[rgba(255,255,255,0.04)] text-[#8b97a8]'}`}>
                        <IdCard className="w-5 h-5" />
                      </div>
                      {selectedIdType === idType.id ? (
                        <div className="w-5 h-5 bg-[#00dfa2] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,223,162,0.45)]">
                          <Check className="w-3 h-3 text-[#07080c]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-white/[0.08] rounded-full transition-colors group-hover:border-[rgba(0,223,162,0.4)]"></div>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#eef2f7] mb-0.5">
                      {idType.label}
                    </p>
                    <p className="text-[10px] text-[#8b97a8]">
                      {idType.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[11px] font-bold text-[#00dfa2] mb-4 uppercase tracking-[0.08em]">
                Upload document
              </p>
              
              <input
                ref={fileInputFrontRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileInputChange(e, "front")}
                className="hidden"
              />
              <input
                ref={fileInputBackRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileInputChange(e, "back")}
                className="hidden"
              />

              <div className={`grid ${selectedIdType === "passport" ? "grid-cols-1 max-w-xl mx-auto" : "grid-cols-1 sm:grid-cols-2"} gap-4 sm:gap-5`}>
                <div
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer relative overflow-hidden group ${
                    dragActiveFront
                      ? "border-[#00dfa2] bg-[rgba(0,223,162,0.06)] scale-[1.02]"
                      : "border-[rgba(0,223,162,0.25)] hover:border-[rgba(0,223,162,0.4)] hover:bg-[rgba(0,223,162,0.04)]"
                  }`}
                  onDragEnter={(e) => handleDrag(e, "front")}
                  onDragLeave={(e) => handleDrag(e, "front")}
                  onDragOver={(e) => handleDrag(e, "front")}
                  onDrop={(e) => handleDrop(e, "front")}
                  onClick={() => handleBrowseClick("front")}
                >
                  {frontFile ? (
                    <div className="space-y-4">
                      <div className="flex justify-center relative">
                        <div className="relative p-2">
                          <img
                            src={URL.createObjectURL(frontFile)}
                            alt="Front ID"
                            className="max-h-32 sm:max-h-40 rounded-xl shadow-lg transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[rgba(0,223,162,0.4)] pointer-events-none" />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setFrontFile(null); }}
                          className="absolute -top-2 -right-2 bg-[#f43f5e] text-white p-1.5 rounded-full shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-[#eef2f7] font-bold truncate px-4">
                        {frontFile.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-2 sm:py-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgba(0,223,162,0.1)] rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:translate-y-[-4px]">
                        <Image className="w-5 h-5 sm:w-6 sm:h-6 text-[#00dfa2]" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-extrabold text-[#eef2f7] mb-1">
                          {selectedIdType === "passport" ? "Passport Bio-data Page" : "ID Front View"}
                        </p>
                        <p className="text-[10px] sm:text-xs text-[#8b97a8] mb-4 sm:mb-5 px-4">
                          Drag and drop or take a photo. Max Size 10MB.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 px-2 sm:px-4">
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleBrowseClick("front"); }}
                          className="flex-1 bg-[#00dfa2] text-[#07080c] hover:bg-[#00dfa2]/90 border-none text-[11px] font-bold py-2.5 rounded-lg transition-all w-full shadow-[0_6px_20px_rgba(0,223,162,0.18)]"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          Browse File
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); setShowWebcamFront(true); }}
                          variant="outline"
                          className="flex-1 border-white/[0.08] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.06)] text-[#eef2f7] text-[11px] font-bold py-2.5 rounded-lg w-full"
                        >
                          <Camera className="w-3.5 h-3.5 mr-1" />
                          Snap Photo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {selectedIdType !== "passport" && (
                  <div
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer relative overflow-hidden group ${
                      dragActiveBack
                        ? "border-[#00dfa2] bg-[rgba(0,223,162,0.06)] scale-[1.02]"
                        : "border-[rgba(0,223,162,0.25)] hover:border-[rgba(0,223,162,0.4)] hover:bg-[rgba(0,223,162,0.04)]"
                    }`}
                    onDragEnter={(e) => handleDrag(e, "back")}
                    onDragLeave={(e) => handleDrag(e, "back")}
                    onDragOver={(e) => handleDrag(e, "back")}
                    onDrop={(e) => handleDrop(e, "back")}
                    onClick={() => handleBrowseClick("back")}
                  >
                    {backFile ? (
                      <div className="space-y-4">
                        <div className="flex justify-center relative">
                          <div className="relative p-2">
                            <img
                              src={URL.createObjectURL(backFile)}
                              alt="Back ID"
                              className="max-h-32 sm:max-h-40 rounded-xl shadow-lg transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[rgba(0,223,162,0.4)] pointer-events-none" />
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setBackFile(null); }}
                            className="absolute -top-2 -right-2 bg-[#f43f5e] text-white p-1.5 rounded-full shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-[#eef2f7] font-bold truncate px-4">
                          {backFile.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 py-2 sm:py-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgba(0,223,162,0.1)] rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:translate-y-[-4px]">
                          <Image className="w-5 h-5 sm:w-6 sm:h-6 text-[#00dfa2]" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-extrabold text-[#eef2f7] mb-1">
                            ID Back View
                          </p>
                          <p className="text-[10px] sm:text-xs text-[#8b97a8] mb-4 sm:mb-5 px-4">
                            Drag and drop or take a photo. Max Size 10MB.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 px-2 sm:px-4">
                          <Button
                            onClick={(e) => { e.stopPropagation(); handleBrowseClick("back"); }}
                            className="flex-1 bg-[#00dfa2] text-[#07080c] hover:bg-[#00dfa2]/90 border-none text-[11px] font-bold py-2.5 rounded-lg transition-all w-full shadow-[0_6px_20px_rgba(0,223,162,0.18)]"
                          >
                            <Upload className="w-3.5 h-3.5 mr-1" />
                            Browse File
                          </Button>
                          <Button
                            onClick={(e) => { e.stopPropagation(); setShowWebcamBack(true); }}
                            variant="outline"
                            className="flex-1 border-white/[0.08] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.06)] text-[#eef2f7] text-[11px] font-bold py-2.5 rounded-lg w-full"
                          >
                            <Camera className="w-3.5 h-3.5 mr-1" />
                            Snap Photo
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>



            <div className="rounded-[14px] border border-[rgba(0,223,162,0.2)] bg-[rgba(0,223,162,0.06)] p-4 mb-6 flex gap-4 items-center">
              <div className="w-10 h-10 bg-[rgba(0,223,162,0.1)] rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#00dfa2]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-[#00dfa2]">
                  Your data is protected
                </p>
                <p className="text-[10px] text-[#00dfa2]/80">
                  We use institutional-grade encryption to secure your documents. All processing is strictly compliant with global privacy standards.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-white/[0.06]">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link to="/" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="bg-[rgba(255,255,255,0.02)] border-white/[0.08] text-[#eef2f7] hover:bg-[rgba(255,255,255,0.06)] py-2.5 px-8 h-auto text-sm font-bold rounded-xl w-full"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={handleContinue}
                  className="bg-[#00dfa2] hover:bg-[#00dfa2]/90 text-[#07080c] py-2.5 px-10 h-auto text-sm font-extrabold rounded-xl shadow-[0_6px_20px_rgba(0,223,162,0.18)] transition-all hover:scale-[1.02] w-full sm:w-auto"
                >
                  Continue to Residence
                </Button>
              </div>
            </div>
          </>
        )}

        {showWebcamFront && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="rounded-2xl max-w-lg w-full p-5 sm:p-8 space-y-6 border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]"
              style={{
                background:
                  "linear-gradient(180deg, #0c0e15, #07080c)",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-[Outfit,sans-serif] text-[1.25rem] font-extrabold tracking-[-0.02em] text-[#eef2f7]">
                  Capture ID Front
                </h3>
                <button
                  onClick={() => setShowWebcamFront(false)}
                  className="p-2 hover:bg-[rgba(255,255,255,0.06)] rounded-full transition-colors text-[#8b97a8] hover:text-[#eef2f7]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-[rgba(0,223,162,0.25)] bg-[rgba(255,255,255,0.02)] aspect-video flex items-center justify-center relative">
                <Webcam
                  ref={webcamFrontRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowWebcamFront(false)}
                  size="lg"
                  className="flex-1 bg-[rgba(255,255,255,0.04)] text-[#eef2f7] hover:bg-[rgba(255,255,255,0.08)] border border-white/[0.08] h-auto py-4 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => captureWebcam("front")}
                  size="lg"
                  className="flex-1 bg-[#00dfa2] text-[#07080c] hover:bg-[#00dfa2]/90 h-auto py-4 rounded-xl shadow-[0_6px_20px_rgba(0,223,162,0.18)] font-bold"
                >
                  Capture Photo
                </Button>
              </div>
            </div>
          </div>
        )}

        {showWebcamBack && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="rounded-2xl max-w-lg w-full p-5 sm:p-8 space-y-6 border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]"
              style={{
                background:
                  "linear-gradient(180deg, #0c0e15, #07080c)",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-[Outfit,sans-serif] text-[1.25rem] font-extrabold tracking-[-0.02em] text-[#eef2f7]">
                   Capture ID Back
                </h3>
                <button
                  onClick={() => setShowWebcamBack(false)}
                  className="p-2 hover:bg-[rgba(255,255,255,0.06)] rounded-full transition-colors text-[#8b97a8] hover:text-[#eef2f7]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-[rgba(0,223,162,0.25)] bg-[rgba(255,255,255,0.02)] aspect-video flex items-center justify-center relative">
                <Webcam
                  ref={webcamBackRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowWebcamBack(false)}
                  size="lg"
                  className="flex-1 bg-[rgba(255,255,255,0.04)] text-[#eef2f7] hover:bg-[rgba(255,255,255,0.08)] border border-white/[0.08] h-auto py-4 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => captureWebcam("back")}
                  size="lg"
                  className="flex-1 bg-[#00dfa2] text-[#07080c] hover:bg-[#00dfa2]/90 h-auto py-4 rounded-xl shadow-[0_6px_20px_rgba(0,223,162,0.18)] font-bold"
                >
                  Capture Photo
                </Button>
              </div>
            </div>
          </div>
        )}

        {showWebcamSelfie && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="rounded-2xl max-w-lg w-full p-5 sm:p-8 space-y-6 border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)]"
              style={{
                background:
                  "linear-gradient(180deg, #0c0e15, #07080c)",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-[Outfit,sans-serif] text-[1.25rem] font-extrabold tracking-[-0.02em] text-[#eef2f7]">
                   Take Selfie
                </h3>
                <button
                  onClick={() => setShowWebcamSelfie(false)}
                  className="p-2 hover:bg-[rgba(255,255,255,0.06)] rounded-full transition-colors text-[#8b97a8] hover:text-[#eef2f7]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-[rgba(0,223,162,0.25)] bg-[rgba(255,255,255,0.02)] aspect-square flex items-center justify-center relative">
                <Webcam
                  ref={webcamSelfieRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowWebcamSelfie(false)}
                  size="lg"
                  className="flex-1 bg-[rgba(255,255,255,0.04)] text-[#eef2f7] hover:bg-[rgba(255,255,255,0.08)] border border-white/[0.08] h-auto py-4 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => captureWebcam("selfie")}
                  size="lg"
                  className="flex-1 bg-[#00dfa2] text-[#07080c] hover:bg-[#00dfa2]/90 h-auto py-4 rounded-xl shadow-[0_6px_20px_rgba(0,223,162,0.18)] font-bold"
                >
                  Capture Selfie
                </Button>
              </div>
            </div>
          </div>
        )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
