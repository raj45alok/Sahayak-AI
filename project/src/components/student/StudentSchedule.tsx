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
    <div className="space-y-6">
      <div>
        <h1>My Schedule</h1>
        <p className="text-muted-foreground mt-1">
          View your class schedule and upcoming lessons
        </p>
      </div>

      {/* Today's Classes */}
      <Card className="card-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Classes
          </CardTitle>
          <CardDescription>
            Your schedule for today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayClasses.map((classItem) => (
            <div key={classItem.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{classItem.subject}</h3>
                  <Badge variant="outline">{classItem.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{classItem.teacher}</p>
                <p className="text-sm text-muted-foreground">{classItem.topic}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm mb-1">
                  <Clock className="h-3 w-3" />
                  {classItem.time}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {classItem.room}
                </div>
              </div>
              <Button size="sm">Join Class</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card className="card-effect">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Your complete week schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {weekSchedule.map((day, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-medium text-lg">{day.day}</h3>
                <div className="grid gap-3">
                  {day.classes.map((classItem, classIndex) => (
                    <div key={classIndex} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <span className="font-medium">{classItem.subject}</span>
                          <p className="text-sm text-muted-foreground">{classItem.teacher}</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{classItem.time}</div>
                    </div>
                  ))}
                  {day.classes.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
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