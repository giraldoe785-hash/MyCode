import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const VideoProgressContext = createContext();

export function VideoProgressProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || 'usr_101';

  const [progressMap, setProgressMap] = useState({});
  const [courses, setCourses] = useState([]);
  const [favorites, setFavorites] = useState({ courses: ['course-java-spring'], lessons: ['les-1-1'] });
  const [loading, setLoading] = useState(true);

  const refreshCoursesAndProgress = async () => {
    try {
      const [allCourses, pMap, favs] = await Promise.all([
        api.courses.getAll(),
        api.progress.getProgressMap(),
        api.favorites.getFavorites(userId)
      ]);
      setCourses(allCourses);
      setProgressMap(pMap);
      setFavorites(favs || { courses: [], lessons: [] });
    } catch (e) {
      console.error('Progress sync error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCoursesAndProgress();
  }, [userId]);

  const saveProgress = async (courseId, lessonId, seconds, isCompleted = false) => {
    await api.progress.saveLessonProgress(courseId, lessonId, seconds, isCompleted);
    setProgressMap(prev => ({
      ...prev,
      [lessonId]: {
        courseId,
        seconds: Math.floor(seconds),
        completed: isCompleted || (prev[lessonId]?.completed ?? false),
        lastWatched: Date.now()
      }
    }));
  };

  const markLessonComplete = async (courseId, lessonId) => {
    await api.progress.saveLessonProgress(courseId, lessonId, 0, true);
    setProgressMap(prev => ({
      ...prev,
      [lessonId]: {
        courseId,
        seconds: prev[lessonId]?.seconds || 0,
        completed: true,
        lastWatched: Date.now()
      }
    }));
  };

  const toggleLessonComplete = async (courseId, lessonId) => {
    const currentCompleted = progressMap[lessonId]?.completed ?? false;
    const nextState = !currentCompleted;
    await api.progress.saveLessonProgress(courseId, lessonId, progressMap[lessonId]?.seconds || 0, nextState);
    setProgressMap(prev => ({
      ...prev,
      [lessonId]: {
        courseId,
        seconds: prev[lessonId]?.seconds || 0,
        completed: nextState,
        lastWatched: Date.now()
      }
    }));
    return nextState;
  };

  const getLessonProgress = (lessonId) => {
    return progressMap[lessonId] || { seconds: 0, completed: false, lastWatched: 0 };
  };
  const getCourseProgress = (courseOrId) => {
    let targetCourse = typeof courseOrId === 'string' 
      ? courses.find(c => c.id === courseOrId)
      : courseOrId;

    if (!targetCourse || !targetCourse.secciones) {
      return { percentage: 0, completedCount: 0, totalLessons: 0, valueOf: () => 0 };
    }

    let totalLessons = 0;
    let completedCount = 0;

    targetCourse.secciones.forEach(sec => {
      sec.lecciones.forEach(les => {
        totalLessons++;
        if (progressMap[les.id]?.completed || les.completada) {
          completedCount++;
        }
      });
    });

    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    return {
      percentage,
      completedCount,
      totalLessons,
      toString: () => String(percentage),
      valueOf: () => percentage
    };
  };

  const getContinueWatchingList = () => {
    const continueList = [];
    courses.forEach(course => {
      let lastWatchedLesson = null;
      let latestTime = 0;

      course.secciones?.forEach(sec => {
        sec.lecciones?.forEach(les => {
          const prog = progressMap[les.id];
          if (prog && prog.lastWatched > latestTime) {
            latestTime = prog.lastWatched;
            lastWatchedLesson = { ...les, savedSeconds: prog.seconds, completed: prog.completed };
          }
        });
      });

      if (lastWatchedLesson) {
        const stats = getCourseProgress(course);
        continueList.push({
          course,
          lastLesson: lastWatchedLesson,
          progressPercent: stats.percentage,
          lastWatchedTime: latestTime
        });
      }
    });

    return continueList.sort((a, b) => b.lastWatchedTime - a.lastWatchedTime);
  };

  // Favorites System
  const toggleFavoriteCourse = async (courseId) => {
    const res = await api.favorites.toggleCourse(courseId, userId);
    if (res.success) {
      setFavorites(res.favorites);
    }
    return res.isFavorite;
  };

  const isFavoriteCourse = (courseId) => {
    return (favorites.courses || []).includes(courseId);
  };

  const toggleFavoriteLesson = async (lessonId) => {
    const res = await api.favorites.toggleLesson(lessonId, userId);
    if (res.success) {
      setFavorites(res.favorites);
    }
    return res.isFavorite;
  };

  const isFavoriteLesson = (lessonId) => {
    return (favorites.lessons || []).includes(lessonId);
  };

  const getFavoriteCoursesList = () => {
    return courses.filter(c => isFavoriteCourse(c.id));
  };

  const unlockCourse = async (courseId) => {
    const res = await api.courses.unlockCourse(courseId);
    if (res.success) {
      await refreshCoursesAndProgress();
    }
    return res;
  };

  const unlockLesson = async (courseId, lessonId) => {
    const res = await api.courses.unlockLesson(courseId, lessonId);
    if (res.success) {
      await refreshCoursesAndProgress();
    }
    return res;
  };

  return (
    <VideoProgressContext.Provider value={{
      progressMap,
      courses,
      loading,
      saveProgress,
      markLessonComplete,
      toggleLessonComplete,
      getLessonProgress,
      getCourseProgress,
      getContinueWatchingList,
      favorites,
      toggleFavoriteCourse,
      isFavoriteCourse,
      toggleFavoriteLesson,
      isFavoriteLesson,
      getFavoriteCoursesList,
      unlockCourse,
      unlockLesson,
      refreshCoursesAndProgress
    }}>
      {children}
    </VideoProgressContext.Provider>
  );
}

export function useVideoProgress() {
  const context = useContext(VideoProgressContext);
  if (!context) {
    throw new Error('useVideoProgress must be used within a VideoProgressProvider');
  }
  return context;
}
