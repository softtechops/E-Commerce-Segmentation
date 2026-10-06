import React, { useEffect, useRef } from 'react';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  DoughnutController,
  BarController,
  PieController
} from 'chart.js';

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  DoughnutController,
  BarController,
  PieController
);

export default function ChartComponent({ type = 'doughnut', data, options = {}, style = {} }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#6B6B6B',
            font: {
              family: "'DM Sans', sans-serif",
              size: 11.5,
              weight: 500
            },
            padding: 12,
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#17201C',
          titleColor: '#F7F5F0',
          bodyColor: '#D1D5DB',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1,
          padding: 8,
          cornerRadius: 4,
          boxPadding: 4,
          titleFont: { family: "'DM Sans', sans-serif", size: 11.5, weight: 600 },
          bodyFont: { family: "'DM Sans', sans-serif", size: 11 }
        }
      },
      scales: type === 'bar' ? {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#8E8E93',
            font: { family: "'DM Sans', sans-serif", size: 11 }
          },
          border: {
            color: '#E5E0D6'
          }
        },
        y: {
          grid: {
            color: '#EDE8DF',
            drawBorder: false
          },
          ticks: {
            color: '#8E8E93',
            font: { family: "'DM Sans', sans-serif", size: 11 },
            precision: 0
          },
          border: {
            display: false
          }
        }
      } : {}
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      plugins: {
        ...defaultOptions.plugins,
        ...(options.plugins || {})
      },
      scales: options.scales || defaultOptions.scales
    };

    chartInstanceRef.current = new Chart(ctx, {
      type,
      data,
      options: mergedOptions
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '180px', ...style }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
