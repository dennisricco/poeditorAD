// Project Types
export interface Project {
  id: number;
  name: string;
  totalStrings: number;
  translatedStrings: number;
  color: 'yellow' | 'blue' | 'pink' | 'green';
  createdAt?: Date;
  updatedAt?: Date;
}

// POEditor API Types
export interface POEditorProject {
  id: number;
  name: string;
  public: number;
  open: number;
  created: string;
}

export interface POEditorProjectDetail {
  id: number;
  name: string;
  description: string;
  public: number;
  open: number;
  reference_language: string;
  terms: number;
  created: string;
}

export interface POEditorLanguage {
  name: string;
  code: string;
  translations: number;
  percentage: number;
  updated: string;
}

export interface POEditorAPIResponse {
  response: {
    status: string;
    code: string;
    message: string;
  };
  result: {
    projects: POEditorProject[];
  };
}

export interface POEditorProjectViewResponse {
  response: {
    status: string;
    code: string;
    message: string;
  };
  result: {
    project: POEditorProjectDetail;
  };
}

export interface POEditorLanguagesResponse {
  response: {
    status: string;
    code: string;
    message: string;
  };
  result: {
    languages: POEditorLanguage[];
  };
}

export interface POEditorExportResponse {
  response: {
    status: string;
    code: string;
    message: string;
  };
  result: {
    url: string;
  };
}

// Color Types
export type ColorVariant = 'yellow' | 'blue' | 'pink' | 'green' | 'white';

// Button Types
export type ButtonSize = 'sm' | 'md' | 'lg';
