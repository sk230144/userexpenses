Instructions on how to set up and run the project, along with examples for testing each API endpoint using Postman:

```markdown
# Expense Splitting API

This is an API for splitting expenses among users. It allows users to create expenses, retrieve individual and overall expenses, and download a balance sheet.

## Prerequisites

- Node.js 
- MongoDB
- Postman (or any other API testing tool)

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/expense-splitting-api.git
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Set up the MongoDB connection:
   - Open the `server.js` file.
   - Replace the `mongoURI` variable with your MongoDB connection URL.

4. Start the server:
   ```
   npm run dev
   ```

   The server will start running on `http://localhost:3000`.

## API Endpoints

### Create User

- URL: `POST /users`
- Request Body:
  ```json
  {
    "email": "john@example.com",
    "name": "John Doe",
    "mobileNumber": "1234567890"
  }
  ```
- Response: Created user object

### Retrieve User Details

- URL: `GET /users/:userId`
- Response: User object

### Add Expense

- URL: `POST /expenses`
- Request Body (Equal Split):
  ```json
  {
    "description": "Dinner at a restaurant",
    "totalAmount": 150,
    "paidBy": "user-id-1",
    "participants": ["user-id-1", "user-id-2", "user-id-3"],
    "splitMethod": "Equal"
  }
  ```
- Request Body (Exact Split):
  ```json
  {
    "description": "Road trip expenses",
    "totalAmount": 300,
    "paidBy": "user-id-2",
    "participants": ["user-id-1", "user-id-2", "user-id-3"],
    "splitMethod": "Exact",
    "splitDetails": [
      {
        "participant": "user-id-1",
        "amount": 100
      },
      {
        "participant": "user-id-2",
        "amount": 150
      },
      {
        "participant": "user-id-3",
        "amount": 50
      }
    ]
  }
  ```
- Request Body (Percentage Split):
  ```json
  {
    "description": "Gift for a friend",
    "totalAmount": 200,
    "paidBy": "user-id-3",
    "participants": ["user-id-1", "user-id-2", "user-id-3"],
    "splitMethod": "Percentage",
    "splitDetails": [
      {
        "participant": "user-id-1",
        "percentage": 25
      },
      {
        "participant": "user-id-2",
        "percentage": 25
      },
      {
        "participant": "user-id-3",
        "percentage": 50
      }
    ]
  }
  ```
- Response: Created expense object

### Retrieve Individual User Expenses

- URL: `GET /users/:userId/expenses`
- Response: Array of expenses where the user is a participant

### Retrieve Overall Expenses

- URL: `GET /expenses`
- Query Parameters:
  - `splitMethod`: Filter expenses by split method (e.g., `Equal`, `Exact`, `Percentage`)
  - `sort`: Sort expenses by a specific field (e.g., `totalAmount`, `-createdAt`)
  - `participant`: Filter expenses by participant's user ID
  - `paidBy`: Filter expenses by the payer's user ID
- Response: Array of expenses matching the filter criteria

### Download Balance Sheet

- URL: `GET /balance-sheet`
- Response: Downloadable CSV file containing the balance sheet data

## Testing with Postman

1. Open Postman and create a new request.

2. Set the request method (GET, POST) and enter the appropriate URL for the API endpoint you want to test.

3. If required, provide the necessary request body or query parameters.

4. Click on the "Send" button to send the request to the server.

5. Check the response body and status code to verify the API endpoint's behavior.

6. Repeat the steps for each API endpoint you want to test.

## Example Test Cases

Here are some example test cases you can use to verify the functionality of the API endpoints:

1. Create User:
   - Send a POST request to `/users` with a valid request body.
   - Verify that the response contains the created user object.

2. Retrieve User Details:
   - Send a GET request to `/users/:userId` with a valid user ID.
   - Verify that the response contains the user object.

3. Add Expense (Equal Split):
   - Send a POST request to `/expenses` with a valid request body for an equal split expense.
   - Verify that the response contains the created expense object.

4. Add Expense (Exact Split):
   - Send a POST request to `/expenses` with a valid request body for an exact split expense.
   - Verify that the response contains the created expense object.

5. Add Expense (Percentage Split):
   - Send a POST request to `/expenses` with a valid request body for a percentage split expense.
   - Verify that the response contains the created expense object.

6. Retrieve Individual User Expenses:
   - Send a GET request to `/users/:userId/expenses` with a valid user ID.
   - Verify that the response contains an array of expenses where the user is a participant.

7. Retrieve Overall Expenses:
   - Send a GET request to `/expenses` with different query parameters to filter and sort expenses.
   - Verify that the response contains an array of expenses matching the filter criteria.

8. Download Balance Sheet:
   - Send a GET request to `/balance-sheet`.
   - Verify that the response is a downloadable CSV file containing the balance sheet data.

## Feedback and Support

If you have any questions, feedback, or issues, please feel free to reach out to me at [risabht043@gmail.com](mailto:risabht043@gmail.com).

Happy expense splitting!
```

This README file provides detailed instructions on how to set up and run the Expense Splitting API project. It includes prerequisites, installation steps, and information about each API endpoint.

The README also includes examples for testing the API endpoints using Postman. It provides sample request bodies and instructions on how to send requests and verify the responses.

Additionally, the README lists some example test cases that users can use to verify the functionality of each API endpoint. These test cases cover different scenarios and ensure that the API endpoints are working as expected.

Finally, the README provides contact information for feedback and support, encouraging users to reach out if they have any questions or issues.

Feel free to customize the README file based on your specific project requirements and add any additional sections or information that you think would be helpful for users.
