import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <div className="app">
          <h1>文档转换工具</h1>
          <p>欢迎使用文档转换工具！</p>
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

