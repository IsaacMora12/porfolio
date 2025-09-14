import type { ReactNode } from 'react';

export interface ContentWindowMetadata {
  id: string;
  title: string;
  icon?: string | ReactNode;
}
export interface ContentWindowProps {
  metadata: ContentWindowMetadata;
  content: ReactNode;
}