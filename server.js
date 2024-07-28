const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// MongoDB connection URL
const mongoURI = 'mongodb+srv://risabht043:Skt230144@cluster0.x92qgkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
});

// User model
const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.json());

// Create user endpoint
app.post('/users', async (req, res) => {
  const { email, name, mobileNumber } = req.body;

  // Check if all required fields are provided
  if (!email || !name || !mobileNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create a new user
    const newUser = new User({
      email,
      name,
      mobileNumber,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve user details endpoint
app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Find the user with the specified ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Retrieve overall expenses with filtering and sorting
app.get('/expenses', async (req, res) => {
    try {
      const { splitMethod, sort, participant, paidBy } = req.query;
  
      // Build the query object based on the provided query parameters
      const query = {};
      if (splitMethod) {
        query.splitMethod = splitMethod;
      }
      if (participant) {
        query.participants = participant;
      }
      if (paidBy) {
        query.paidBy = paidBy;
      }
  
      // Find expenses based on the query object and apply sorting
      const expenses = await Expense.find(query).sort(sort);
  
      res.json(expenses);
    } catch (error) {
      console.error('Error retrieving expenses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



// Download balance sheet
app.get('/balance-sheet', async (req, res) => {
    try {
      // Retrieve all users
      const users = await User.find();
  
      // Initialize balance sheet data
      const balanceSheet = {};
  
      // Iterate over each user
      for (const user of users) {
        // Calculate total paid amount
        const totalPaid = await Expense.aggregate([
          { $match: { paidBy: user._id } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
  
        // Calculate total owed amount
        const totalOwed = await Expense.aggregate([
          { $match: { participants: user._id } },
          { $unwind: '$splitDetails' },
          { $match: { 'splitDetails.participant': user._id } },
          { $group: { _id: null, total: { $sum: '$splitDetails.amount' } } }
        ]);
  
        // Add user's balance information to the balance sheet
        balanceSheet[user.name] = {
          totalPaid: totalPaid.length > 0 ? totalPaid[0].total : 0,
          totalOwed: totalOwed.length > 0 ? totalOwed[0].total : 0
        };
      }
  
      // Generate CSV string from the balance sheet data
      const csvString = Object.entries(balanceSheet)
        .map(([name, { totalPaid, totalOwed }]) => `${name},${totalPaid},${totalOwed}`)
        .join('\n');
  
      // Set response headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="balance-sheet.csv"');
  
      // Send the CSV file as the response
      res.send(csvString);
    } catch (error) {
      console.error('Error generating balance sheet:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });







// Expense schema
const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    splitMethod: { type: String, enum: ['Equal', 'Exact', 'Percentage'], required: true },
    splitDetails: [
      {
        participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number },
        percentage: { type: Number },
      },
    ],
  });
  
  // Expense model
  const Expense = mongoose.model('Expense', expenseSchema);
  
  // Add expense endpoint
  app.post('/expenses', async (req, res) => {
    const { description, totalAmount, paidBy, participants, splitMethod, splitDetails } = req.body;
  
    // Check if all required fields are provided
    if (!description || !totalAmount || !paidBy || !participants || !splitMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      // Create a new expense
      const newExpense = new Expense({
        description,
        totalAmount,
        paidBy,
        participants,
        splitMethod,
        splitDetails,
      });
  
      // Validate split details based on the split method
      if (splitMethod === 'Equal') {
        const splitAmount = totalAmount / participants.length;
        newExpense.splitDetails = participants.map((participant) => ({
          participant,
          amount: splitAmount,
        }));
      } else if (splitMethod === 'Exact') {
        if (!splitDetails || splitDetails.length !== participants.length) {
          return res.status(400).json({ error: 'Invalid split details for Exact method' });
        }
        const totalSplitAmount = splitDetails.reduce((sum, detail) => sum + detail.amount, 0);
        if (totalSplitAmount !== totalAmount) {
          return res.status(400).json({ error: 'Split amounts do not add up to the total amount' });
        }
      } else if (splitMethod === 'Percentage') {
        if (!splitDetails || splitDetails.length !== participants.length) {
          return res.status(400).json({ error: 'Invalid split details for Percentage method' });
        }
        const totalPercentage = splitDetails.reduce((sum, detail) => sum + detail.percentage, 0);
        if (totalPercentage !== 100) {
          return res.status(400).json({ error: 'Percentages do not add up to 100%' });
        }
        newExpense.splitDetails = splitDetails.map((detail) => ({
          participant: detail.participant,
          amount: (totalAmount * detail.percentage) / 100,
        }));
      }
  
      // Save the expense to the database
      await newExpense.save();
  
      res.status(201).json(newExpense);
    } catch (error) {
      console.error('Error adding expense:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



  // Retrieve individual user expenses
app.get('/users/:userId/expenses', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      // Find expenses where the userId is present in the participants array
      const expenses = await Expense.find({ participants: userId });
  
      res.json(expenses);
    } catch (error) {
      console.error('Error retrieving user expenses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });














// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});