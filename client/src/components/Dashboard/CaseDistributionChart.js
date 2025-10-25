import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, Box } from '@mui/material';

// Register the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CaseDistributionChart = ({ cases = [] }) => {
  // Process the case data to count statuses
  const statusCounts = cases.reduce((acc, currentCase) => {
    const status = currentCase.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}); // Example: { open: 10, closed: 5, in_progress: 3 }

  const chartData = {
    labels: Object.keys(statusCounts), // ['open', 'closed', 'in_progress']
    datasets: [
      {
        label: 'Number of Cases',
        data: Object.values(statusCounts), // [10, 5, 3]
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Greenish for open?
          'rgba(255, 99, 132, 0.6)',  // Reddish for closed?
          'rgba(255, 206, 86, 0.6)', // Yellowish for in_progress?
          'rgba(153, 102, 255, 0.6)', // Purple for other statuses?
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows setting height
    plugins: {
      legend: {
        position: 'top',
        display: false, // Hide legend if only one dataset
      },
      title: {
        display: false, // Title is handled by CardHeader
        text: 'Case Status Distribution',
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                 stepSize: 1 // Ensure y-axis shows whole numbers for counts
            }
        }
    }
  };

  return (
    <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardHeader title="Case Status Distribution"/>
        <CardContent>
             <Box sx={{ height: 300, position: 'relative' }}> {/* Set a fixed height */}
                <Bar options={options} data={chartData} />
             </Box>
        </CardContent>
    </Card>
  );
};

export default CaseDistributionChart;