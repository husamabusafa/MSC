import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  BookOpen, 
  Search, 
  Play, 
  FileText, 
  Users, 
  Clock,
  ChevronRight,
  Target,
  Brain
} from 'lucide-react';
import { GET_COURSES, GET_LEVELS } from '../../lib/graphql/academic';

export const CoursesPage: React.FC = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES);
  const { data: levelsData, loading: levelsLoading } = useQuery(GET_LEVELS);

  const courses = coursesData?.courses || [];
  const levels = levelsData?.levels || [];

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !selectedLevel || course.levelId === selectedLevel;
    return matchesSearch && matchesLevel && course.isVisible;
  });

  // For now, we'll show placeholder counts since we don't have quiz/flashcard counts in the course query
  const getQuizCount = (courseId: string) => {
    // This would need to be implemented with a separate query or included in the course query
    return 0;
  };

  const getFlashcardCount = (courseId: string) => {
    // This would need to be implemented with a separate query or included in the course query
    return 0;
  };

  if (coursesLoading || levelsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.courses')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Explore courses and enhance your learning experience
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedLevel === null ? 'primary' : 'outline'}
              colorScheme="student"
              onClick={() => setSelectedLevel(null)}
            >
              All Levels
            </Button>
            {levels.map((level: any) => (
              <Button
                key={level.id}
                variant={selectedLevel === level.id ? 'primary' : 'outline'}
                colorScheme="student"
                onClick={() => setSelectedLevel(level.id)}
              >
                {level.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course: any) => {
          const quizCount = getQuizCount(course.id);
          const flashcardCount = getFlashcardCount(course.id);
          
          return (
            <Card key={course.id} hover className="group">
              <div className="flex items-start justify-between mb-4">
                              <div className="p-3 bg-student-100 dark:bg-student-900/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-student-600 dark:text-student-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {course.level?.name}
                </span>
              </div>
              
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-student-600 dark:group-hover:text-student-400 transition-colors">
                {course.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>{quizCount} {t('academic.quizzes')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  <span>{flashcardCount} {t('academic.flashcards')}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {quizCount > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    colorScheme="student"
                    icon={Play}
                    onClick={() => window.location.href = `/student/quiz/${course.id}`}
                    className="flex-1"
                  >
                    {t('academic.takeQuiz')}
                  </Button>
                )}
                {flashcardCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="student"
                    icon={FileText}
                    onClick={() => window.location.href = `/student/flashcards/${course.id}`}
                    className="flex-1"
                  >
                    {t('academic.viewFlashcards')}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};