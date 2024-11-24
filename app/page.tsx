import DiningAnalysisClient from './components/DiningAnalysisClient';

export default function Home() {
  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          用餐记录分析系统
        </h1>
        <DiningAnalysisClient />
      </div>
    </main>
  );
}