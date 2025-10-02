import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Trophy, TrendingUp, Target, Award } from 'lucide-react';

export function StudentProgress() {
  const subjects = [
    {
      name: 'Algebra',
      progress: 85,
      color: 'bg-blue-500',
      completedLessons: 17,
      totalLessons: 20
    },
    {
      name: 'Geometry',
      progress: 72,
      color: 'bg-green-500',
      completedLessons: 14,
      totalLessons: 18
    },
    {
      name: 'Fractions',
      progress: 94,
      color: 'bg-purple-500',
      completedLessons: 15,
      totalLessons: 16
    },
    {
      name: 'Word Problems',
      progress: 68,
      color: 'bg-orange-500',
      completedLessons: 11,
      totalLessons: 15
    }
  ];

  const achievements = [
    {
      title: 'Math Star',
      description: 'Scored 90+ in 3 consecutive assignments',
      icon: '⭐',
      date: '2 days ago'
    },
    {
      title: 'Quick Learner',
      description: 'Completed 5 assignments this week',
      icon: '🚀',
      date: '1 week ago'
    },
    {
      title: 'Problem Solver',
      description: 'Solved 10 challenging problems',
      icon: '🧠',
      date: '2 weeks ago'
    }
  ];

  const stats = [
    {
      title: 'Overall Progress',
      value: '79%',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      title: 'Assignments Completed',
      value: '24',
      icon: Target,
      color: 'bg-green-500'
    },
    {
      title: 'Achievements Earned',
      value: '8',
      icon: Award,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>My Progress</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subject Progress */}
      <Card className="card-effect">
        <CardHeader>
          <CardTitle>Subject Progress</CardTitle>
          <CardDescription>
            Your progress across different subjects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subjects.map((subject, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 ${subject.color} rounded-full`}></div>
                  <span className="font-medium">{subject.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{subject.completedLessons}/{subject.totalLessons} lessons</span>
                  <span>{subject.progress}%</span>
                </div>
              </div>
              <Progress value={subject.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="card-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Recent Achievements
          </CardTitle>
          <CardDescription>
            Your latest accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {achievement.description}
                </p>
                <p className="text-xs text-muted-foreground">{achievement.date}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}