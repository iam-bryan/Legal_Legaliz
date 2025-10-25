import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Card, CardContent, CardHeader, Box } from '@mui/material';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const WorkloadChart = ({ workloadData = { labels: [], data: [] } }) => {

  const chartData = {
    labels: workloadData.labels, // Dates from API
    datasets: [
      {
        label: 'Cases Created',
        data: workloadData.data, // Counts from API
        fill: true, // Fill area under the line
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light fill color
        tension: 0.1 // Slight curve to the line
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend if only one dataset
      },
      title: {
        display: false,
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                 stepSize: 1 // Ensure y-axis shows whole numbers
            }
        },
        x: {
            ticks: {
                maxTicksLimit: 15 // Limit number of date labels shown for clarity
            }
        }
    }
  };

  return (
    <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardHeader title="New Cases (Last 30 Days)"/>
        <CardContent>
             <Box sx={{ height: 300, position: 'relative' }}>
                <Line options={options} data={chartData} />
             </Box>
        </CardContent>
    </Card>
  );
};

export default WorkloadChart;