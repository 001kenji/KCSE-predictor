import {  Routes, Route, Navigate } from 'react-router-dom';

import Home from './Container/home';
import './App.css'
import ErrorBoundary from './Components/error'
import NotFoundPage from './Container/404';

function App() {

  return (
    
    <Routes>
      {/* <Route path="/chat" element={<ErrorBoundary> <Chat/> </ErrorBoundary> } /> */}
      <Route path="/" index element={<Navigate to="/home/dashboard" />} />
      <Route path="/home/:page/:extrainfo?/:extrainfo2?" element={ <ErrorBoundary> <Home /> </ErrorBoundary> } />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
