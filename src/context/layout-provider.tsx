import { Sidebar } from '@/components/Sidebar';
import React from 'react';

interface IPropsLayoutProvider {
  children: React.ReactNode;
}

export const LayoutProvider = ({ children }: IPropsLayoutProvider) => {
  return (
    <>
      <Sidebar />
      {children}
    </>
  );
};
