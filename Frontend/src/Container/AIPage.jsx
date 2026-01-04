import { useState, useEffect } from 'react'
import { FaBook, FaSpinner, FaChartPie, FaHistory, FaCheckCircle, FaFilter } from 'react-icons/fa'

export default function AIPredictionPage() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paperFilter, setPaperFilter] = useState('all') // 'all', '1', '2', '3'
  const date = new Date()
  const year_val = date.getFullYear()

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/app/subjects/`)
        const data = await response.json()
        setSubjects(data || [])
      } catch (err) {
        setError('Failed to load subjects')
      }
    }
    fetchSubjects()
  }, [])

  const handleSubjectSelect = async (subjectId) => {
      setSelectedSubject(subjectId)
      setLoading(true)
      setError(null)
      setPaperFilter('all')
      
      try {
          // Initial request also uses POST with payload
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/app/predict/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ subject_id: subjectId }),
          })

          const data = await response.json()
          
          if (data.status === 'pending') {
              await pollPrediction(subjectId)
          } else {
              setPrediction(data)
          }
      } catch (err) {
          setError('Prediction failed - please try again')
      } finally {
          setLoading(false)
      }
  }

  const pollPrediction = async (subjectId, attempts = 0) => {
      if (attempts >= 5) {
          setError('Prediction taking too long. Please try again later.')
          return
      }
      
      try {
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/app/predict/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ subject_id: subjectId }),
          })

          if (!response.ok) {
              throw new Error('Error checking prediction status')
          }

          const data = await response.json()
          
          if (data.status !== 'pending') {
              setPrediction(data)
              return
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000))
          await pollPrediction(subjectId, attempts + 1)
      } catch (err) {
          setError('Error checking prediction status')
      }
  }

  // Filter topics based on selected paper
  const filteredTopics = prediction?.predicted_topics?.filter(topic => {
    if (paperFilter === 'all') return true
    return topic.paper.toString() === paperFilter
  }) || []

  // Get unique papers available in the prediction data
  const availablePapers = prediction 
    ? [...new Set(prediction.predicted_topics.map(topic => topic.paper.toString()))]
    : []

  const MapFilteredPredictedTopics = filteredTopics.map((topic, index) => (
    <div 
      key={index} 
      className="border-l-4 border-blue-400 dark:border-blue-500 bg-gray-50 dark:bg-gray-700 rounded-r-lg overflow-hidden transition-colors duration-200"
    >
      <div className="p-4 ">
        <div className="flex justify-between items-start">
          <div className=' w-full ' >
            <div className='flex flex-row flex-wrap w-full justify-between py-1' >

              <h4 className="font-medium text-gray-900 dark:text-white">
                {index + 1}. {topic.topic.replace(/_/g, ' ')}
              </h4>

              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  topic.confidence > 0.15 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' 
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
                }`}>
                  {(topic.confidence * 100).toFixed(1)}%
                </span>
                {topic.confidence > 0.15 && (
                  <FaCheckCircle className="ml-2 text-green-500 dark:text-green-400" />
                )}
              </div>

            </div>
            
            <div className="flex flex-row flex-wrap gap-1 w-full items-center  text-xs text-gray-500 dark:text-gray-400">
              <FaHistory className="mr-1" />
              <span>Based on {topic.occurrences} past questions</span>
              <span className="mx-2">•</span>
              <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full">
                Paper {topic.paper}
              </span>
            </div>
          </div>
         
        </div>
        
        {/* Confidence meter */}
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full" 
            style={{ width: `${topic.confidence * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  ))

  return (
    <div className="h-full w-full bg-gray-50 pb-20 dark:bg-gray-900 p-6 transition-colors duration-200">
      <div className=" mx-auto">
        <div className="text-center mt-10 mb-10">
          <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300 mb-2">
            KCSE Topic Predictor AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Predict likely exam topics based on 20+ years of past papers
          </p>
        </div>

        <div className="flex  flex-col xl:flex-row w-full gap-6">
          {/* Subject Selection Panel */}
          <div className="lg:col-span-1 bg-white lg:min-w-[300px] dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
              <FaBook className="mr-2" />
              Select Subject
            </h2>
            
            {error && (
              <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-100 p-4 mb-4 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject.id)}
                  disabled={loading}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedSubject === subject.id 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400' 
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  } ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{subject.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{subject.code}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Prediction Results Panel */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-4 sm:mb-0 flex items-center">
                <FaChartPie className="mr-2" />
                Predicted Topics
              </h2>
              
              {/* Paper filter - only show when prediction exists */}
              {prediction && (
                <div className="relative flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                  <FaFilter className="text-gray-600 dark:text-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-200 mr-2">Filter by paper:</span>
                  
                  {/* Custom dropdown */}
                  <div className="relative group">
                    {/* Dropdown trigger */}
                    <button className="flex items-center justify-between bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded px-3 py-1.5 text-sm cursor-pointer w-32">
                      <span>{paperFilter === 'all' ? 'All Papers' : `Paper ${paperFilter}`}</span>
                      <svg 
                        className="w-4 h-4 ml-2 text-gray-500 dark:text-gray-300 transition-transform group-hover:rotate-180" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    <div className="absolute z-10 hidden group-hover:block w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg overflow-hidden">
                      <div 
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 ${paperFilter === 'all' ? 'bg-blue-50 dark:bg-gray-600 text-blue-700 dark:text-blue-300' : ''}`}
                        onClick={() => setPaperFilter('all')}
                      >
                        All Papers
                      </div>
                      {availablePapers.map(paper => (
                        <div 
                          key={paper}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 ${paperFilter === paper ? 'bg-blue-50 dark:bg-gray-600 text-blue-700 dark:text-blue-300' : ''}`}
                          onClick={() => setPaperFilter(paper)}
                        >
                          Paper {paper}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FaSpinner className="animate-spin text-blue-500 dark:text-blue-400 text-4xl mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Analyzing past papers...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few moments</p>
              </div>
            ) : prediction ? (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <h3 className="font-bold text-lg text-blue-900 dark:text-blue-200">
                      {prediction.subject.name} ({prediction.subject.code})
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Last updated: {new Date(prediction.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                    Overall Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                
                {filteredTopics.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No topics found for the selected paper filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 w-full gap-4">
                    {MapFilteredPredictedTopics}
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                  <p>These topic predictions are based on analysis of KCSE exams from 2000-{year_val - 1}.</p>
                  <p>Focus on topics with higher confidence scores for exam preparation.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                  <FaBook className="text-blue-600 dark:text-blue-400 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Subject Selected</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Select a subject to view AI-generated predictions of likely exam topics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}