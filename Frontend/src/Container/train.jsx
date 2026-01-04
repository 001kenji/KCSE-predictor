import { useState, useEffect } from 'react';
import { 
  FaFilePdf, 
  FaRobot, 
  FaChartLine, 
  FaSpinner, 
  FaCheckCircle, 
  FaArrowRight,
  FaPlay,
  FaPause,
  FaForward
} from 'react-icons/fa';

export default function TrainingWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoProceed, setAutoProceed] = useState(false);
  const [progress, setProgress] = useState({
    extractPdf: { completed: false, message: '' },
    trainModel: { completed: false, message: '' },
    makePredictions: { completed: false, message: '' }
  });
  const [error, setError] = useState(null);
  const [taskStatus, setTaskStatus] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectAllSubjects, setSelectAllSubjects] = useState(true);

  const steps = [
    {
      id: 1,
      title: "Extract PDF Data",
      description: "Process PDFs to extract questions and structure data",
      icon: <FaFilePdf className="text-blue-500" />,
      action: 'extract_pdf_data',
      requiresSubjectSelection: true
    },
    {
      id: 2,
      title: "Train AI Model",
      description: "Create prediction model from extracted data",
      icon: <FaRobot className="text-purple-500" />,
      action: 'train_ai_model',
      requiresSubjectSelection: false
    },
    {
      id: 3,
      title: "Generate Predictions",
      description: "Create and save predictions for selected subjects",
      icon: <FaChartLine className="text-green-500" />,
      action: 'make_predictions',
      requiresSubjectSelection: true
    }
  ];

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/app/subjects/`);
        const data = await response.json();
        setSubjects(data || []);
        // Select all subjects by default
        setSelectedSubjects(data.map(subject => subject.id));
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    fetchSubjects();
  }, []);

  const toggleSubjectSelection = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleSelectAllSubjects = () => {
    if (selectAllSubjects) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(subjects.map(subject => subject.id));
    }
    setSelectAllSubjects(!selectAllSubjects);
  };

  const executeStep = async (step) => {
    setIsProcessing(true);
    setError(null);
    setCurrentStep(step.id);
    setTaskStatus(`${step.title}...`);
    try {
      const payload = {
        action: step.action,
        step: step.id
      };

      // Add subject IDs for steps that require them
      if (step.requiresSubjectSelection) {
        payload.subject_ids = selectedSubjects;
      }

      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/app/train/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute ${step.title}`);
      }

      const result = await response.json();
      
      setProgress(prev => ({
        ...prev,
        [step.action.replace(/_/g, '')]: {
          completed: true,
          message: result.message || `${step.title} completed successfully`
        }
      }));

      setTaskStatus(`${step.title} completed`);
      
      if (autoProceed && step.id < steps.length) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        executeStep(steps[step.id]);
      }
    } catch (err) {
      setError(err.message);
      setTaskStatus(`Error in ${step.title}`);
    } finally {
      setIsProcessing(false);
    }
  };

  
  const startProcessing = () => {
    const firstIncompleteStep = steps.find(
      step => !progress[step.action.replace(/_/g, '')]?.completed
    ) || steps[0];
    // console.log(firstIncompleteStep)
    setError(null);
    executeStep(firstIncompleteStep);
  };

  const proceedToNext = () => {
    const nextStep = steps.find(step => step.id === currentStep + 1);
    if (nextStep) {
      executeStep(nextStep);
    }
  };

  const toggleAutoProceed = () => {
    setAutoProceed(!autoProceed);
  };


  // ... (keep other functions like startProcessing, proceedToNext, etc. the same)

  return (
    <div className="min-h-screen mt-10 bg-gray-50 dark:bg-gray-900 p-6">
    <div className="max-w-4xl  mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          KCSE AI Training Workflow
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Control each step of the training process
        </p>
      </div>

      {(currentStep === 1 || currentStep === 3) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {currentStep === 1 ? "Select Subjects to Process" : "Select Subjects for Prediction"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {currentStep === 1 
                ? "Choose which subjects to process"
                : "Choose which subjects to generate predictions for (select none to predict all)"}
            </p>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectAllSubjects}
                onChange={toggleSelectAllSubjects}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              />
              <label htmlFor="selectAll" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                {selectAllSubjects ? "Deselect All" : "Select All"} Subjects
              </label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
              {subjects.map(subject => (
                <div 
                  key={subject.id}
                  onClick={() => toggleSubjectSelection(subject.id)}
                  className={`p-3 rounded-lg border min-w-fit cursor-pointer transition-colors ${
                    selectedSubjects.includes(subject.id)
                      ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center min-w-fit">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={() => {}}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                    />
                    <div className='flex flex-row flex-wrap w-full' >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {subject.name}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ({subject.code})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {taskStatus && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-lg flex items-center">
          <div className="flex-1">
            {isProcessing ? (
              <span className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                {taskStatus}...
              </span>
            ) : (
              taskStatus
            )}
          </div>
          {isProcessing && (
            <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm">
              In Progress
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Training Steps
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Complete each step in sequence to generate predictions
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`p-6 ${currentStep === step.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-medium ${currentStep === step.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'}`}>
                      {step.title}
                    </h3>
                    {progress[step.action.replace(/_/g, '')]?.completed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <FaCheckCircle className="mr-1" /> Completed
                      </span>
                    ) : currentStep === step.id && isProcessing ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        <FaSpinner className="animate-spin mr-1" /> Processing
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                  {progress[step.action.replace(/_/g, '')]?.message && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {progress[step.action.replace(/_/g, '')].message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <button
                onClick={toggleAutoProceed}
                className={`flex items-center px-4 py-2 rounded-md font-medium mr-4 ${
                  autoProceed
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {autoProceed ? (
                  <>
                    <FaPause className="mr-2" /> Auto Proceed ON
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-2" /> Auto Proceed OFF
                  </>
                )}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {autoProceed ? 'Steps will proceed automatically' : 'Manual step control'}
              </span>
            </div>

            <div className="flex space-x-3">
              {!isProcessing ? (
                <>
                  {!progress.extractPdf.completed ? (
                    <button
                      onClick={startProcessing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Start Process
                    </button>
                  ) : currentStep < steps.length && progress[steps[currentStep - 1].action.replace(/_/g, '')]?.completed ? (
                    <button
                      onClick={proceedToNext}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center"
                    >
                      <FaForward className="mr-2" /> Next Step
                    </button>
                  ) : null}
                </>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed flex items-center"
                >
                  <FaSpinner className="animate-spin mr-2" /> Processing...
                </button>
              )}

              {progress.makePredictions.completed && (
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setProgress({
                      extractPdf: { completed: false, message: '' },
                      trainModel: { completed: false, message: '' },
                      makePredictions: { completed: false, message: '' }
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Reset Workflow
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {steps.map(step => (
              <button
                key={step.id}
                onClick={() => {
                  if (!isProcessing && (
                    step.id === 1 || 
                    (step.id > 1 && progress[steps[step.id - 2].action.replace(/_/g, '')]?.completed)
                  )) {
                    executeStep(step);
                  }
                }}
                disabled={
                  isProcessing || 
                  (step.id > 1 && !progress[steps[step.id - 2].action.replace(/_/g, '')]?.completed)
                }
                className={`px-3 py-1 text-sm rounded-md ${
                  isProcessing || (step.id > 1 && !progress[steps[step.id - 2].action.replace(/_/g, '')]?.completed)
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    : currentStep === step.id
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {step.title}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  </div>
  );
}