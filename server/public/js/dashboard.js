document.addEventListener("DOMContentLoaded", () => {
    const raw = document.getElementById("dashboard-data").textContent;
    const data = JSON.parse(raw);
  
    // Weekly Water Chart
    const waterCtx = document.getElementById("waterChart").getContext("2d");
    new Chart(waterCtx, {
      type: "bar",
      data: {
        labels: data.weeklyWater.data.map(item => item.dayName),
        datasets: [{
          label: 'Water Usage (L)',
          data: data.weeklyWater.data.map(item => item.totalLiters),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  
    // You can do similar for fuelChart and electricityChart
  });
  