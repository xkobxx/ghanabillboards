import type { ReactNode } from 'react';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section';
};

export default function PageContainer({ children, className = '', as: Tag = 'div' }: PageContainerProps) {
  return (
    <Tag className={`mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 ${className}`}>
      {children}
    </Tag>
  );
}
