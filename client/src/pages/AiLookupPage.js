import React, { useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button, TextField, Card, CardContent, CardHeader, Paper
} from '@mui/material';
import apiService from '../api/apiService'; // Ensure this path is correct
import SendIcon from '@mui/icons-material/Send'; // Icon for submit button

const AiLookupPage = () => {
  const [query, setQuery] = useState(''); // State for the input query
  const [response, setResponse] = useState(''); // State for the AI response
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(''); // State for error messages

  // Function to handle form submission
  const handleLookup = async (e) => {
    e.preventDefault(); // Prevent default browser form submission
    if (!query.trim()) { // Basic validation
      setError("Please enter a query.");
      return;
    }
    setLoading(true); // Show loading indicator
    setError(''); // Clear previous errors
    setResponse(''); // Clear previous response

    try {
      // Call the API service function
      const res = await apiService.getAiLookup(query);
      // Update state with the response text
      setResponse(res.data.response || 'No valid response text received from AI.');
    } catch (err) {
      // Handle errors from the API call
      setError(err.response?.data?.message || 'Failed to get AI response. Check API key and implementation.');
      console.error("AI Lookup Error:", err.response || err);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        AI Legal Case Lookup
      </Typography>

      {/* Query Input Card */}
      <Card sx={{ borderRadius: '12px', boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Enter Your Query</Typography>
          {/* Use Box as form to prevent default reload but allow submit on Enter */}
          <Box component="form" onSubmit={handleLookup} noValidate>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Ask about legal precedents, case summaries, interpretations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              margin="normal"
              disabled={loading} // Disable input while loading
            />
            {/* Display submission errors */}
            {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
            <Button
              type="submit" // Allows submitting with Enter key in TextField
              variant="contained"
              disabled={loading || !query.trim()} // Disable if loading or query is empty
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ mt: 1 }}
            >
              {loading ? 'Searching...' : 'Submit Query'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Response Display Card (only shown if there's a response) */}
      {response && (
        <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
          <CardHeader title="AI Response" />
          <CardContent>
            {/* Use Paper for visual separation and pre-wrap for formatting */}
            <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.100', whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto' }}>
              <Typography variant="body1">{response}</Typography>
            </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AiLookupPage;