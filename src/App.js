import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import OTPVerification from "./components/OTPVerification";
import Dashboard from "./components/Dashboard";
import UpdateProfile from "./components/UpdateProfile";
import Notes from "./components/Notes";
import StudyFolder from "./components/StudyFolder";
import ExamComponent from "./components/ExamComponent";
import ExamResult from "./components/ExamResult";
import UploadNotes from "./components/UploadNotes";
import MyUploads from "./components/MyUploads";
import TeachersNotes from "./components/TeachersNotes";
import UploadNotice from "./components/UploadNotice";
import ImportantNotice from "./components/ImportantNotice";
import ViewStudents from "./components/ViewStudents";
import ViewTeachers from "./components/viewTeachers";
import HelpSupport from "./components/HelpSupport";
import VerifyOfferLetters from "./components/VerifyOfferLetters";
import CommissionReport from "./components/CommissionReport";
import SearchWeb from "./components/SearchWeb";
import CodeEditor from "./components/CodeEditor";
import Chatbot from "./components/Chatbot";
import TeacherStudyFolder from "./components/TeacherStudyFolder";
import ContentSummarizer from "./components/ContentSummarizer";
import NoteDetail from "./components/NoteDetail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PredictionInsights from './components/PredictionInsights';
import TechPrep from './components/TechPrep';
import TechPrepAdmin from "./components/TechPrepAdmin";
import TechPrepLearning from './components/TechPrepLearning';
import Resume from './components/Resume';
function App() {
  return (

    <Router>
      <Routes>
        {/* Default route - redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UpdateProfile />} />
        <Route path="/my-notes" element={<Notes />} />
        <Route path="/study-folder" element={<StudyFolder />} />
        <Route path="/test" element={<ExamComponent />} />
        <Route path="/exam-result" element={<ExamResult />} />
        <Route path="/upload-notes" element={<UploadNotes />} />
        <Route path="/my-uploads" element={<MyUploads />} />
        <Route path="/teachers-notes" element={<TeachersNotes />} />
        <Route path="/upload-notice" element={<UploadNotice />} />
        <Route path="/important-notice" element={<ImportantNotice />} />
        <Route path="/view-students" element={<ViewStudents />} />
        <Route path="/view-teachers" element={<ViewTeachers />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/verify-offer-letters" element={<VerifyOfferLetters />} />
        <Route path="/commission-report" element={<CommissionReport />} />
        <Route path="/search-web" element={<SearchWeb />} />
        <Route path="/code-editor" element={<CodeEditor />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/teacher-study-folder" element={<TeacherStudyFolder />} />
        <Route path="/content-summarizer" element={<ContentSummarizer />} />
        <Route path="/notes/:noteId" element={<NoteDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/insights" element={<PredictionInsights />} />
        <Route path="/tech-prep" element={<TechPrep />} />
        <Route path="/tech-prep-admin" element={<TechPrepAdmin />} />
        <Route path="/tech-prep/learn/:skillId" element={<TechPrepLearning />} />
        <Route path="/build-resume" element={<Resume />} />
        


      </Routes>
    </Router>

  );
}

export default App;
