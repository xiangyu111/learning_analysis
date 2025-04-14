import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import StudentProfileCenter from './components/student/ProfileCenter';
import TeacherProfileCenter from './components/teacher/ProfileCenter';
import {
  TeacherDashboard,
  ActivityForm,
  ClassManager,
  ActivityManagement,
  LearningTargetForm,
  StudentEvaluation,
  LearningGoalManagement
} from './components/teacher';
import { default as AdminClassManager } from './components/admin/ClassManager';
import SystemLogs from './components/admin/SystemLogs';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherManager from './components/admin/TeacherManager';
import StudentManager from './components/admin/StudentManager';

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

// 个人中心路由组件
const ProfileRoute = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData || !userData.id || !userData.role) {
      // 如果用户信息不存在或不完整，重定向到登录页
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);
  
  const refreshUserInfo = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      // 更新localStorage中的用户信息
      localStorage.setItem('user', JSON.stringify({...userData}));
      // 更新组件状态
      setUser({...userData});
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  };
  
  if (!user || !user.role) {
    return null; // 等待重定向，不渲染任何内容
  }
  
  return (
    <>
      {user.role === 'STUDENT' && <StudentProfileCenter user={user} refreshUserInfo={refreshUserInfo} />}
      {user.role === 'TEACHER' && <TeacherProfileCenter user={user} refreshUserInfo={refreshUserInfo} />}
    </>
  );
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
          
          {/* 个人中心路由 */}
          <Route path="/profile" element={
            <ProtectedRoute requiredRole="">
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<ProfileRoute />} />
          </Route>
          
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
            <Route path="profile" element={
              <StudentProfileCenter 
                user={JSON.parse(localStorage.getItem('user') || '{}')} 
                refreshUserInfo={() => {
                  // 获取最新用户信息并更新
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  localStorage.setItem('user', JSON.stringify({...user}));
                }} 
              />
            } />
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
            <Route path="profile" element={
              <TeacherProfileCenter 
                user={JSON.parse(localStorage.getItem('user') || '{}')} 
                refreshUserInfo={() => {
                  // 获取最新用户信息并更新
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  localStorage.setItem('user', JSON.stringify({...user}));
                }} 
              />
            } />
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
          
          {/* 管理员路由 */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="classes" element={<AdminClassManager />} />
            <Route path="teachers" element={<TeacherManager />} />
            <Route path="students" element={<StudentManager />} />
            <Route path="logs" element={<SystemLogs />} />
            <Route path="profile" element={<div>个人信息</div>} />
            <Route path="settings" element={<div>系统设置</div>} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
