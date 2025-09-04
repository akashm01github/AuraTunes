import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

const FacialExpressionDetector = ({ setSongs }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mostProbableExpression, setMostProbableExpression] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionInterval = useRef(null);

  // Load models and start video
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        setIsLoading(false);
        startVideo();
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Failed to load facial detection models. Please check your model files and refresh.');
        setIsLoading(false);
      }
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user',
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Could not access webcam. Please ensure camera permissions are granted.');
        setIsLoading(false);
      }
    };

    loadModels();

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null;
      }
    };
  }, []);

  // Fetch songs when mostProbableExpression changes
  useEffect(() => {
    if (mostProbableExpression && isDetecting) {
      const fetchSongs = async () => {
        try {
          const response = await axios.get(`https://auratunes.onrender.com/songs?mood=${mostProbableExpression}`);
          console.log('Fetched songs:', response.data);
          setSongs(response.data.song); // Update songs via the setSongs prop
        } catch (err) {
          console.error('Error fetching songs:', err);
          setError('Failed to fetch songs. Please check the server and try again.');
        }
      };
      fetchSongs();
    }
  }, [mostProbableExpression, isDetecting, setSongs]);

  const toggleDetection = () => {
    if (!isDetecting) {
      setIsDetecting(true);
      detectionInterval.current = setInterval(detectExpressions, 100);
    } else {
      setIsDetecting(false);
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
      setMostProbableExpression(null);
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  };

  const detectExpressions = async () => {
    if (!videoRef.current || !canvasRef.current || !videoRef.current.videoWidth) {
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const context = canvas.getContext('2d');
      if (!context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      faceapi.draw.drawDetections(canvas, detections);
      faceapi.draw.drawFaceExpressions(canvas, detections);

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const mostProbable = Object.entries(expressions).reduce(
          (max, [expression, confidence]) =>
            confidence > max.confidence ? { expression, confidence } : max,
          { expression: '', confidence: 0 }
        );

        setMostProbableExpression(mostProbable.expression);
        console.log('Most Probable Expression:', mostProbable.expression, 'Confidence:', mostProbable.confidence);
      } else {
        setMostProbableExpression(null);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Facial Expression Detector
        </h1>
        {isLoading && (
          <p className="text-center text-gray-600 animate-pulse">Loading models...</p>
        )}
        {error && (
          <p className="text-center text-red-500 bg-red-100 rounded-md p-2 mb-4">
            {error}
          </p>
        )}
        <div className="relative flex justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="rounded-md shadow-md"
            style={{ width: '640px', height: '480px', objectFit: 'cover' }}
            onError={(e) => setError('Video failed to load: ' + e.message)}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
            style={{ width: '640px', height: '480px' }}
          />
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={toggleDetection}
            className={`px-6 py-2 rounded-md text-white font-semibold transition-colors duration-200 ${
              isDetecting
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isDetecting ? 'Stop Detection' : 'Start Detection'}
          </button>
        </div>
        {mostProbableExpression && isDetecting && (
          <p className="text-center mt-4 text-lg text-gray-700">
            Most Probable Expression:{' '}
            <span className="font-semibold capitalize">{mostProbableExpression}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default FacialExpressionDetector;