// 基础 LayOut 组件

import React from 'react';
// import Header from "@/components/header";

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full h-screen bg-background">
      {/* <Header /> */}
      <div className="flex-grow">{children}</div>
    </div>
  );
};

export default BaseLayout;
