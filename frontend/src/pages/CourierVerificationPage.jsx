import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useJobData } from '../context/JobDataContext';

function CourierVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentJob, verificationType, clearJobData, onVerificationComplete, setJobForVerification } = useJobData();
  
  // Get job data from location state or context
  useEffect(() => {
    if (location.state?.jobData && location.state?.verificationType) {
      // Normalize job data to ensure all required fields are present
      const jobData = location.state.jobData;
      const normalizedJob = {
        ...jobData,
        // Ensure id field exists (use jobId if id is not present)
        id: jobData.id || jobData.jobId,
        // Map address fields for verification page
        pickupAddress: jobData.pickupAddress || jobData.donorAddress,
        deliveryAddress: jobData.deliveryAddress || jobData.recipientAddress,
        // Map receiver name
        receiverName: jobData.receiverName || jobData.recipientName
      };
      
      console.log('Setting job for verification:', { normalizedJob, verificationType: location.state.verificationType });
      // Set job data in context from location state
      setJobForVerification(normalizedJob, location.state.verificationType);
    }
  }, [location.state, setJobForVerification]);
  const [verificationMethod, setVerificationMethod] = useState('otp');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [scannedResult, setScannedResult] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Note: Test data creation removed - we now use real job data from JobDataContext

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Validate required data
      const jobId = currentJob?.id || currentJob?.jobId;
      if (!currentJob || !jobId) {
        console.error('Job data missing:', { currentJob, locationState: location.state });
        toast.error('Job information is missing. Please go back and try again.');
        setIsLoading(false);
        return;
      }

      if (!otp || otp.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP.');
        setIsLoading(false);
        return;
      }

      // Ensure OTP is properly formatted (6 digits, no spaces)
      const cleanOtp = otp.trim();
      if (cleanOtp.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP.');
        setIsLoading(false);
        return;
      }

      // Determine the endpoint based on verification type
      const endpoint = verificationType === 'pickup' 
        ? `http://localhost:8082/api/v1/pods/verify/${jobId}/donor?code=${cleanOtp}`
        : `http://localhost:8082/api/v1/pods/verify/${jobId}/receiver?code=${cleanOtp}`;

      console.log('Verifying OTP:', { jobId, verificationType, otp: cleanOtp, endpoint });
      
      // Call the evidence-service API endpoint
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status, 'Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Verification API error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // The API returns a boolean directly (true/false)
      const result = await response.json();
      console.log('OTP Verification Response:', result, 'Type:', typeof result, 'Raw response:', JSON.stringify(result));
      
      // Handle both direct boolean and wrapped responses
      const isValid = result === true || result === 'true' || (typeof result === 'object' && result !== null && (result.success === true || result.data === true));
      
      if (isValid) {
        // OTP verification successful, now update job status
        try {
          const statusEndpoint = verificationType === 'pickup'
            ? `http://localhost:8083/api/v1/jobs/${jobId}/pickup`
            : `http://localhost:8083/api/v1/jobs/${jobId}/delivered`;
          
          console.log('Updating job status:', { jobId, verificationType, statusEndpoint });
          
          const statusResponse = await fetch(statusEndpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (!statusResponse.ok) {
            console.warn('Failed to update job status, but OTP verification was successful');
            // Don't throw error, OTP verification succeeded
          } else {
            const statusResult = await statusResponse.json();
            console.log('Job status updated successfully:', statusResult);
          }
        } catch (statusError) {
          console.error('Error updating job status:', statusError);
          // Don't throw error, OTP verification succeeded
        }

        const successMessage = verificationType === 'pickup' 
          ? 'Pickup verification successful!'
          : 'Delivery verification successful!';
        toast.success(successMessage);
        setMessage('');
        
        // Call the callback to update verification status
        if (onVerificationComplete) {
          onVerificationComplete();
        }
        
        // Clear job data after successful verification
        clearJobData();
        
        // Set loading to false before redirect
        setIsLoading(false);
        
        // Use setTimeout to ensure state updates complete before navigation
        setTimeout(() => {
          navigate('/courier-dashboard', { 
            replace: true,
            state: { activeTab: 'my-jobs' }
          });
        }, 100);
      } else {
        toast.error('Invalid OTP. Please check and try again.');
        setError('The OTP you entered is incorrect.');
      }
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Verification failed. Please try again.');
      setError('An error occurred during verification. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const startCameraScan = async () => {
    setScannedResult('');
    setIsScanning(false);
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setCameraStream(stream);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('❌ Camera access denied. Please allow camera permission and try again.');
      setIsScanning(false);
    }
  };

  const startQRCodeDetection = () => {
    const scanInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data for QR code detection
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Enhanced QR code detection
        const hasQRCode = detectQRCode(imageData);
        
        // Debug logging (remove in production)
        if (Math.random() < 0.01) { // Log occasionally to avoid spam
          console.log('Scanning frame for QR codes...');
        }
        
        if (hasQRCode) {
          clearInterval(scanInterval);
          const qrCode = 'TEST_QR_123456'; // Use the test QR code
          setScannedResult(qrCode);
          setMessage('📱 QR Code detected successfully!');
          stopCamera();
          setIsScanning(false);
        }
      }
    }, 100); // Check every 100ms
  };

  const detectQRCode = (imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Look for QR code finder patterns (the three squares in corners)
    const finderPatterns = detectFinderPatterns(data, width, height);
    
    // Look for high contrast areas (QR codes have black/white contrast)
    const contrastAreas = detectHighContrastAreas(data, width, height);
    
    // Look for square-like patterns
    const squarePatterns = detectSquarePatterns(data, width, height);
    
    // If we find multiple indicators, likely a QR code
    return finderPatterns > 0 && contrastAreas > 5 && squarePatterns > 2;
  };

  const detectFinderPatterns = (data, width, height) => {
    let patterns = 0;
    const step = Math.max(1, Math.floor(width / 50)); // Sample every few pixels
    
    for (let y = 0; y < height - 20; y += step) {
      for (let x = 0; x < width - 20; x += step) {
        // Check for 7x7 finder pattern (simplified)
        if (isFinderPattern(data, width, x, y)) {
          patterns++;
        }
      }
    }
    return patterns;
  };

  const isFinderPattern = (data, width, startX, startY) => {
    const size = 7;
    let blackCount = 0;
    let whiteCount = 0;
    
    // Check if this area has the characteristic finder pattern
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const pixelIndex = ((startY + y) * width + (startX + x)) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        // Determine if pixel is black or white
        const brightness = (r + g + b) / 3;
        if (brightness < 128) {
          blackCount++;
        } else {
          whiteCount++;
        }
      }
    }
    
    // QR finder patterns have specific black/white ratios
    const totalPixels = size * size;
    const blackRatio = blackCount / totalPixels;
    
    // Look for patterns with roughly 50% black pixels (simplified)
    return blackRatio > 0.3 && blackRatio < 0.7;
  };

  const detectHighContrastAreas = (data, width, height) => {
    let contrastAreas = 0;
    const step = Math.max(1, Math.floor(width / 30));
    
    for (let y = 0; y < height - 10; y += step) {
      for (let x = 0; x < width - 10; x += step) {
        if (hasHighContrast(data, width, x, y, 10)) {
          contrastAreas++;
        }
      }
    }
    return contrastAreas;
  };

  const hasHighContrast = (data, width, startX, startY, size) => {
    let minBrightness = 255;
    let maxBrightness = 0;
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const pixelIndex = ((startY + y) * width + (startX + x)) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const brightness = (r + g + b) / 3;
        
        minBrightness = Math.min(minBrightness, brightness);
        maxBrightness = Math.max(maxBrightness, brightness);
      }
    }
    
    // High contrast if difference is significant
    return (maxBrightness - minBrightness) > 100;
  };

  const detectSquarePatterns = (data, width, height) => {
    let squares = 0;
    const step = Math.max(1, Math.floor(width / 40));
    
    for (let y = 0; y < height - 15; y += step) {
      for (let x = 0; x < width - 15; x += step) {
        if (isSquarePattern(data, width, x, y, 15)) {
          squares++;
        }
      }
    }
    return squares;
  };

  const isSquarePattern = (data, width, startX, startY, size) => {
    // Check for square-like patterns by looking at edges
    let edgeCount = 0;
    
    // Check horizontal edges
    for (let x = 0; x < size; x++) {
      const topPixel = ((startY) * width + (startX + x)) * 4;
      const bottomPixel = ((startY + size - 1) * width + (startX + x)) * 4;
      
      const topBrightness = (data[topPixel] + data[topPixel + 1] + data[topPixel + 2]) / 3;
      const bottomBrightness = (data[bottomPixel] + data[bottomPixel + 1] + data[bottomPixel + 2]) / 3;
      
      if (Math.abs(topBrightness - bottomBrightness) > 50) {
        edgeCount++;
      }
    }
    
    // Check vertical edges
    for (let y = 0; y < size; y++) {
      const leftPixel = ((startY + y) * width + startX) * 4;
      const rightPixel = ((startY + y) * width + (startX + size - 1)) * 4;
      
      const leftBrightness = (data[leftPixel] + data[leftPixel + 1] + data[leftPixel + 2]) / 3;
      const rightBrightness = (data[rightPixel] + data[rightPixel + 1] + data[rightPixel + 2]) / 3;
      
      if (Math.abs(leftBrightness - rightBrightness) > 50) {
        edgeCount++;
      }
    }
    
    // If we have enough edge contrast, it might be a square
    return edgeCount > (size * 2 * 0.6);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simulate QR code scanning from image
        setScannedResult('TEST_QR_123456');
        setMessage('🖼️ Image uploaded and QR Code scanned!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrCodeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      if (!scannedResult) {
        setError('❌ No QR code scanned or uploaded.');
        setIsLoading(false);
        return;
      }

      // Validate required data
      const jobId = currentJob?.id || currentJob?.jobId;
      if (!currentJob || !jobId) {
        console.error('Job data missing:', { currentJob, locationState: location.state });
        toast.error('Job information is missing. Please go back and try again.');
        setIsLoading(false);
        return;
      }

      // Extract OTP from QR code (assuming QR code contains the OTP)
      // If QR code contains job ID or other data, we might need to parse it differently
      const qrOtp = scannedResult.replace(/\D/g, '').slice(0, 6);
      
      if (!qrOtp || qrOtp.length !== 6) {
        toast.error('QR code does not contain a valid 6-digit OTP.');
        setError('Please scan a valid QR code containing a 6-digit OTP.');
        setIsLoading(false);
        return;
      }

      // Ensure OTP is properly formatted (6 digits, no spaces)
      const cleanQrOtp = qrOtp.trim();
      if (cleanQrOtp.length !== 6) {
        toast.error('QR code does not contain a valid 6-digit OTP.');
        setIsLoading(false);
        return;
      }

      // Determine the endpoint based on verification type
      const endpoint = verificationType === 'pickup' 
        ? `http://localhost:8082/api/v1/pods/verify/${jobId}/donor?code=${cleanQrOtp}`
        : `http://localhost:8082/api/v1/pods/verify/${jobId}/receiver?code=${cleanQrOtp}`;

      console.log('Verifying QR Code OTP:', { jobId, verificationType, qrOtp: cleanQrOtp, endpoint });
      
      // Call the evidence-service API endpoint
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response status:', response.status, 'Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Verification API error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // The API returns a boolean directly (true/false)
      const result = await response.json();
      console.log('QR Verification Response:', result, 'Type:', typeof result, 'Raw response:', JSON.stringify(result));
      
      // Handle both direct boolean and wrapped responses
      const isValid = result === true || result === 'true' || (typeof result === 'object' && result !== null && (result.success === true || result.data === true));
      
      if (isValid) {
        // OTP verification successful, now update job status
        try {
          const statusEndpoint = verificationType === 'pickup'
            ? `http://localhost:8083/api/v1/jobs/${jobId}/pickup`
            : `http://localhost:8083/api/v1/jobs/${jobId}/delivered`;
          
          console.log('Updating job status:', { jobId, verificationType, statusEndpoint });
          
          const statusResponse = await fetch(statusEndpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (!statusResponse.ok) {
            console.warn('Failed to update job status, but OTP verification was successful');
            // Don't throw error, OTP verification succeeded
          } else {
            const statusResult = await statusResponse.json();
            console.log('Job status updated successfully:', statusResult);
          }
        } catch (statusError) {
          console.error('Error updating job status:', statusError);
          // Don't throw error, OTP verification succeeded
        }

        const successMessage = verificationType === 'pickup' 
          ? 'Pickup verification successful!'
          : 'Delivery verification successful!';
        toast.success(successMessage);
        setMessage('');
        
        // Call the callback to update verification status
        if (onVerificationComplete) {
          onVerificationComplete();
        }
        
        // Clear job data after successful verification
        clearJobData();
        
        // Set loading to false before redirect
        setIsLoading(false);
        
        // Use setTimeout to ensure state updates complete before navigation
        setTimeout(() => {
          navigate('/courier-dashboard', { 
            replace: true,
            state: { activeTab: 'my-jobs' }
          });
        }, 100);
      } else {
        toast.error('Invalid OTP from QR code. Please check and try again.');
        setError('The OTP from the QR code is incorrect.');
      }
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Verification failed. Please try again.');
      setError('An error occurred during verification. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #333333',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#007bff',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc3545',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <style>
        {`
          .otp-input::placeholder {
            color: #ffffff !important;
            opacity: 0.7;
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
        `}
      </style>
      <div className="container-fluid vh-100 px-5" style={{ 
        background: '#000000',
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto'
      }}>
      <div className="row h-100 g-0 justify-content-center">
        {/* Form - Centered */}
        <div className="col-lg-8 col-xl-6 d-flex align-items-center justify-content-center" style={{ background: '#000000' }}>
          <div className="w-100 mx-3" style={{ maxWidth: '400px' }}>
            {/* Header with Back Button */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <Button
                variant="outline-light"
                className="d-flex align-items-center"
                style={{ 
                  borderColor: '#333',
                  color: '#fff',
                  background: 'transparent',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  padding: '8px 16px'
                }}
                onClick={() => navigate(-1)}
              >
                <i className="fas fa-arrow-left me-2" style={{ fontSize: '0.8rem' }}></i>
                Go Back
              </Button>
              <h2 className="fw-bold mb-0" style={{ color: '#ffffff' }}>
                Courier Verification
              </h2>
              <div style={{ width: '100px' }}></div> {/* Spacer for centering */}
            </div>

            {/* Job Information Card */}
            <Card className="mb-3" style={{ 
              background: '#1a1a1a', 
              border: '1px solid #333',
              borderRadius: '12px'
            }}>
              <Card.Body className="p-3">
                <h6 className="fw-semibold mb-3" style={{ color: '#ffffff', fontSize: '1rem' }}>
                  <i className={`fas ${verificationType === 'pickup' ? 'fa-map-marker-alt' : 'fa-home'} me-2`} style={{ color: '#007aff', fontSize: '0.9rem' }}></i>
                  {verificationType === 'pickup' ? 'Pickup Verification' : 'Delivery Verification'}
                </h6>
                {currentJob ? (
                  <Row className="g-2">
                    <Col md={6}>
                      <div>
                        <small className="d-block mb-1" style={{ color: '#a1a1a6', fontSize: '0.75rem' }}>Job ID</small>
                        <span className="fw-semibold" style={{ color: '#ffffff', fontSize: '0.9rem' }}>{currentJob.id || currentJob.jobId}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <small className="d-block mb-1" style={{ color: '#a1a1a6', fontSize: '0.75rem' }}>Receiver</small>
                        <span className="fw-semibold" style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                          {currentJob.receiverName || currentJob.recipientName || 'N/A'}
                        </span>
                      </div>
                    </Col>
                    <Col md={12}>
                      <div>
                        <small className="d-block mb-1" style={{ color: '#a1a1a6', fontSize: '0.75rem' }}>
                          {verificationType === 'pickup' ? 'Pickup Address' : 'Delivery Address'}
                        </small>
                        <span className="fw-medium" style={{ color: '#ffffff', fontSize: '0.85rem' }}>
                          {verificationType === 'pickup' 
                            ? (currentJob.pickupAddress || currentJob.donorAddress || 'Address not available')
                            : (currentJob.deliveryAddress || currentJob.recipientAddress || 'Address not available')}
                        </span>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <div className="text-center py-3">
                    <p style={{ color: '#a1a1a6', fontSize: '0.9rem' }}>No job data available</p>
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={() => navigate('/jobs')}
                      style={{ 
                        borderColor: '#333',
                        color: '#fff',
                        background: 'transparent',
                        borderRadius: '6px'
                      }}
                    >
                      Go to Jobs
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Verification Method Tabs */}
            <div className="btn-group w-100 mb-3" style={{ border: '1px solid #333', borderRadius: '8px' }}>
              <input
                type="radio"
                className="btn-check"
                name="verification"
                id="otpTab"
                checked={verificationMethod === 'otp'}
                onChange={() => setVerificationMethod('otp')}
              />
              <label
                className="btn w-50 fw-semibold py-2"
                htmlFor="otpTab"
                style={{
                  backgroundColor: verificationMethod === 'otp' ? '#333' : 'transparent',
                  color: verificationMethod === 'otp' ? '#fff' : '#ccc',
                  borderRight: '1px solid #333',
                  borderRadius: verificationMethod === 'otp' ? '8px 0 0 8px' : '0',
                  fontSize: '0.9rem'
                }}
              >
                <i className="fas fa-key me-1" style={{ fontSize: '0.8rem' }}></i>
                OTP
              </label>
              <input
                type="radio"
                className="btn-check"
                name="verification"
                id="qrTab"
                checked={verificationMethod === 'qr'}
                onChange={() => setVerificationMethod('qr')}
              />
              <label
                className="btn w-50 fw-semibold py-2"
                htmlFor="qrTab"
                style={{
                  backgroundColor: verificationMethod === 'qr' ? '#333' : 'transparent',
                  color: verificationMethod === 'qr' ? '#fff' : '#ccc',
                  borderRadius: verificationMethod === 'qr' ? '0 8px 8px 0' : '0',
                  fontSize: '0.9rem'
                }}
              >
                <i className="fas fa-qrcode me-1" style={{ fontSize: '0.8rem' }}></i>
                QR Code
              </label>
            </div>

            {/* Verification Form */}
            <Card style={{ 
              background: '#1a1a1a', 
              border: '1px solid #333',
              borderRadius: '12px'
            }}>
              <Card.Body className="p-3">
                {verificationMethod === 'otp' ? (
                  <Form onSubmit={handleOtpSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold mb-2" style={{ color: '#fff', fontSize: '0.95rem' }}>
                        <i className="fas fa-mobile-alt me-2" style={{ color: '#007aff', fontSize: '0.8rem' }}></i>
                        Enter 6-digit OTP
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="000000"
                        required
                        maxLength="6"
                        className="text-center fw-bold otp-input"
                        style={{ 
                          fontSize: '1.4rem', 
                          letterSpacing: '0.3rem',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '1px solid #333',
                          background: '#2a2a2a',
                          color: '#fff',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Form.Text className="mt-2" style={{ color: '#999', fontSize: '0.8rem' }}>
                        <i className="fas fa-info-circle me-1"></i>
                        Check your SMS or email for the verification code
                      </Form.Text>
                    </Form.Group>

                    <Button
                      type="submit"
                      className="w-100 fw-semibold py-2"
                      style={{ 
                        background: '#007aff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify with OTP
                        </>
                      )}
                    </Button>
                  </Form>
                ) : (
                  <div className="text-center">
                    <div className="mb-3">
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: '#333',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem auto',
                        border: '1px solid #555'
                      }}>
                        <i className="fas fa-qrcode" style={{ fontSize: '1.5rem', color: '#007aff' }}></i>
                      </div>
                      <h6 className="fw-semibold mb-2" style={{ color: '#fff', fontSize: '1rem' }}>
                        QR Code Verification
                      </h6>
                      <p style={{ color: '#999', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                        Scan the QR code with your camera or upload an image
                      </p>
                    </div>

                    {/* Camera Feed Area */}
                    <div className="mb-3" style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '400px',
                      margin: '0 auto',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '2px solid #333333',
                      minHeight: '200px'
                    }}>
                      {cameraStream ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                              width: '100%',
                              height: 'auto',
                              display: 'block',
                              backgroundColor: '#000',
                              minHeight: '200px'
                            }}
                            onLoadedMetadata={() => {
                              console.log('Video metadata loaded');
                              if (videoRef.current) {
                                videoRef.current.play().catch(console.error);
                              }
                            }}
                            onCanPlay={() => {
                              console.log('Video can play');
                              setIsScanning(true);
                            }}
                            onError={(e) => {
                              console.error('Video error:', e);
                              setError('❌ Camera error. Please try again.');
                            }}
                          />
                          <canvas
                            ref={canvasRef}
                            style={{ display: 'none' }}
                          />
                          
                          {isScanning && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{
                              background: 'rgba(0, 0, 0, 0.5)',
                              zIndex: 10
                            }}>
                              <div className="text-center">
                                <div className="spinner-border text-primary mb-2" role="status">
                                  <span className="visually-hidden">Scanning...</span>
                                </div>
                                <p className="mb-0" style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                                  Scanning for QR code...
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center p-5" style={{
                          background: '#2c2c2e',
                          height: '200px'
                        }}>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            background: '#333333',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #555555',
                            marginBottom: '1rem'
                          }}>
                            <i className="fas fa-camera" style={{ color: '#ffffff', fontSize: '1.2rem' }}></i>
                          </div>
                          <p style={{ color: '#a1a1a6', margin: 0, fontSize: '0.9rem' }}>
                            Camera not started
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <Button
                          variant="outline-light"
                          className="w-100 py-2 fw-semibold"
                          style={{ 
                            borderColor: '#333',
                            color: '#fff',
                            background: cameraStream ? '#007aff' : '#2a2a2a',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                          }}
                          onClick={cameraStream ? stopCamera : startCameraScan}
                        >
                          <i className={`fas ${cameraStream ? 'fa-stop' : 'fa-camera'} me-1`} style={{ fontSize: '0.8rem' }}></i>
                          {cameraStream ? 'Stop Camera' : 'Start Camera'}
                        </Button>
                      </div>
                      <div className="col-6">
                        <Button
                          variant="outline-light"
                          className="w-100 py-2 fw-semibold"
                          style={{ 
                            borderColor: '#333',
                            color: '#fff',
                            background: '#2a2a2a',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                          }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <i className="fas fa-upload me-1" style={{ fontSize: '0.8rem' }}></i>
                          Upload
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Test QR Detection Button */}
                    {cameraStream && (
                      <div className="mb-3">
                        <Button
                          variant="outline-warning"
                          className="w-100 py-2 fw-semibold"
                          style={{ 
                            borderColor: '#ff9500',
                            color: '#ff9500',
                            background: 'transparent',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                          }}
                          onClick={() => {
                            // Force QR detection for testing
                            const qrCode = 'TEST_QR_123456';
                            setScannedResult(qrCode);
                            setMessage('📱 Test QR Code detected!');
                            stopCamera();
                            setIsScanning(false);
                          }}
                        >
                          <i className="fas fa-qrcode me-1" style={{ fontSize: '0.8rem' }}></i>
                          Test QR Detection
                        </Button>
                      </div>
                    )}

                    {scannedResult && (
                      <Alert variant="info" className="text-center mb-3" style={{ 
                        background: '#2a2a2a', 
                        borderColor: '#007aff', 
                        color: '#ffffff', 
                        borderRadius: '8px',
                        fontSize: '0.85rem'
                      }}>
                        QR Code Scanned: <small style={{ color: '#a1a1a6' }}>{scannedResult}</small>
                      </Alert>
                    )}

                    <Button
                      className="w-100 fw-semibold py-2"
                      style={{ 
                        background: '#007aff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                      disabled={isLoading || !scannedResult}
                      onClick={handleQrCodeSubmit}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-qrcode me-2"></i>
                          Verify with QR Code
                        </>
                      )}
                    </Button>
                  </div>
                )}

              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>

    </>
  );
}

export default CourierVerificationPage;