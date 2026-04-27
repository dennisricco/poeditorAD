'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Languages, TrendingUp, Calendar, Loader2 } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  projectId: number;
  color: 'yellow' | 'blue' | 'pink' | 'green';
  createdDate?: string;
}

const colorMap = {
  yellow: 'bg-poe-yellow',
  blue: 'bg-poe-blue',
  pink: 'bg-poe-pink',
  green: 'bg-poe-green',
};

export default function ProjectCard({
  name,
  projectId,
  color,
  createdDate,
}: ProjectCardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<{ total: number; translated: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const bgColor = colorMap[color];

  useEffect(() => {
    async function fetchProjectStats() {
      try {
        const response = await fetch('/api/poeditor/languages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch languages');
        }

        const data = await response.json();

        if (data.response?.status === 'success' && data.result?.languages?.length > 0) {
          // Ambil statistik dari bahasa pertama sebagai representasi
          const firstLang = data.result.languages[0];
          setStats({
            total: firstLang.translations || 0,
            translated: firstLang.translated || 0,
          });
        } else {
          setStats({ total: 0, translated: 0 });
        }
      } catch (err) {
        console.error('Error fetching project stats:', err);
        setStats({ total: 0, translated: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchProjectStats();
  }, [projectId]);

  const progress = stats && stats.total > 0 
    ? Math.round((stats.translated / stats.total) * 100) 
    : 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleClick = () => {
    router.push(`/project/${projectId}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        ${bgColor} 
        border-4 border-poe-black rounded-3xl cartoon-shadow 
        p-5 sm:p-6 
        transition-cartoon 
        hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000000] 
        cursor-pointer
        flex flex-col
        h-full
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <h3 className="text-xl sm:text-2xl font-black leading-tight flex-1 min-w-0">
          {name}
        </h3>
        <div className="w-12 h-12 bg-white border-4 border-poe-black rounded-2xl flex items-center justify-center shrink-0">
          <Languages className="w-6 h-6" strokeWidth={3} />
        </div>
      </div>

      {/* Progress Section */}
      {loading ? (
        <div className="mb-5 flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" strokeWidth={3} />
        </div>
      ) : (
        <div className="mb-5 flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">Progress</span>
            <span className="text-base sm:text-lg font-black">{progress}%</span>
          </div>
          <div className="w-full h-7 bg-white border-4 border-poe-black rounded-full overflow-hidden">
            <div
              className="h-full bg-poe-black transition-all duration-500 ease-out flex items-center justify-end pr-2"
              style={{ width: `${progress}%` }}
            >
              {progress > 20 && (
                <TrendingUp className="w-4 h-4 text-white" strokeWidth={3} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="space-y-2">
        {stats && (
          <div className="bg-white border-4 border-poe-black rounded-xl px-3 py-2 text-xs sm:text-sm font-black">
            {stats.translated} / {stats.total} strings
          </div>
        )}
        {createdDate && (
          <div className="bg-white border-4 border-poe-black rounded-xl px-3 py-2 text-xs sm:text-sm font-black flex items-center gap-2">
            <Calendar className="w-4 h-4" strokeWidth={3} />
            {formatDate(createdDate)}
          </div>
        )}
      </div>
    </div>
  );
}
