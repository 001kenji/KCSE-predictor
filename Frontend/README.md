# AR Object Detection with Accessibility Features

![AR Object Detection Demo](public/apple-touch-icon.png)
A real-time object detection system with augmented reality visualization and accessibility features for visually impaired users.

## Features
- **Real-time Object Detection** using TensorFlow.js
- **Pulsing Bounding Boxes** with smooth animations
- **Distance Estimation** for detected objects
- **Audio Feedback** via Web Speech API
- **Haptic Alerts** for important objects
- **Responsive Design** works on mobile and desktop

## Technology Stack
- **Frontend**: React + Vite
- **Computer Vision**: TensorFlow.js (COCO-SSD model)
- **Camera Access**: react-webcam
- **Styling**: Tailwind CSS
- **Animation**: requestAnimationFrame

## Installation
```bash
git clone https://github.com/your-repo/ar-object-detection.git
cd ar-object-detection
npm install
npm run dev