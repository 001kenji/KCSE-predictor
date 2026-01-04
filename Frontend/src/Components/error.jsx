import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBug, FaRedoAlt, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";
import wrongcode from '../assets/images/wrongcode.png';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
  
    componentDidCatch(error, info) {
      // You can log errors to an error reporting service here
      console.error("Error caught by Error Boundary: ", error, info);
     
    }

    handleReset = () => {
      this.setState({ hasError: false });
      window.location.reload();
    };
  
    render() {
      if (this.state.hasError) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="flex flex-col md:flex-row">
                {/* Left Content Section */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                      <FaExclamationTriangle className="text-2xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">
                      
                      <span className="text-indigo-600">Oops!</span> Something broke
                    </h1>
                  </div>

                  <div className="mb-8">
                    <p className="text-slate-600 mb-4">
                      Our code gremlins are working overtime to fix this issue. 
                      In the meantime, you can try one of these options:
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-slate-700">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span>Refresh the page to try again</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span>Go back to the previous page</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span>Contact support if the problem persists</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.history.back()}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
                    >
                      <FaArrowLeft /> Go Back
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={this.handleReset}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      <FaRedoAlt /> Try Again
                    </motion.button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <Link 
                      to="/home/ideas/" 
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 w-fit"
                    >
                      <FaBug /> Report this issue
                    </Link>
                  </div>
                </div>

                {/* Right Visual Section */}
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-8">
                  <div className="relative">
                    <img 
                      src={wrongcode} 
                      className="w-full max-w-md rounded-lg shadow-md border border-slate-200" 
                      alt="Error illustration" 
                    />
                    <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-full shadow-lg">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                        <FaExclamationTriangle className="text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      }
  
      return this.props.children;
    }
}