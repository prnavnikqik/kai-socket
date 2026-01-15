# Project Title: Teams Transcript Automation

## Overview
This project aims to automate the process of capturing and managing meeting transcripts from Microsoft Teams. It simulates the flow of data from mock WebVTT files to a structured JSON format, stored locally, and exposes an API for retrieval and search functionalities.

## Features
- **Mock Data**: Sample WebVTT files that imitate Teams transcripts.
- **Transcript Processing**: A service that reads, parses, and converts transcripts into structured JSON.
- **API Server**: An Express-based API for accessing transcripts and performing searches.
- **Testing**: Unit and integration tests to ensure functionality and reliability.

## Project Structure
```
teams-notes
├── mock_data           # Contains sample WebVTT files
│   ├── sample1.vtt
│   └── sample2.vtt
├── services            # Core services for parsing and storage
│   ├── parser.js
│   ├── storage.js
│   └── server.js
├── data                # Stores structured JSON data
│   └── transcripts.json
├── tests               # Contains test files for validation
│   ├── parser.test.js
│   └── api.test.js
├── docs                # Documentation files
│   ├── architecture.md
│   ├── roadmap.md
│   └── cost-analysis.md
├── package.json        # Project metadata and dependencies
├── .gitignore          # Files to ignore in version control
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd teams-notes
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Usage
1. Start the server:
   ```
   npm start
   ```
2. Access the API at `http://localhost:3000/transcripts` to list all transcripts or use the search endpoint `http://localhost:3000/search?q=<keyword>`.

### Running Tests
To run the tests, use the following command:
```
npm test
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.