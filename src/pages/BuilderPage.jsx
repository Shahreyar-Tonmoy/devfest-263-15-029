import React from 'react';
import TenderHeader from '../components/TenderHeader';
import FileUploadZone from '../components/FileUploadZone';
import UploadedFilesList from '../components/UploadedFilesList';
import RequirementsList from '../components/RequirementsList';
import PackageGenerator from '../components/PackageGenerator';

export default function BuilderPage() {
  return (
    <div className="space-y-6">
      {/* 1. Tender Header & Details */}
      <TenderHeader />

      {/* 2. Main Workspace: 2-Column layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side (5 cols): File Upload & Uploaded Files List */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <FileUploadZone />
          <UploadedFilesList />
        </div>

        {/* Right Side (7 cols): Document Requirements Matching & Package Generator */}
        <div className="lg:col-span-7 space-y-6">
          <PackageGenerator />
          <RequirementsList />
        </div>

      </div>
    </div>
  );
}
