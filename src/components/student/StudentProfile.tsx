import React, { useState } from 'react';
import { AuthContext } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { User, Mail, Phone, GraduationCap, Save, Camera, Trophy, BookOpen, Target } from 'lucide-react';

export function StudentProfile() {
  const { user } = React.useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    grade: user?.grade || '',
    parentEmail: user?.parentEmail || '',
    parentPhone: user?.parentPhone || '',
    bio: 'I love learning new things, especially mathematics! My goal is to improve my problem-solving skills.',
    interests: ['Mathematics', 'Science', 'Reading'],
    learningGoals: 'Improve in algebra and geometry'
  });

  const handleSave = () => {
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const stats = [
    { label: 'Assignments Completed', value: '45', color: 'bg-blue-500' },
    { label: 'Current Grade Average', value: 'B+', color: 'bg-green-500' },
    { label: 'Subjects Enrolled', value: '6', color: 'bg-purple-500' },
    { label: 'Days Streak', value: '12', color: 'bg-orange-500' },
  ];

  const subjects = [
    { name: 'Mathematics', grade: 'A-', progress: 85 },
    { name: 'Science', grade: 'B+', progress: 78 },
    { name: 'English', grade: 'A', progress: 92 },
    { name: 'Social Studies', grade: 'B', progress: 74 },
    { name: 'Physics', grade: 'B+', progress: 81 },
    { name: 'Chemistry', grade: 'A-', progress: 88 }
  ];

  const achievements = [
    {
      title: 'Math Star',
      description: 'Scored 90+ in 3 consecutive math assignments',
      date: '2 days ago',
      icon: '⭐',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Quick Learner',
      description: 'Completed 5 assignments in one week',
      date: '1 week ago',
      icon: '🚀',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Problem Solver',
      description: 'Solved 20 complex word problems',
      date: '2 weeks ago',
      icon: '🧩',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Consistent Performer',
      description: 'Maintained B+ average for 2 months',
      date: '1 month ago',
      icon: '📈',
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your student profile information
          </p>
        </div>
        <Button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src="" alt={formData.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {formData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}

                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardTitle className="mt-4">{formData.name}</CardTitle>
              <CardDescription>{formData.grade}</CardDescription>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {formData.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <Badge variant="outline">{stat.value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => handleInputChange('grade', e.target.value)}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Parent's Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="parentPhone">Parent's Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">About Me</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself, your interests, and goals..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learningGoals">Learning Goals</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="learningGoals"
                      value={formData.learningGoals}
                      onChange={(e) => handleInputChange('learningGoals', e.target.value)}
                      className="pl-10"
                      disabled={!isEditing}
                      placeholder="What do you want to achieve this year?"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Performance
              </CardTitle>
              <CardDescription>
                Your current grades and progress in each subject
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{subject.name}</span>
                    <Badge variant={subject.grade.startsWith('A') ? 'default' : 'secondary'}>
                      {subject.grade}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={subject.progress} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-12">
                      {subject.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                My Achievements
              </CardTitle>
              <CardDescription>
                Your accomplishments and milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`p-4 rounded-lg ${achievement.color}`}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{achievement.title}</h3>
                        <p className="text-sm opacity-80 mb-1">
                          {achievement.description}
                        </p>
                        <p className="text-xs opacity-70">{achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}