import React, { useState } from "react";
import '../App.css'
import { connect } from "react-redux";
import SarahImage from '../assets/images/sarah.jpeg'
import DaviImage from '../assets/images/davi.jpeg'
import aminaImage from '../assets/images/amina.jpeg'
import { FiCamera, FiStar, FiGlobe, FiSearch, FiAlertCircle, FiCheckCircle, FiX, FiEye, FiMic, FiCpu } from "react-icons/fi";
import Notifier from "../Components/notifier.jsx";

const DashboardPage = ({ isAuthenticated }) => {
  // Supported languages for voice descriptions
  const supportedLanguages = [
    'English (US)',
    'English (UK)',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Russian',
    'Japanese',
    'Korean',
    'Chinese (Mandarin)',
    'Arabic',
    'Hindi',
    'Dutch',
    'Swedish',
    'Norwegian',
    'Finnish',
    'Danish',
    'Polish',
    'Turkish'
  ]

  // How it works steps
  const howItWorks = [
    {
      icon: <FiCamera className="text-primary text-3xl" />,
      title: "Enable Camera",
      desc: "Grant camera permissions to start detecting objects in real-time.",
    },
    {
      icon: <FiEye className="text-primary text-3xl" />,
      title: "AI Detection",
      desc: "TensorFlow.js identifies 80+ objects with bounding boxes.",
    },
    {
      icon: <FiMic className="text-primary text-3xl" />,
      title: "Voice Feedback",
      desc: "Get spoken descriptions in your preferred language.",
    },
  ];

  // Key features
  const keyFeatures = [
    {
      icon: <FiCpu className="text-2xl" />,
      title: "Browser-Powered AI",
      description: "Runs entirely in your browser using TensorFlow.js - no server needed"
    },
    {
      icon: <FiGlobe className="text-2xl" />,
      title: "80+ Objects",
      description: "Detects people, vehicles, furniture, electronics and more"
    },
    {
      icon: <FiCheckCircle className="text-2xl" />,
      title: "No GPU Required",
      description: "Optimized models work on any device with a camera"
    },
    {
      icon: <FiMic className="text-2xl" />,
      title: "Accessibility Ready",
      description: "Voice descriptions assist visually impaired users"
    }
  ];

  const DateVal = new Date();
  const [searchTerm, setSearchTerm] = useState('');
  const year = DateVal.getFullYear();

  // Testimonials
  const TestimonialsData = [
    {
      name: 'Sarah K.',
      role: 'UX Designer',
      text: 'The object detection is impressively accurate. Perfect for prototyping AR features without needing backend infrastructure!',
      rating: 5,
      avatar: SarahImage
    },
    {
      name: 'David L.',
      role: 'Teacher',
      text: 'My students love using this for science projects. The real-time detection makes learning interactive and fun.',
      rating: 4,
      avatar: DaviImage
    },
    {
      name: 'Amina B.',
      role: 'Developer',
      text: 'Integrated this into my React app in minutes. The TensorFlow.js model works flawlessly across devices.',
      rating: 5,
      avatar: aminaImage
    }
  ];

  // Filter languages based on search
  const filteredLanguages = supportedLanguages.filter(lang =>
    lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render methods
  const MapHowItWorks = howItWorks.map((step, index) => (
    <div key={index} className="bg-base-100 dark:bg-base-300 p-6 rounded-xl text-center shadow-sm">
      <div className="bg-base-300 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
        {step.icon}
      </div>
      <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
      <p className="text-base-content/70">{step.desc}</p>
    </div>
  ));

  const MapKeyFeatures = keyFeatures.map((feature, index) => (
    <div key={index} className="bg-base-100 dark:bg-base-300 p-6 rounded-lg flex items-start gap-4">
      <div className="bg-primary/10 p-3 rounded-full">
        {feature.icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{feature.title}</h3>
        <p className="text-base-content/70">{feature.description}</p>
      </div>
    </div>
  ));

  const MapSupportedLanguages = filteredLanguages.map((lang) => (
    <div key={lang} className="bg-base-100 dark:bg-base-300 p-4 rounded-lg flex items-center gap-2 hover:bg-base-300 dark:hover:bg-base-100 transition-colors">
      <FiCheckCircle className="text-success" />
      <span className="font-medium">{lang}</span>
    </div>
  ));

  const MapTestimonialsData = TestimonialsData.map((testimonial, index) => (
    <div key={index} className="bg-base-100 dark:bg-base-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="avatar">
          <div className="w-10 lg:w-20 transition-all duration-300 rounded-full">
            <img  src={testimonial.avatar} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold">{testimonial.name}</h3>
          <p className="text-sm text-base-content/70">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-base-content/90 mb-4">"{testimonial.text}"</p>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-base-content/30'}`}
          />
        ))}
      </div>
    </div>
  ));

  return (
    <div className={`h-full bg-transparent overflow-x-hidden w-full overflow-y-auto relative min-w-full max-w-[100%] flex flex-col justify-between`}>
      <Notifier />
      <section className={`md:w-full justify-between flex flex-col gap-2 px-1 relative overflow-x-hidden overflow-y-visible w-full rounded-sm md:mx-auto m-auto h-full`}>
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AR <span className="text-secondary">Object Detection</span>
          </h1>
          <p className="text-xl text-base-content/80 max-w-2xl mx-auto">
            Real-time object recognition powered by TensorFlow.js - works directly in your browser with no backend required
          </p>
        </section>

        {/* How It Works */}
        <section className="bg-base-200 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {MapHowItWorks}
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 bg-base-100 dark:bg-base-200">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MapKeyFeatures}
            </div>
          </div>
        </section>

        {/* Supported Languages */}
        <section className="py-16 bg-base-200">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Voice Description Languages
            </h2>
            
            <div className="relative mb-6 max-w-md mx-auto">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/70" />
              <input
                type="text"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10 ring-[1px] ring-slate-300 dark:ring-slate-800 focus:ring-2 focus:ring-secondary"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-error"
                >
                  <FiX />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 max-h-[400px] overflow-y-auto md:grid-cols-4 gap-4 p-2">
              {MapSupportedLanguages.length > 0 ? (
                MapSupportedLanguages
              ) : (
                <div className="col-span-full text-center py-8 text-base-content/70">
                  <FiAlertCircle className="mx-auto text-2xl mb-2" />
                  No languages found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-base-100 dark:bg-base-200">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              What People Are Saying
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MapTestimonialsData}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p>All rights reserved ©{year}, developed by <a href="https://briannjuguna.netlify.app/" className="hover:text-primary underline underline-offset-2">Brian Njuguna</a></p>
          </div>
        </footer>
      </section>
    </div>
  )
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
})

export default connect(mapStateToProps, null)(DashboardPage);