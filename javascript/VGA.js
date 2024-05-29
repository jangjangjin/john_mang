// 데이터 가져오는 부분 ----------------------------------

// 데이터베이스에서 CPU 데이터 가져오기
function fetchCpuData() {
  const cpuRef = db.ref("부품/0/VGA");
  cpuRef.once("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      displayCpuData(data);
    } else {
      console.log("No data available");
    }
  });
}

// CPU 데이터를 테이블에 표시하기
function displayCpuData(data) {
  const tableBody = document
    .getElementById("VGATable")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = ""; // 기존 데이터 초기화

  data.forEach((VGA) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = VGA["이름"];
    row.appendChild(nameCell);

    const manufacturerCell = document.createElement("td");
    manufacturerCell.textContent = VGA["제조사"];
    row.appendChild(manufacturerCell);

    const numCell = document.createElement("td");
    numCell.textContent = VGA["넘버링"];
    row.appendChild(numCell);

    const powerCell = document.createElement("td");
    powerCell.textContent = VGA["정격파워"];
    row.appendChild(powerCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = VGA["가격"];
    row.appendChild(priceCell);

    tableBody.appendChild(row);
  });
}

// 페이지 로드 시 CPU 데이터 가져오기
window.onload = fetchCpuData;
