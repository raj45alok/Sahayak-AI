import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Clock, BookOpen, MapPin } from 'lucide-react';

export function StudentSchedule() {
  const todayClasses = [
    {
      id: 1,
      subject: 'Mathematics',
      teacher: 'Dr. Sarah Wilson',
      time: '10:00 AM - 11:00 AM',
      topic: 'Linear Equations',
      room: 'Room 101',
      status: 'upcoming'
    },
    {
      id: 2,
      subject: 'Science',
      teacher: 'Mr. John Davis',
      time: '2:00 PM - 3:00 PM',
      topic: 'Chemical Reactions',
      room: 'Lab 1',
      status: 'upcoming'
    }
  ];

  const weekSchedule = [
    {
      day: 'Monday',
      classes: [
        { subject: 'Mathematics', time: '10:00 AM', teacher: 'Dr. Sarah Wilson' },
        { subject: 'Science', time: '2:00 PM', teacher: 'Mr. John Davis' }
      ]
    },
    {
      day: 'Tuesday',
      classes: [
        { subject: 'Mathematics', time: '10:00 AM', teacher: 'Dr. Sarah Wilson' },
        { subject: 'English', time: '1:00 PM', teacher: 'Ms. Emily Brown' }
      ]
    },
    {
      day: 'Wednesday',
      classes: [
        { subject: 'Science', time: '11:00 AM', teacher: 'Mr. John Davis' },
        { subject: 'Mathematics', time: '2:00 PM', teacher: 'Dr. Sarah Wilson' }
      ]
    },
    {
      day: 'Thursday',
      classes: [
        { subject: 'English', time: '9:00 AM', teacher: 'Ms. Emily Brown' },
        { subject: 'Science', time: '3:00 PM', teacher: 'Mr. John Davis' }
      ]
    },
    {
      day: 'Friday',
      classes: [
        { subject: 'Mathematics', time: '10:00 AM', teacher: 'Dr. Sarah Wilson' }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">My Schedule</h1>
        <p className="text-base text-muted-foreground">
          View your class schedule and upcoming lessons
        </p>
      </div>

      {/* Today's Classes */}
      <Card className="card-effect border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            Today's Classes
          </CardTitle>
          <CardDescription className="text-sm">
            Your schedule for today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayClasses.map((classItem) => (
            <div key={classItem.id} className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-base text-foreground">{classItem.subject}</h3>
                  <Badge variant="outline" className="text-xs font-medium">{classItem.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{classItem.teacher}</p>
                <p className="text-sm text-foreground font-medium">{classItem.topic}</p>
              </div>
              <div className="text-right space-y-2 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {classItem.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {classItem.room}
                </div>
              </div>
              <Button size="sm" className="flex-shrink-0">Join Class</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card className="card-effect border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Weekly Schedule</CardTitle>
          <CardDescription className="text-sm">
            Your complete week schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {weekSchedule.map((day, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold text-base text-foreground pb-2 border-b border-border">{day.day}</h3>
                <div className="space-y-2">
                  {day.classes.map((classItem, classIndex) => (
                    <div key={classIndex} className="flex items-center justify-between p-4 bg-secondary/50 border border-border rounded-lg hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <div>
                          <span className="font-medium text-foreground">{classItem.subject}</span>
                          <p className="text-sm text-muted-foreground mt-1">{classItem.teacher}</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-foreground">{classItem.time}</div>
                    </div>
                  ))}
                  {day.classes.length === 0 && (
                    <div className="text-center py-6 text-sm text-muted-foreground bg-secondary/30 rounded-lg">
                      No classes scheduled
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}