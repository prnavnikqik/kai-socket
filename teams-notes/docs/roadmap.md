# Roadmap for Project Development

## Week 1: Build Mock Pipeline
- Develop the parser module to convert WebVTT files to JSON.
- Implement local storage functionality to save and retrieve JSON data.
- Set up the Express API server with basic endpoints.

## Week 2: Add Search Functionality and Tests
- Integrate search capabilities into the API for querying transcripts.
- Write unit tests for the parser to ensure accuracy in timestamp and speaker name parsing.
- Create integration tests for the API endpoints to validate responses.

## Week 3: Prepare for Graph Integration
- Stub functions for future integration with Microsoft Graph API.
- Ensure the existing API contract remains unchanged for seamless transition.

## Week 4: Transition to MongoDB Atlas
- Replace local JSON storage with MongoDB Atlas for data persistence.
- Test the new setup to confirm that all functionalities work as expected.

## Future Enhancements
- Implement AI-driven summaries of transcripts.
- Develop dashboards for visualizing transcript data and analytics.
- Explore additional features based on user feedback and requirements.