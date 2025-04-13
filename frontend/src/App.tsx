import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import Login from './components/auth/Login/Login';
import Register from './components/auth/Register/Register';
import Layout from './components/Layout';
import Dashboard from './components/student/Dashboard/Dashboard';
import LearningPath from './components/student/LearningPath';
import Feedback from './components/student/Feedback';
import StudentActivityList from './components/student/ActivityList/StudentActivityList';
import StudentActivityDetail from './components/student/ActivityDetail';
import {
  TeacherDashboard,
  ActivityForm,
  ClassManager,
  ActivityManagement,
  LearningTargetForm,
  StudentEvaluation,
  LearningGoalManagement
} from './components/teacher';

// 路由保护组件
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole: string }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 4,
        },
      } as any}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 学生路由 */}
          <Route path="/student" element={
            <ProtectedRoute requiredRole="STUDENT">
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="learning-path" element={<LearningPath />} />
            <Route path="activities" element={<StudentActivityList />} />
            <Route path="activity/:id" element={<StudentActivityDetail />} />
            <Route path="feedback" element={<Feedback />} />
            <Route index element={<Navigate to="/student/dashboard" replace />} />
          </Route>

          {/* 教师路由 */}
          <Route path="/teacher" element={
            <ProtectedRoute requiredRole="TEACHER">
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="classes" element={<ClassManager />} />
            <Route path="class/:id" element={<ClassManager />} />
            <Route path="class/edit/:id" element={<ClassManager />} />
            <Route path="activities" element={<ActivityManagement />} />
            <Route path="activity/:id" element={<StudentActivityDetail />} />
            <Route path="activity/create" element={<ActivityForm mode="create" />} />
            <Route path="activity/edit/:id" element={<ActivityForm mode="edit" />} />
            <Route path="target/create" element={<LearningTargetForm />} />
            <Route path="targets" element={<LearningGoalManagement />} />
            <Route path="student/:id" element={<StudentEvaluation />} />
            <Route path="student" element={<StudentEvaluation />} />
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          </Route>

          {/* 通用路由 */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="">
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="learning-path" element={<LearningPath />} />
            <Route path="activities" element={<StudentActivityList />} />
            <Route path="activity/:id" element={<StudentActivityDetail />} />
            <Route path="feedback" element={<Feedback />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
