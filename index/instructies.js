document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('progressChart').getContext('2d');

  // Labels per meetmoment
  const labels = Array.from({ length: 27 }, (_, i) => `Meetmoment ${i + 1}`);

  // Echte IPM-waarden (Anker 1)
  const ipmValues = [
    18, 20, 27, 33, 34, 34, 36, 34, 36, 39, 36, 44, 37,
    40, 42, 46, 43, 45, 49, 51, 48, 51, 54, 50, 52, 56, 47
  ];

  const data = {
    labels: labels,
    datasets: [{
      label: 'Woorden per minuut (IPM)',
      data: ipmValues,
      borderColor: '#01689B',
      backgroundColor: 'rgba(1, 104, 155, 0.1)',
      tension: 0.3,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#01689B',
      fill: true
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Woorden per minuut (IPM)',
            color: '#013A63'
          },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          title: { display: true, text: 'Meetmoment', color: '#013A63' },
          grid: { display: false }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Voortgang bij dagelijks oefenen (Anker 1)',
          color: '#013A63',
          font: { size: 18 }
        },
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.formattedValue} woorden per minuut`
          }
        }
      }
    }
  };

  new Chart(ctx, config);
});
