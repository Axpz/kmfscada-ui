import React from 'react';
import { Logo as UILogo } from '../ui/logo';

export default function Logo() {
  return (
    <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <UILogo size="md" variant="icon" />
      {/* <span className="font-bold text-lg text-primary">KFM·Scada</span> */}
    </div>
  );
}