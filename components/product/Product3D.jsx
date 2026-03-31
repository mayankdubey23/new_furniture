'use client';

import ModelViewer from '../canvas/ModelViewer';

export default function Product3D({ modelPath }) {
  if (!modelPath) {
    return (
      <div className="h-80 w-full rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 p-4 md:h-[450px] flex items-center justify-center text-gray-500 font-semibold">
        3D Model Coming Soon
      </div>
    );
  }
  return (
    <div className="h-80 w-full rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 p-4 md:h-[450px]">
      <ModelViewer modelPath={modelPath} />
    </div>
  );
}
