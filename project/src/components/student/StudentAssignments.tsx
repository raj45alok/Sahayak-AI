import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';

export function StudentAssignments() {
  const assignments = [
    {
      id: 1,
      title: 'Algebra Practice Worksheet',
      subject: 'Mathematics',
      dueDate: 'Tomorrow',
      status: 'pending',
      score: null,
      description: 'Complete exercises 1-20 on linear equations'
    },
    {
      id: 2,
      title: 'Geometry Quiz',
      subject: 'Mathematics',
      dueDate: '2 days ago',
      status: 'completed',
      score: 85,
      description: 'Quiz on triangles and quadrilaterals'
    },
    {
      id: 3,
      title: 'Fractions Assessment',
      subject: 'Mathematics',
      dueDate: '1 week ago',
      status: 'completed',
      score: 92,
      description: 'Assessment on adding and subtracting fractions'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>My Assignments</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your assignments
        </p>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="card-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription>{assignment.subject}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Due: {assignment.dueDate}
                  </Badge>
                  <Badge 
                    variant={assignment.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {assignment.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{assignment.description}</p>
              <div className="flex items-center justify-between">
                {assignment.score ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      Score: {assignment.score}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-600">Pending</span>
                  </div>
                )}
                <Button variant={assignment.status === 'completed' ? 'outline' : 'default'}>
                  {assignment.status === 'completed' ? 'Review' : 'Start'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}