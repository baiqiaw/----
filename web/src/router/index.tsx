import { Routes, Route } from 'react-router-dom';

/**
 * 路由配置
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<div>首页</div>} />
      {/* TODO: 添加更多路由 */}
    </Routes>
  );
};

