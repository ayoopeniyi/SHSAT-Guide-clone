import React from 'react';
import { useActionTracking, useFormTracking, useButtonTracking } from '../lib/action-tracking';
import { usePageAnalytics } from '../components/PageAnalytics';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Example component showing comprehensive tracking implementation
export const TrackingImplementationExample: React.FC = () => {
  // Page analytics - automatically tracks page views
  usePageAnalytics('Tracking Example Page', 'demo', true, {
    user_role: 'teacher',
    page_purpose: 'demonstration'
  });

  const { 
    trackNavigation, 
    trackContentCreation, 
    trackButtonClick,
    trackSearchFilter,
    trackError,
    trackContentViewing 
  } = useActionTracking();

  const formTracking = useFormTracking('example_form');
  const buttonTracking = useButtonTracking();

  const handleNavigation = () => {
    trackNavigation('navigation_click', {
      from_page: 'example_page',
      to_page: 'target_page',
      button_name: 'example_nav_button'
    });
  };

  const handleQuestionCreation = () => {
    trackContentCreation('question', {
      content_type: 'MC',
      difficulty: 3,
      subject: 'Math',
      question_count: 1
    });
  };

  const handleSearch = () => {
    trackSearchFilter('search_performed', {
      search_term: 'example search',
      results_count: 25
    });
  };

  const handleFilter = () => {
    trackSearchFilter('filter_applied', {
      filter_criteria: {
        question_type: 'MC',
        difficulty: 'medium',
        subject: 'Math'
      },
      results_count: 15
    });
  };

  const handleError = () => {
    trackError('validation_error', {
      error_message: 'Example validation error',
      error_context: {
        field: 'email',
        value: 'invalid-email'
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    formTracking.trackFormSuccess();
  };

  const handleContentView = () => {
    trackContentViewing('question', {
      content_id: 123,
      content_type: 'MC',
      view_duration: 30,
      view_source: 'question_bank'
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Tracking Implementation Example</h2>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Navigation Tracking</h3>
        <Button onClick={handleNavigation}>
          Navigate to Another Page
        </Button>
        <Button onClick={buttonTracking.trackButton('example_button', { page: 'example', action: 'test' })}>
          Tracked Button
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Content Creation Tracking</h3>
        <Button onClick={handleQuestionCreation}>
          Create Question
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Search & Filter Tracking</h3>
        <Button onClick={handleSearch}>
          Perform Search
        </Button>
        <Button onClick={handleFilter}>
          Apply Filter
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Content Viewing Tracking</h3>
        <Button onClick={handleContentView}>
          View Question
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Error Tracking</h3>
        <Button onClick={handleError} variant="destructive">
          Simulate Error
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Form Tracking</h3>
        <form onSubmit={handleFormSubmit} className="space-y-2">
          <div>
            <Label htmlFor="example-input">Example Input</Label>
            <Input 
              id="example-input" 
              placeholder="Enter something..."
              onFocus={() => formTracking.trackFormStart()}
            />
          </div>
          <Button type="submit">Submit Form</Button>
        </form>
      </div>
    </div>
  );
};

// Example of how to add tracking to existing components
export const EnhancedQuestionCard: React.FC<{ questionId: number; questionType: string }> = ({ 
  questionId, 
  questionType 
}) => {
  const { trackContentViewing, trackButtonClick } = useActionTracking();

  const handleViewQuestion = () => {
    trackContentViewing('question', {
      content_id: questionId,
      content_type: questionType,
      view_source: 'question_card'
    });
  };

  const handleEditQuestion = () => {
    trackButtonClick('edit_question', {
      page: 'question_bank',
      action: 'edit',
      target_id: questionId
    });
  };

  return (
    <div className="border p-4 rounded">
      <h4>Question {questionId}</h4>
      <div className="space-x-2">
        <Button onClick={handleViewQuestion} size="sm">
          View
        </Button>
        <Button onClick={handleEditQuestion} size="sm" variant="outline">
          Edit
        </Button>
      </div>
    </div>
  );
}; 