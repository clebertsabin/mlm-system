const mongoose = require('mongoose');
require('dotenv').config();

// Define a test schema
const TestSchema = new mongoose.Schema({
  name: String,
  value: Number,
  createdAt: { type: Date, default: Date.now }
});

const Test = mongoose.model('Test', TestSchema);

async function testDatabaseOperations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test document
    const testDoc = await Test.create({
      name: 'Test Document',
      value: 42
    });
    console.log('Created document:', testDoc);

    // Read the document
    const foundDoc = await Test.findById(testDoc._id);
    console.log('Found document:', foundDoc);

    // Update the document
    const updatedDoc = await Test.findByIdAndUpdate(
      testDoc._id,
      { value: 43 },
      { new: true }
    );
    console.log('Updated document:', updatedDoc);

    // Delete the document
    await Test.findByIdAndDelete(testDoc._id);
    console.log('Deleted document');

    // Count remaining documents
    const count = await Test.countDocuments();
    console.log('Remaining documents:', count);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testDatabaseOperations(); 