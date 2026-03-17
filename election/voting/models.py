from django.db import models

# Create your models here.
# voting/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

class Position(models.Model):
    """Election positions (President, Secretary, etc.)"""
    id = models.CharField(max_length=50, primary_key=True)  # e.g., "president"
    title = models.CharField(max_length=100)  # e.g., "School President"
    order = models.IntegerField(default=0)  # For display order
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.title

class Candidate(models.Model):
    """Candidates running for positions"""
    id = models.CharField(max_length=50, primary_key=True)  # e.g., "alex-johnson"
    name = models.CharField(max_length=100)
    photo = models.CharField(max_length=200, blank=True)  # URL or file path
    agenda = models.TextField()
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='candidates')
    
    def __str__(self):
        return f"{self.name} - {self.position.title}"

class Voter(models.Model):
    """Registered voters (students)"""
    DEPARTMENT_CHOICES = [
        ('Automative Engineering', 'Automative Engineering'),
        ('Agriculture Extensions', 'Agriculture Extensions'),
        ('Building and Construction', 'Building and Construction'),
        ('Beauty and Hairdressing', 'Beauty and Hairdressing'),
        ('Callinery Arts', 'Callinery Arts'),
        ('Computing and Informatics', 'Computing and Informatics'),
        ('Electrical Engineering', 'Electrical Engineering'),
        ('Fashion and Design', 'Fashion and Design'),
        ('Business and secretarial studies', 'Business and secretarial studies'),
        ('Human Resource Management', 'Human Resource Management'),
        ('Other', 'Other'),
    ]
    
    admission_number = models.CharField(max_length=20, unique=True)  # e.g., "NUU001"
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    has_voted = models.BooleanField(default=False)
    voted_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.admission_number} - {self.department}"

class Vote(models.Model):
    """Record of each vote cast"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    voter = models.ForeignKey(Voter, on_delete=models.CASCADE, related_name='votes')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    voted_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        # Ensure one vote per position per voter
        unique_together = ['voter', 'position']
    
    def __str__(self):
        return f"{self.voter.admission_number} voted for {self.candidate.name}"

class ElectionSettings(models.Model):
    """Global election settings"""
    is_voting_active = models.BooleanField(default=False)
    voting_start_date = models.DateTimeField(null=True, blank=True)
    voting_end_date = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Election settings"
    
    def __str__(self):
        return f"Voting {'Active' if self.is_voting_active else 'Inactive'}"

class Feedback(models.Model):
    """Student feedback"""
    DEPARTMENT_CHOICES = Voter.DEPARTMENT_CHOICES
    
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Feedback from {self.department} at {self.submitted_at}"