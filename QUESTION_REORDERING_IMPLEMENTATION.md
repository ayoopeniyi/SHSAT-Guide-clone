# Question Reordering Implementation for SHSAT Tests

## Overview

This implementation provides controlled question reordering for SHSAT tests, allowing teachers to manage the sequence of 114 questions with full validation and conflict resolution.

## Key Features

- **Individual Question Number Editing**: Teachers can edit individual question numbers with real-time conflict checking
- **Bulk Reordering**: Reorder up to 10 questions at a time with drag-and-drop interface
- **Validation System**: Comprehensive validation ensuring exactly 114 active questions with continuous numbering
- **Conflict Resolution**: Real-time conflict detection and resolution guidance
- **Activation/Deactivation**: Toggle questions between active and inactive states
- **Database Constraints**: Unique constraints prevent duplicate question numbers

## Architecture

### Database Layer

#### Constraints and Triggers
- **Unique Index**: Prevents duplicate question numbers among active questions
- **Range Check**: Ensures question numbers are between 1-114 for active questions
- **Modified Trigger**: Auto-renumbering only for non-editable tests

#### Key Functions
- `get_available_question_numbers()`: Returns available numbers (1-114)
- `validate_test_completeness()`: Validates test has exactly 114 active questions
- `batch_update_question_numbers()`: Atomic batch updates for reordering

### Backend API

#### Service Layer (`QuestionReorderingService`)
- **Validation**: Comprehensive test validation
- **Conflict Checking**: Real-time conflict detection
- **Batch Operations**: Atomic updates for multiple questions
- **Activation/Deactivation**: Manage question states

#### API Endpoints
- `GET /api/question-reordering/test/{test_id}/sequence` - Get question sequence
- `GET /api/question-reordering/test/{test_id}/available-numbers` - Get available numbers
- `GET /api/question-reordering/test/{test_id}/validation` - Validate test completeness
- `POST /api/question-reordering/check-conflict` - Check for conflicts
- `POST /api/question-reordering/batch-update` - Batch update question numbers
- `PUT /api/question-reordering/question/{question_id}/number` - Update single question

### Frontend Components

#### Core Components
1. **QuestionReorderingModal**: Bulk reordering interface (up to 10 questions)
2. **QuestionNumberEditor**: Individual question number editing
3. **TestValidationSummary**: Real-time validation status display

#### Integration Points
- **QuestionCard**: Added question number edit button (Hash icon)
- **TestPackDetail**: Integrated validation summary and reordering modals
- **TestPackQuestionsGrid**: Passes question number editing callbacks

## Usage Workflows

### Individual Question Number Editing

1. **Access**: Click the Hash icon (🔗) on any question card in test pack view
2. **Edit**: Enter new question number (1-114)
3. **Validation**: Real-time conflict checking
4. **Save**: Updates are applied atomically

### Bulk Question Reordering

1. **Access**: Click "Reorder Questions" button in test pack detail view
2. **Select**: Choose up to 10 questions to reorder
3. **Reorder**: Use drag-and-drop or manual number entry
4. **Validate**: System checks for conflicts and completeness
5. **Save**: All changes applied in single batch operation

### Test Validation

1. **Status Display**: Real-time validation summary shows:
   - Active question count (target: 114)
   - Missing question numbers
   - Duplicate numbers
   - Available numbers
2. **Issue Resolution**: Clear guidance on fixing validation errors
3. **Activation Readiness**: Indicates if test can be activated

## Validation Rules

### Required Conditions for Test Activation
- Exactly 114 active questions
- Continuous numbering from 1 to 114
- No duplicate question numbers
- No gaps in numbering sequence

### Conflict Resolution
- **Duplicate Numbers**: System shows conflicting question details
- **Out of Range**: Numbers must be 1-114
- **Missing Numbers**: System identifies gaps in sequence

## Error Handling

### Frontend Validation
- Real-time conflict checking with debouncing
- Clear error messages with specific guidance
- Visual indicators for validation status

### Backend Validation
- Database constraints prevent invalid states
- Atomic operations prevent partial updates
- Comprehensive error responses with details

## Performance Considerations

### Database Optimization
- Indexed queries for question number lookups
- Batch operations reduce database round trips
- Efficient conflict checking with targeted queries

### Frontend Optimization
- Debounced conflict checking (300ms delay)
- Lazy loading of validation data
- Optimistic updates with rollback capability

## Security and Data Integrity

### Database Constraints
- Unique index prevents race condition duplicates
- Check constraints enforce valid number ranges
- Foreign key constraints maintain referential integrity

### API Security
- Input validation on all endpoints
- Proper error handling without data leakage
- Transactional operations ensure consistency

## Testing Strategy

### Unit Tests
- Service layer validation logic
- Conflict detection algorithms
- Batch update operations

### Integration Tests
- API endpoint functionality
- Database constraint enforcement
- Frontend-backend integration

### End-to-End Tests
- Complete reordering workflows
- Validation scenarios
- Error handling paths

## Migration and Deployment

### Database Migration
```sql
-- Run the migration to add constraints and functions
-- File: app/db/migrations/add_question_reordering_constraints.sql
```

### Backend Deployment
1. Deploy new API routes
2. Register service in main.py
3. Test all endpoints

### Frontend Deployment
1. Deploy new components
2. Update existing components
3. Test integration points

## Monitoring and Maintenance

### Key Metrics
- Question reordering operation success rates
- Validation error frequencies
- API response times

### Maintenance Tasks
- Monitor constraint violations
- Review validation error patterns
- Optimize database queries as needed

## Future Enhancements

### Potential Features
- **Advanced Reordering**: Drag-and-drop for larger question sets
- **Template Support**: Save and reuse question sequences
- **Bulk Import**: Import question sequences from external sources
- **Audit Trail**: Track all reordering operations
- **Collaborative Editing**: Multiple teachers working on same test

### Performance Improvements
- **Caching**: Cache validation results
- **Optimistic Updates**: Reduce API calls with client-side validation
- **Incremental Loading**: Load question data on demand

## Troubleshooting

### Common Issues

#### Validation Errors
- **Missing Questions**: Ensure exactly 114 active questions
- **Duplicate Numbers**: Resolve conflicts before saving
- **Gaps in Sequence**: Fill missing numbers 1-114

#### Performance Issues
- **Slow Conflict Checking**: Check network connectivity
- **Large Test Packs**: Consider bulk operations for efficiency

#### UI Issues
- **Modal Not Opening**: Check component imports and props
- **Validation Not Updating**: Refresh page or clear cache

### Debug Information
- Check browser console for JavaScript errors
- Review API response logs for backend issues
- Verify database constraint violations

## Support and Documentation

### API Documentation
- Swagger UI available at `/docs`
- All endpoints documented with examples
- Error response formats specified

### Component Documentation
- TypeScript interfaces for all components
- Props documentation with examples
- Usage patterns and best practices

### Database Schema
- Complete schema documentation
- Constraint explanations
- Function descriptions and usage 