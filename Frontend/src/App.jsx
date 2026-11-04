import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MentalHealthInfo from './pages/MentalHealthInfo';
import Screening from './pages/Screening';
import MoodTracker from './pages/MoodTracker';
import Journal from './pages/Journal';
import SelfCare from './pages/SelfCare';
import Progress from './pages/Progress';
import Goals from './pages/Goals';
import Support from './pages/Support';
import Resources from './pages/Resources';
import AIChat from './pages/AIChat';
import { Protected, GuestOnly } from './auth';

const privateRoutes = [
  ['/home', Home], ['/screening', Screening], ['/mood', MoodTracker], ['/journal', Journal],
  ['/self-care', SelfCare], ['/progress', Progress], ['/goals', Goals], ['/support', Support], ['/resources', Resources], ['/ai-chat', AIChat]
];

export default function App() {
  return <Routes>
    <Route path="/" element={<Welcome />} />
    <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
    <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
    <Route path="/information" element={<MentalHealthInfo />} />
    {privateRoutes.map(([path, Component]) => <Route key={path} path={path} element={<Protected><Component /></Protected>} />)}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
